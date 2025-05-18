const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// GET all orders
router.get('/', orderController.getAllOrders);

// GET weekly sales report
router.get('/reports/weekly', orderController.getWeeklySales);

// GET order by ID - This needs to be after other specific routes
router.get('/:id', orderController.getOrderById);

// POST create new order
router.post('/', orderController.createOrder);

// PATCH update order status
router.patch('/:id/status', orderController.updateOrderStatus);

// PATCH update order payment
router.patch('/:id/payment', orderController.updateOrderPayment);

// DELETE order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;