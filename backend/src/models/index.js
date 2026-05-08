const Category = require('./Category');
const Product = require('./Product');
const ProductUnit = require('./ProductUnit');
const ProductPrice = require('./ProductPrice');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const StockLog = require('./StockLog');
const User = require('./User');

Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

Product.hasMany(ProductUnit, { foreignKey: 'product_id' });
ProductUnit.belongsTo(Product, { foreignKey: 'product_id' });

ProductUnit.hasMany(ProductPrice, { foreignKey: 'unit_id' });
ProductPrice.belongsTo(ProductUnit, { foreignKey: 'unit_id' });

Product.hasMany(StockLog, { foreignKey: 'product_id' });
StockLog.belongsTo(Product, { foreignKey: 'product_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

ProductUnit.hasMany(OrderItem, { foreignKey: 'unit_id' });
OrderItem.belongsTo(ProductUnit, { foreignKey: 'unit_id' });

Order.hasOne(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = {
    Category,
    Product,
    ProductUnit,
    ProductPrice,
    Order,
    OrderItem,
    Payment,
    StockLog,
    User
};