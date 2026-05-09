module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define('OrderItem', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        order_id: { type: DataTypes.INTEGER, allowNull: false },
        product_id: { type: DataTypes.INTEGER, allowNull: false },
        unit_id: { type: DataTypes.INTEGER, allowNull: false },
        qty: { type: DataTypes.INTEGER, allowNull: false },
        price_per_unit: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
        total_pcs: { type: DataTypes.INTEGER, allowNull: false },
        sub_total: { type: DataTypes.DECIMAL(15, 2), allowNull: false }
    }, { tableName: 'order_items', timestamps: false });

    OrderItem.associate = (models) => {
        OrderItem.belongsTo(models.Order, { foreignKey: 'order_id' });
        OrderItem.belongsTo(models.Product, { foreignKey: 'product_id' });
        OrderItem.belongsTo(models.ProductUnit, { foreignKey: 'unit_id' });
    };

    return OrderItem;
};