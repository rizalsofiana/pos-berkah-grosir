module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        category_id: { type: DataTypes.INTEGER, allowNull: false },
        sku: { type: DataTypes.STRING(50), unique: true, allowNull: false },
        name: { type: DataTypes.STRING(255), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        base_price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
        current_stock_in_pcs: { type: DataTypes.INTEGER, allowNull: false },
        min_stock_limit: { type: DataTypes.INTEGER, allowNull: false },
        deleted_at: { type: DataTypes.DATE, allowNull: true }
    }, { tableName: 'products', timestamps: false });

    Product.associate = (models) => {
        Product.belongsTo(models.Category, { foreignKey: 'category_id' });
        Product.hasMany(models.ProductUnit, { foreignKey: 'product_id' });
        Product.hasMany(models.StockLog, { foreignKey: 'product_id' });
    };

    return Product;
};