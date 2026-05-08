const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

router.post(
    '/',
    protect,
    authorize('admin', 'owner'),
    productController.createProduct
);

router.put(
    '/:id',
    protect,
    authorize('admin', 'owner'),
    productController.updateProduct
);

router.delete(
    '/:id',
    protect,
    authorize('owner'),
    productController.deleteProduct
);

module.exports = router;