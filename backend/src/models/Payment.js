module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        order_id: { type: DataTypes.INTEGER, allowNull: false },
        payment_method: {
            type: DataTypes.ENUM('cash', 'midtrans_online', 'qris_offline'),
            allowNull: false
        },
        payment_status: {
            type: DataTypes.ENUM('unpaid', 'pending', 'paid', 'expired', 'failed'),
            allowNull: false
        },
        midtrans_paid_token: { type: DataTypes.STRING(255), allowNull: false },
        midtrans_id: { type: DataTypes.STRING(255), allowNull: false },
        paid_at: { type: DataTypes.DATE, allowNull: true }
    }, { tableName: 'payments', timestamps: false });

    Payment.associate = (models) => {
        Payment.belongsTo(models.Order, { foreignKey: 'order_id' });
    };

    return Payment;
};