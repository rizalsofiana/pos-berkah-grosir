const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, validateOrder } = require('../middleware');

router.post('/', validateOrder, orderController.createOrder);

router.get('/', protect, orderController.getOrderHistory);

module.exports = router;