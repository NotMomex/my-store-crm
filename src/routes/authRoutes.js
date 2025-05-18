const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');

// POST /api/auth/register - Register a new user (first user or admin only)
router.post('/register', auth, authController.register);

// POST /api/auth/register-first - Register the first admin (no auth required)
router.post('/register-first', authController.register);

// POST /api/auth/login - Login
router.post('/login', authController.login);

// GET /api/auth/me - Get current user
router.get('/me', auth, authController.getCurrentUser);

// GET /api/auth/users - Get all users (admin only)
router.get('/users', auth, adminOnly, authController.getAllUsers);

// PUT /api/auth/users/:id - Update user
router.put('/users/:id', auth, authController.updateUser);

// DELETE /api/auth/users/:id - Delete user (admin only)
router.delete('/users/:id', auth, adminOnly, authController.deleteUser);

module.exports = router;