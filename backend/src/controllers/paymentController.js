const { Order, Payment, db } = require('../models');
const { updateStock } = require('../services/stockService');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants');
const { getTransactionStatus } = require('../services/midtransService');

const handleMidtransNotification = async (req, res) => {
    const t = await db.transaction();
    try {
        const statusResponse = await getTransactionStatus(req.body.order_id);

        const orderNumber = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        const order = await Order.findOne({
            where: { order_number: orderNumber },
            include: [{ model: Payment }]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order tidak ditemukan' });
        }

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || fraudStatus === undefined) {
                await order.update({ order_status: ORDER_STATUS.READY_TO_PICKUP }, { transaction: t });
                await order.Payment.update({
                    payment_status: PAYMENT_STATUS.PAID,
                    paid_at: new Date()
                }, { transaction: t });
            }
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {

            await order.update({ order_status: ORDER_STATUS.CANCELLED }, { transaction: t });
            await order.Payment.update({ payment_status: PAYMENT_STATUS.FAILED }, { transaction: t });

            const items = await order.getOrderItems();
            for (const item of items) {
                await updateStock(item.product_id, item.total_pcs, 'in', `Pembatalan/Expired Order ${orderNumber}`, t);
            }
        }

        await t.commit();
        return res.status(200).send('OK');

    } catch (error) {
        await t.rollback();
        console.error('Midtrans Webhook Error:', error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { handleMidtransNotification };