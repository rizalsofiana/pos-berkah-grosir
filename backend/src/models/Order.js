const { DataTypes } = require('sequelize');
const db = require('../config/db');
const { FULFILLMENT_METHODS, ORDER_STATUS } = require('../constants');

const Order = db.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_number: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    customer_name: { type: DataTypes.STRING(100), allowNull: false },
    customer_whatsapp: { type: DataTypes.STRING(20), allowNull: false },
    fulfillment_method: {
        type: DataTypes.ENUM(FULFILLMENT_METHODS.PICKUP, FULFILLMENT_METHODS.DELIVERY),
        allowNull: false
    },
    order_status: {
        type: DataTypes.ENUM(
            ORDER_STATUS.PENDING, ORDER_STATUS.PREPARED, ORDER_STATUS.READY_TO_PICKUP,
            ORDER_STATUS.SHIPPED, ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED
        ),
        allowNull: false
    },
    total_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'orders', timestamps: false });

module.exports = Order;