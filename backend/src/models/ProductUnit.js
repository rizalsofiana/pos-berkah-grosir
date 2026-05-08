const { DataTypes } = require('sequelize');
const db = require('../config/db');

const ProductUnit = db.define('ProductUnit', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    unit_name: { type: DataTypes.STRING(20), allowNull: false },
    conversion_factor: { type: DataTypes.INTEGER, allowNull: false },
    is_default_selling: { type: DataTypes.BOOLEAN, allowNull: false }
}, { tableName: 'product_units', timestamps: false });

module.exports = ProductUnit;