const { DataTypes } = require('sequelize');
const db = require('../config/db');

const OrderItem = db.define('OrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    unit_id: { type: DataTypes.INTEGER, allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false },
    price_per_unit: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    total_pcs: { type: DataTypes.INTEGER, allowNull: false },
    sub_total: { type: DataTypes.DECIMAL(15, 2), allowNull: false }
}, { tableName: 'order_items', timestamps: false });

module.exports = OrderItem;