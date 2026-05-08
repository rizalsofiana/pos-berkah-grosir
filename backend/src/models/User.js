const { DataTypes } = require('sequelize');
const db = require('../config/db');

const User = db.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(100), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('owner', 'admin', 'cashier'), allowNull: false }
}, { tableName: 'users', timestamps: false });

module.exports = User;