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

            const itemPrice = Math.round(Number(item.price_per_unit));
            const itemQty = Number(item.qty);
            const subTotal = itemPrice * itemQty;

            const totalPcs = itemQty * unit.conversion_factor;

            await updateStock(item.product_id, totalPcs, 'out', `Penjualan ${orderNumber}`, t);

            orderItemsData.push({
                order_id: order.id,
                product_id: item.product_id,
                unit_id: item.unit_id,
                qty: itemQty,
                price_per_unit: itemPrice,
                total_pcs: totalPcs,
                sub_total: subTotal
            });

            // 2. Siapkan data item untuk Midtrans (Sesuai spesifikasi API mereka)
            midtransItems.push({
                id: `PROD-${product.id}`,
                price: itemPrice,
                quantity: itemQty,
                name: (item.name || product.name).substring(0, 50)
            });

            totalAmount += subTotal;
        }

        console.log("Midtrans items:", JSON.stringify(midtransItems, null, 2));
        console.log("Total amount:", totalAmount);

        let changeAmount = 0;
        if (payment_method === 'cash' || payment_method === PAYMENT_METHODS.CASH) {
            if (Number(amount_paid) < totalAmount) {
                throw new Error(`Uang dibayarkan (${amount_paid}) kurang dari total (${totalAmount})!`);
            }
            changeAmount = Number(amount_paid) - totalAmount;
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

        if (payment_method === 'midtrans_online' || payment_method === PAYMENT_METHODS.MIDTRANS_ONLINE) {
            const snapResponse = await createSnapTransaction(order, {
                name: customer_name,
                whatsapp: customer_whatsapp
            }, midtransItems);

            console.log("Snap response: " + snapResponse);


            if (snapResponse && snapResponse.token) {
                paymentData.midtrans_paid_token = snapResponse.token;
                paymentData.midtrans_id = orderNumber;

                const payment = await Payment.create(paymentData, { transaction: t });

                await t.commit();

                return successResponse(res, 'Pesanan berhasil dibuat', {
                    order: order,
                    snap_token: snapResponse ? snapResponse.token : null,
                    redirect_url: snapResponse ? snapResponse.redirect_url : null
                }, 201);
            } else {
                throw new Error("Gagal mendapatkan token dari Midtrans");
            }
        }

        const payment = await Payment.create(paymentData, { transaction: t });

        await t.commit();

        return successResponse(res, 'Pesanan berhasil dibuat', {
            order: order,
            snap_token: snapResponse ? snapResponse.token : null,
            redirect_url: snapResponse ? snapResponse.redirect_url : null
        }, 201);

    } catch (error) {
        if (t && !t.finished) {
            await t.rollback();
        }
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