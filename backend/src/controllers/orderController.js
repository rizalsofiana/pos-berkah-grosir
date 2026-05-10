const { sequelize, Order, OrderItem, Product, ProductUnit, Payment } = require('../models');
const { updateStock } = require('../services/stockService');
const { createSnapTransaction } = require('../services/midtransService');
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../constants');
const { successResponse, errorResponse, generateInvoiceNumber } = require('../utils');

const createOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            customer_name,
            customer_whatsapp,
            fulfillment_method,
            payment_method,
            amount_paid,
            items
        } = req.body;

        // ... (kode generate invoice tetap sama)
        const todayOrderCount = await Order.count();
        const orderNumber = generateInvoiceNumber(todayOrderCount);

        const order = await Order.create({
            order_number: orderNumber,
            customer_name,
            customer_whatsapp,
            fulfillment_method,
            order_status: ORDER_STATUS.PENDING,
            total_amount: 0,
            change_amount: 0
        }, { transaction: t });

        let totalAmount = 0;
        const orderItemsData = [];
        const midtransItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id, { transaction: t });
            const unit = await ProductUnit.findByPk(item.unit_id, { transaction: t });

            if (!product || !unit) throw new Error(`Produk atau Satuan tidak valid`);

            const subTotal = Number(item.qty) * Number(item.price_per_unit);
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

            // Midtrans butuh harga bulat (integer)
            midtransItems.push({
                id: `PROD-${product.id}`,
                price: Math.round(Number(item.price_per_unit)),
                quantity: Number(item.qty),
                name: `${product.name.substring(0, 45)}` // Nama maksimal 50 karakter
            });

            totalAmount += subTotal;
        }

        let changeAmount = 0;
        // NORMALISASI CEK: Cash
        if (payment_method === 'cash' || payment_method === PAYMENT_METHODS.CASH) {
            if (Number(amount_paid) < totalAmount) {
                throw new Error(`Uang dibayarkan kurang!`);
            }
            changeAmount = Number(amount_paid) - totalAmount;

            // Jika cash, status bisa langsung completed (opsional, tergantung kebijakanmu)
            // await order.update({ order_status: 'completed' }, { transaction: t });
        }

        await order.update({
            total_amount: totalAmount,
            change_amount: changeAmount
        }, { transaction: t });

        await OrderItem.bulkCreate(orderItemsData, { transaction: t });

        let paymentData = {
            order_id: order.id,
            payment_method: payment_method,
            payment_status: (payment_method === 'cash') ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.UNPAID,
            midtrans_id: '',
            midtrans_paid_token: ''
        };

        // NORMALISASI CEK: Midtrans
        // Kita cek apakah payment_method mengandung kata 'midtrans'
        if (payment_method === 'midtrans_online' || payment_method === PAYMENT_METHODS.MIDTRANS_ONLINE) {
            const snapResponse = await createSnapTransaction(order, {
                name: customer_name,
                whatsapp: customer_whatsapp
            }, midtransItems);

            if (snapResponse && snapResponse.token) {
                paymentData.midtrans_paid_token = snapResponse.token;
                paymentData.midtrans_id = orderNumber;
            } else {
                throw new Error("Gagal mendapatkan token dari Midtrans");
            }
        }

        const payment = await Payment.create(paymentData, { transaction: t });

        await t.commit();

        return successResponse(res, 'Pesanan berhasil dibuat', {
            order: {
                ...order.toJSON(),
                total_amount: totalAmount,
                change_amount: changeAmount
            },
            payment_token: payment.midtrans_paid_token,
            redirect_url: payment.midtrans_paid_token ? `https://app.sandbox.midtrans.com/snap/v2/vtweb/${payment.midtrans_paid_token}` : null
        }, 201);

    } catch (error) {
        if (t) await t.rollback();
        console.error("CREATE ORDER ERROR:", error);
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