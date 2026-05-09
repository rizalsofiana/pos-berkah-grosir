const { ProductPrice, ProductUnit } = require('../models');
const { successResponse, errorResponse } = require('../utils');

const addOrUpdatePrice = async (req, res) => {
    try {
        const { unit_id, price, min_qty } = req.body;

        const unit = await ProductUnit.findByPk(unit_id);
        if (!unit) return errorResponse(res, 'Satuan produk tidak ditemukan', 404);

        const [productPrice, created] = await ProductPrice.findOrCreate({
            where: { unit_id, min_qty },
            defaults: { price }
        });

        if (!created) {
            await productPrice.update({ price });
        }

        return successResponse(
            res,
            created ? 'Harga berhasil ditambahkan' : 'Harga berhasil diperbarui',
            productPrice,
            created ? 201 : 200
        );
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const getPricesByUnit = async (req, res) => {
    try {
        const prices = await ProductPrice.findAll({
            where: { unit_id: req.params.unitId },
            order: [['min_qty', 'ASC']]
        });
        return successResponse(res, 'Daftar harga berhasil dimuat', prices);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const deletePrice = async (req, res) => {
    try {
        const price = await ProductPrice.findByPk(req.params.id);
        if (!price) return errorResponse(res, 'Data harga tidak ditemukan', 404);

        await price.destroy();
        return successResponse(res, 'Harga berhasil dihapus');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

module.exports = {
    addOrUpdatePrice,
    getPricesByUnit,
    deletePrice
};