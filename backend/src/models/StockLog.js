const { DataTypes } = require('sequelize');
const db = require('../config/db');

const StockLog = db.define('StockLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('in', 'out'), allowNull: false },
    amount_in_pcs: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.STRING(255), allowNull: false }
}, { tableName: 'stock_logs', timestamps: false });

module.exports = StockLog;