const sequelize = require('./db');
const { snap, coreApi } = require('./midtrans');

module.exports = {
    db: sequelize,
    midtrans: { snap, coreApi },
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET
};