const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Simple customer routes
app.get('/api/customers', async (req, res) => {
  try {
    const Customer = require('./models/customer');
    const customers = await Customer.getAll();
    res.json(customers);
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({ error: 'Failed to get customers' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const Customer = require('./models/customer');
    const result = await Customer.create(req.body);
    res.status(201).json({ id: result.id, message: 'Customer created successfully' });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Simple product routes
app.get('/api/products', async (req, res) => {
  try {
    const Product = require('./models/product');
    console.log('Product model loaded:', Product);
    
    const products = await Product.getAll();
    console.log('Products retrieved:', products);
    
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Failed to get products', details: error.message });
  }
});


// Simple order routes
app.get('/api/orders', async (req, res) => {
  try {
    const Order = require('./models/order');
    const orders = await Order.getAll();
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Simple reminder routes
app.get('/api/reminders', async (req, res) => {
  try {
    const Reminder = require('./models/reminder');
    const reminders = await Reminder.getAll();
    res.json(reminders);
  } catch (error) {
    console.error('Error getting reminders:', error);
    res.status(500).json({ error: 'Failed to get reminders' });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});