const { Product, StockLog, db } = require('../models');

const updateStock = async (productId, amountInPcs, type, reason, transaction) => {
    const product = await Product.findByPk(productId, { transaction });
    if (!product) throw new Error('Produk tidak ditemukan');

    let newStock;
    if (type === 'in') {
        newStock = product.current_stock_in_pcs + amountInPcs;
    } else {
        if (product.current_stock_in_pcs < amountInPcs) {
            throw new Error(`Stok tidak mencukupi untuk produk: ${product.name}`);
        }
        newStock = product.current_stock_in_pcs - amountInPcs;
    }

    await product.update({ current_stock_in_pcs: newStock }, { transaction });

    await StockLog.create({
        product_id: productId,
        type,
        amount_in_pcs: amountInPcs,
        reason
    }, { transaction });

    return product;
};

module.exports = { updateStock };