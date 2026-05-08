const { Category, Product } = require('../models');
const { successResponse, errorResponse } = require('../utils');

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return errorResponse(res, 'Nama kategori wajib diisi', 400);
        }

        const category = await Category.create({ name });
        return successResponse(res, 'Kategori berhasil dibuat', category, 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']]
        });
        return successResponse(res, 'Daftar kategori berhasil dimuat', categories);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return errorResponse(res, 'Kategori tidak ditemukan', 404);
        }

        await category.update({ name });
        return successResponse(res, 'Kategori berhasil diperbarui', category);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return errorResponse(res, 'Kategori tidak ditemukan', 404);
        }

        const productCount = await Product.count({ where: { category_id: req.params.id } });
        if (productCount > 0) {
            return errorResponse(res, 'Kategori tidak bisa dihapus karena masih digunakan oleh produk', 400);
        }

        await category.destroy();
        return successResponse(res, 'Kategori berhasil dihapus');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
};