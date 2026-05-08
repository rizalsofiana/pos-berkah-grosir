const { DataTypes } = require('sequelize');
const db = require('../config/db');

const ProductPrice = db.define('ProductPrice', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    unit_id: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    min_qty: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'product_prices', timestamps: false });

module.exports = ProductPrice;