module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        order_number: { type: DataTypes.STRING(50), unique: true, allowNull: false },
        customer_name: { type: DataTypes.STRING(100), allowNull: false },
        customer_whatsapp: { type: DataTypes.STRING(20), allowNull: false },
        fulfillment_method: { type: DataTypes.ENUM('pickup', 'delivery'), allowNull: false },
        order_status: {
            type: DataTypes.ENUM('pending', 'prepared', 'ready_to_pickup', 'shipped', 'completed', 'cancelled'),
            allowNull: false
        },
        total_amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, { tableName: 'orders', timestamps: false });

    Order.associate = (models) => {
        Order.hasMany(models.OrderItem, { foreignKey: 'order_id' });
        Order.hasOne(models.Payment, { foreignKey: 'order_id' });
    };

    return Order;
};