const { errorResponse } = require('../utils');

const validateOrder = (req, res, next) => {
    const { customer_name, customer_whatsapp, items, fulfillment_method } = req.body;

    if (!customer_name || !customer_whatsapp || !items || items.length === 0) {
        return errorResponse(res, 'Data pesanan tidak lengkap', 400);
    }

    if (!['pickup', 'delivery'].includes(fulfillment_method)) {
        return errorResponse(res, 'Metode pengambilan tidak valid', 400);
    }

    next();
};

module.exports = { validateOrder };