const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Category = db.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false }
}, { tableName: 'categories', timestamps: false });

module.exports = Category;