const ORDER_STATUS = require('./orderStatus');
const PAYMENT_STATUS = require('./paymentStatus');
const PAYMENT_METHODS = require('./paymentMethods');

const FULFILLMENT_METHODS = {
    PICKUP: 'pickup',
    DELIVERY: 'delivery'
};

module.exports = {
    ORDER_STATUS,
    PAYMENT_STATUS,
    PAYMENT_METHODS,
    FULFILLMENT_METHODS
};