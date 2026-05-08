const { midtrans } = require('../config');

const createSnapTransaction = async (order, customerDetails, itemDetails) => {
    try {
        const parameter = {
            transaction_details: {
                order_id: order.order_number,
                gross_amount: Math.round(order.total_amount),
            },
            customer_details: {
                first_name: customerDetails.name,
                phone: customerDetails.whatsapp,
            },
            item_details: itemDetails.map(item => ({
                id: item.product_id,
                price: Math.round(item.price_per_unit),
                quantity: item.qty,
                name: item.product_name,
            })),
            usage_limit: 1
        };

        const transaction = await midtrans.snap.createTransaction(parameter);
        return transaction;
    } catch (error) {
        console.error('Midtrans Service Error:', error);
        throw error;
    }
};

const getTransactionStatus = async (orderId) => {
    return await midtrans.coreApi.transaction.status(orderId);
};

module.exports = { createSnapTransaction, getTransactionStatus };