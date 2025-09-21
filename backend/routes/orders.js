const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Place an order and notify artisan
router.post('/', protect, orderController.createOrder);

// Get orders for a user
router.get('/user', protect, orderController.getUserOrders);

// Get orders for an artisan (their products)
router.get('/artisan', protect, orderController.getArtisanOrders);

module.exports = router;