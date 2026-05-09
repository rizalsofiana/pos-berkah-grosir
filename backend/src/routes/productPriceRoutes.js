const express = require('express');
const router = express.Router();
const productPriceController = require('../controllers/productPriceController');
const { protect, authorize } = require('../middleware');

router.get('/unit/:unitId', productPriceController.getPricesByUnit);

router.post('/', protect, authorize('admin', 'owner'), productPriceController.addOrUpdatePrice);
router.delete('/:id', protect, authorize('admin', 'owner'), productPriceController.deletePrice);

module.exports = router;