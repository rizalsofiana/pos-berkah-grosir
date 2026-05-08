const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware');

router.get('/', categoryController.getAllCategories);

router.post(
    '/',
    protect,
    authorize('admin', 'owner'),
    categoryController.createCategory
);

router.put(
    '/:id',
    protect,
    authorize('admin', 'owner'),
    categoryController.updateCategory
);

router.delete(
    '/:id',
    protect,
    authorize('owner'),
    categoryController.deleteCategory
);

module.exports = router;