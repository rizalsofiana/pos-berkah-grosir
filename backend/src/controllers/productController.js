const { sequelize, Product, ProductUnit, ProductPrice, Category, StockLog } = require('../models');
const { successResponse, errorResponse } = require('../utils');
const { Op } = require('sequelize');

const createProduct = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            category_id, sku, name,
            description, base_price, current_stock_in_pcs,
            min_stock_limit, units
        } = req.body;

        // 1. Create Product
        const product = await Product.create({
            category_id: parseInt(category_id),
            sku: sku,
            name: name,
            description: description || '',
            base_price: parseFloat(base_price) || 0,
            current_stock_in_pcs: parseInt(current_stock_in_pcs) || 0,
            min_stock_limit: parseInt(min_stock_limit) || 0
        }, { transaction: t });

        // 2. Create Units & Prices
        for (const [index, item] of units.entries()) {
            const unit = await ProductUnit.create({
                product_id: product.id,
                unit_name: item.unit_name,
                conversion_factor: parseInt(item.conversion_factor),
                is_default_selling: item.is_default_selling
            }, { transaction: t });

            await ProductPrice.create({
                unit_id: unit.id,
                price: parseFloat(item.price) || 0,
                min_qty: 1
            }, { transaction: t });
        }

        await StockLog.create({
            product_id: product.id,
            type: 'in',
            amount_in_pcs: parseInt(current_stock_in_pcs) || 0,
            reason: 'Initial Stock Entry'
        }, { transaction: t });

        await t.commit();
        return successResponse(res, 'Produk berhasil ditambahkan', product, 201);

    } catch (error) {
        if (t) await t.rollback();

        console.log("=== SEVERE ERROR START ===");
        console.error(error);
        console.log("=== SEVERE ERROR END ===");

        return res.status(500).json({
            success: false,
            message: error.name === 'SequelizeValidationError'
                ? error.errors.map(e => e.message).join(', ')
                : error.message
        });
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
            order: [['id', 'DESC']] // Produk terbaru muncul di atas
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
                {
                    model: StockLog,
                    limit: 10,
                    order: [['id', 'DESC']]
                }
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
    const t = await sequelize.transaction();
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            await t.rollback();
            return errorResponse(res, 'Produk tidak ditemukan', 404);
        }

        const { name, description, base_price, min_stock_limit, category_id } = req.body;

        await product.update({
            name, description, base_price, min_stock_limit, category_id
        }, { transaction: t });

        await t.commit();
        return successResponse(res, 'Produk berhasil diperbarui', product);
    } catch (error) {
        if (t) await t.rollback();
        return errorResponse(res, error.message);
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return errorResponse(res, 'Produk tidak ditemukan', 404);

        // Soft delete menggunakan timestamp
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