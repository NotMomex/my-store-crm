const Order = require('../models/order');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.getAll();
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    // Create the order
    const orderResult = await Order.create(req.body);
    const orderId = orderResult.id;
    
    // Add order items if provided
    if (req.body.items && Array.isArray(req.body.items)) {
      for (const item of req.body.items) {
        await Order.addOrderItem({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        });
      }
    }
    
    res.status(201).json({ id: orderId, message: 'Order created successfully' });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    await Order.updateStatus(req.params.id, req.body.status);
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Update order payment
exports.updateOrderPayment = async (req, res) => {
  try {
    await Order.updatePayment(
      req.params.id, 
      req.body.amount_collected, 
      req.body.payment_status
    );
    res.json({ message: 'Order payment updated successfully' });
  } catch (error) {
    console.error('Error updating order payment:', error);
    res.status(500).json({ error: 'Failed to update order payment' });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    await Order.delete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

// Get weekly sales report
exports.getWeeklySales = async (req, res) => {
  try {
    const weeklySales = await Order.getWeeklySales();
    res.json(weeklySales);
  } catch (error) {
    console.error('Error getting weekly sales:', error);
    res.status(500).json({ error: 'Failed to get weekly sales' });
  }
};