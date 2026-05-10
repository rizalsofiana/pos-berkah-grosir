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
            item_details: itemDetails,
            usage_limit: 1
        };

        console.log("Payload ke Midtrans:", JSON.stringify(parameter, null, 2));

        const transaction = await midtrans.snap.createTransaction(parameter);
        console.log(transaction);
        return transaction;
    } catch (error) {
        const errorMessage = error.ApiResponse ? JSON.stringify(error.ApiResponse) : error.message;
        console.error('Midtrans Service Error Detail:', errorMessage);
        throw new Error(errorMessage);
    }
};

const getTransactionStatus = async (orderId) => {
    return await midtrans.coreApi.transaction.status(orderId);
};

module.exports = { createSnapTransaction, getTransactionStatus };