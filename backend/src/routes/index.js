const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const productUnitRoutes = require('./productUnitRoutes');
const productPriceRoutes = require('./productPriceRoutes');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/product-units', productUnitRoutes);
router.use('/product-prices', productPriceRoutes);

module.exports = router;