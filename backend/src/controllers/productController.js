const { db, Product, ProductUnit, ProductPrice, Category, StockLog } = require('../models');
const { successResponse, errorResponse } = require('../utils');
const { Op } = require('sequelize');

const createProduct = async (req, res) => {
    const t = await db.transaction();
    try {
        const {
            category_id, sku, name, description, base_price,
            current_stock_in_pcs, min_stock_limit, units
        } = req.body;

        const product = await Product.create({
            category_id, sku, name, description, base_price,
            current_stock_in_pcs, min_stock_limit
        }, { transaction: t });

        if (units && units.length > 0) {
            for (const unitItem of units) {
                const unit = await ProductUnit.create({
                    product_id: product.id,
                    unit_name: unitItem.unit_name,
                    conversion_factor: unitItem.conversion_factor,
                    is_default_selling: unitItem.is_default_selling || false
                }, { transaction: t });

                if (unitItem.prices && unitItem.prices.length > 0) {
                    const priceData = unitItem.prices.map(p => ({
                        unit_id: unit.id,
                        price: p.price,
                        min_qty: p.min_qty
                    }));
                    await ProductPrice.bulkCreate(priceData, { transaction: t });
                }
            }
        }

        await StockLog.create({
            product_id: product.id,
            type: 'in',
            amount_in_pcs: current_stock_in_pcs,
            reason: 'Initial Stock Entry'
        }, { transaction: t });

        await t.commit();
        return successResponse(res, 'Produk berhasil ditambahkan', product, 201);
    } catch (error) {
        await t.rollback();
        return errorResponse(res, error.message);
    }
};

const getAllProducts = async (req, res) => {
    try {
        const { search, category_id } = req.query;
        let whereClause = { deleted_at: null };

        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }
        if (category_id) {
            whereClause.category_id = category_id;
        }

        const products = await Product.findAll({
            where: whereClause,
            include: [
                { model: Category, attributes: ['name'] },
                {
                    model: ProductUnit,
                    include: [{ model: ProductPrice }]
                }
            ],
            order: [['name', 'ASC']]
        });

        return successResponse(res, 'Daftar produk berhasil dimuat', products);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: Category },
                {
                    model: ProductUnit,
                    include: [{ model: ProductPrice }]
                },
                { model: StockLog, limit: 10, order: [['id', 'DESC']] } // History stok terakhir
            ]
        });

        if (!product || product.deleted_at) {
            return errorResponse(res, 'Produk tidak ditemukan', 404);
        }

        return successResponse(res, 'Detail produk ditemukan', product);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const updateProduct = async (req, res) => {
    const t = await db.transaction();
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return errorResponse(res, 'Produk tidak ditemukan', 404);

        const { name, description, base_price, min_stock_limit, category_id } = req.body;

        await product.update({
            name, description, base_price, min_stock_limit, category_id
        }, { transaction: t });

        await t.commit();
        return successResponse(res, 'Produk berhasil diperbarui', product);
    } catch (error) {
        await t.rollback();
        return errorResponse(res, error.message);
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return errorResponse(res, 'Produk tidak ditemukan', 404);

        await product.update({ deleted_at: new Date() });

        return successResponse(res, 'Produk berhasil dihapus');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};