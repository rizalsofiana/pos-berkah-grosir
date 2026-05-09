const { db, Order, OrderItem, Product, ProductUnit, Payment } = require('../models');
const { updateStock } = require('../services/stockService');
const { createSnapTransaction } = require('../services/midtransService');
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../constants');
const { successResponse, errorResponse, generateInvoiceNumber } = require('../utils');

const createOrder = async (req, res) => {
    const t = await db.transaction();
    try {
        const {
            customer_name,
            customer_whatsapp,
            fulfillment_method,
            payment_method,
            items
        } = req.body;

        const todayOrderCount = await Order.count();
        const orderNumber = generateInvoiceNumber(todayOrderCount);

        const order = await Order.create({
            order_number: orderNumber,
            customer_name,
            customer_whatsapp,
            fulfillment_method,
            order_status: ORDER_STATUS.PENDING,
            total_amount: 0
        }, { transaction: t });

        let totalAmount = 0;
        const orderItemsData = [];
        const midtransItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id, { transaction: t });
            const unit = await ProductUnit.findByPk(item.unit_id, { transaction: t });

            if (!product || !unit) throw new Error(`Produk atau Satuan tidak valid`);

            const subTotal = item.qty * item.price_per_unit;
            const totalPcs = item.qty * unit.conversion_factor;

            await updateStock(item.product_id, totalPcs, 'out', `Penjualan ${orderNumber}`, t);

            orderItemsData.push({
                order_id: order.id,
                product_id: item.product_id,
                unit_id: item.unit_id,
                qty: item.qty,
                price_per_unit: item.price_per_unit,
                total_pcs: totalPcs,
                sub_total: subTotal
            });

            midtransItems.push({
                id: product.sku,
                price: Math.round(item.price_per_unit),
                quantity: item.qty,
                name: `${product.name} (${unit.unit_name})`
            });

            totalAmount += subTotal;
        }

        await order.update({ total_amount: totalAmount }, { transaction: t });

        await OrderItem.bulkCreate(orderItemsData, { transaction: t });

        let paymentData = {
            order_id: order.id,
            payment_method: payment_method || PAYMENT_METHODS.MIDTRANS_ONLINE,
            payment_status: PAYMENT_STATUS.UNPAID,
            midtrans_id: '',
            midtrans_paid_token: ''
        };

        if (payment_method === PAYMENT_METHODS.MIDTRANS_ONLINE) {
            const snapResponse = await createSnapTransaction(order, {
                name: customer_name,
                whatsapp: customer_whatsapp
            }, midtransItems);

            paymentData.midtrans_paid_token = snapResponse.token;
            paymentData.midtrans_id = orderNumber;
        }

        const payment = await Payment.create(paymentData, { transaction: t });

        await t.commit();

        return successResponse(res, 'Pesanan berhasil dibuat', {
            order,
            payment_token: payment.midtrans_paid_token,
            redirect_url: payment.midtrans_paid_token ? `https://app.sandbox.midtrans.com/snap/v2/vtweb/${payment.midtrans_paid_token}` : null
        }, 201);

    } catch (error) {
        await t.rollback();
        return errorResponse(res, error.message);
    }
};

const getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: OrderItem, include: [Product, ProductUnit] },
                { model: Payment }
            ],
            order: [['created_at', 'DESC']]
        });
        return successResponse(res, 'Riwayat pesanan berhasil dimuat', orders);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

module.exports = { createOrder, getOrderHistory };