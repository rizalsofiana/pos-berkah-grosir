const express = require('express');
const router = express.Router();
const productUnitController = require('../controllers/productUnitController');
const { protect, authorize } = require('../middleware');

router.get('/product/:productId', productUnitController.getUnitsByProduct);

router.post('/', protect, authorize('admin', 'owner'), productUnitController.addUnitToProduct);
router.put('/:id', protect, authorize('admin', 'owner'), productUnitController.updateUnit);
router.delete('/:id', protect, authorize('owner'), productUnitController.deleteUnit);

module.exports = router;