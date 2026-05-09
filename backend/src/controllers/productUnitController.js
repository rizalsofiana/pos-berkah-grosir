const { ProductUnit, ProductPrice, Product } = require('../models');
const { successResponse, errorResponse } = require('../utils');

const addUnitToProduct = async (req, res) => {
    try {
        const { product_id, unit_name, conversion_factor, is_default_selling } = req.body;

        const product = await Product.findByPk(product_id);
        if (!product) return errorResponse(res, 'Produk tidak ditemukan', 404);

        if (is_default_selling) {
            await ProductUnit.update(
                { is_default_selling: false },
                { where: { product_id } }
            );
        }

        const unit = await ProductUnit.create({
            product_id,
            unit_name,
            conversion_factor,
            is_default_selling: is_default_selling || false
        });

        return successResponse(res, 'Satuan produk berhasil ditambahkan', unit, 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const getUnitsByProduct = async (req, res) => {
    try {
        const units = await ProductUnit.findAll({
            where: { product_id: req.params.productId },
            include: [{ model: ProductPrice }]
        });
        return successResponse(res, 'Daftar satuan produk berhasil dimuat', units);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const updateUnit = async (req, res) => {
    try {
        const { unit_name, conversion_factor, is_default_selling } = req.body;
        const unit = await ProductUnit.findByPk(req.params.id);

        if (!unit) return errorResponse(res, 'Satuan tidak ditemukan', 404);

        if (is_default_selling) {
            await ProductUnit.update(
                { is_default_selling: false },
                { where: { product_id: unit.product_id } }
            );
        }

        await unit.update({
            unit_name,
            conversion_factor,
            is_default_selling
        });

        return successResponse(res, 'Satuan berhasil diperbarui', unit);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const deleteUnit = async (req, res) => {
    try {
        const unit = await ProductUnit.findByPk(req.params.id);
        if (!unit) return errorResponse(res, 'Satuan tidak ditemukan', 404);

        if (unit.conversion_factor === 1) {
            return errorResponse(res, 'Satuan dasar (Pcs) tidak boleh dihapus demi integritas stok', 400);
        }

        await unit.destroy();
        return successResponse(res, 'Satuan berhasil dihapus');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

module.exports = {
    addUnitToProduct,
    getUnitsByProduct,
    updateUnit,
    deleteUnit
};