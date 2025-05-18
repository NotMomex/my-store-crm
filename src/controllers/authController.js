const { Auth, ROLES } = require('../models/auth');

// Register new user
exports.register = async (req, res) => {
  try {
    // Check if user is authenticated and is admin (only admins can create new users)
    if (req.user && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Admin access required to create users' });
    }
    
    // If there are no users yet, allow registration of first admin
    const users = await Auth.getAllUsers();
    if (users.length > 0 && (!req.user || req.user.role !== ROLES.ADMIN)) {
      return res.status(403).json({ error: 'Admin access required to create users' });
    }
    
    // Create user
    const user = await Auth.register(req.body);
    res.status(201).json({ 
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Please provide username and password' });
    }
    
    const result = await Auth.login(username, password);
    res.json(result);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({ error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const users = await Auth.getAllUsers();
    const user = users.find(u => u.ID === req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't send password
    const { Password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Auth.getAllUsers();
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { Password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Users can update their own profile, admins can update any profile
    if (req.user.id !== userId && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }
    
    const updatedUser = await Auth.updateUser(userId, req.body);
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Don't allow users to delete themselves
    if (req.user.id === userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    
    await Auth.deleteUser(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(400).json({ error: error.message });
  }
};