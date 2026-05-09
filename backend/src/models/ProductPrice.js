module.exports = (sequelize, DataTypes) => {
    const ProductPrice = sequelize.define('ProductPrice', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        unit_id: { type: DataTypes.INTEGER, allowNull: false },
        price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
        min_qty: { type: DataTypes.INTEGER, allowNull: false }
    }, { tableName: 'product_prices', timestamps: false });

    ProductPrice.associate = (models) => {
        ProductPrice.belongsTo(models.ProductUnit, { foreignKey: 'unit_id' });
    };

    return ProductPrice;
};