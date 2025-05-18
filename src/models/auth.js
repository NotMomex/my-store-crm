const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { SheetsHelper, SHEETS } = require('../config/sheets');
const crypto = require('crypto');

// Define a sheet to store users
const USERS_SHEET = 'Users';

// User roles
const ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  VIEWER: 'viewer'
};

// Password validation regex
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

class Auth {
  // Get all users
  static async getAllUsers() {
    try {
      return await SheetsHelper.getRows(USERS_SHEET);
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }
  
  // Register a new user
  static async register(userData) {
    try {
      // Check if username already exists
      const users = await this.getAllUsers();
      if (users.some(user => user.Username === userData.username)) {
        throw new Error('Username already exists');
      }
      
      // Validate password strength
      if (!passwordRegex.test(userData.password)) {
        throw new Error('Password must be at least 8 characters long and include uppercase, lowercase, and numbers');
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Generate user ID
      const id = SheetsHelper.generateId();
      const timestamp = new Date().toISOString();
      
      // Determine role - first user is admin, others are agents by default unless specified
      let role = ROLES.AGENT;
      if (users.length === 0) {
        role = ROLES.ADMIN;
      } else if (userData.role && Object.values(ROLES).includes(userData.role)) {
        // Only allow role specification if it's a valid role
        role = userData.role;
      }
      
      // Create user object
      const newUser = {
        ID: id,
        Username: userData.username,
        Password: hashedPassword,
        Role: role,
        FullName: userData.fullName || '',
        Email: userData.email || '',
        LastLogin: '',
        CreatedAt: timestamp
      };
      
      // Add user to sheet
      await SheetsHelper.appendRow(USERS_SHEET, newUser);
      
      // Return user data without password
      const { Password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  
  // Login user
  static async login(username, password) {
    try {
      // Get users
      const users = await this.getAllUsers();
      
      // Find user by username
      const user = users.find(u => u.Username === username);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.Password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
      
      // Update last login time
      await SheetsHelper.updateRow(USERS_SHEET, user.ID, {
        ...user,
        LastLogin: new Date().toISOString()
      });
      
      // Generate JWT token
      const payload = {
        id: user.ID,
        username: user.Username,
        role: user.Role
      };
      
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-default-secret-key',
        { expiresIn: '12h' }
      );
      
      // Return token and user data without password
      const { Password, ...userWithoutPassword } = user;
      return {
        token,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }
  
  // Update user
  static async updateUser(id, userData) {
    try {
      // Get user to update
      const users = await this.getAllUsers();
      const user = users.find(u => u.ID === id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Prepare update data
      const updateData = {
        ...user,
        FullName: userData.fullName || user.FullName,
        Email: userData.email || user.Email,
      };
      
      // Update password if provided
      if (userData.password) {
        // Validate password strength
        if (!passwordRegex.test(userData.password)) {
          throw new Error('Password must be at least 8 characters long and include uppercase, lowercase, and numbers');
        }
        
        const salt = await bcrypt.genSalt(10);
        updateData.Password = await bcrypt.hash(userData.password, salt);
      }
      
      // Only admins can update roles
      if (userData.role && Object.values(ROLES).includes(userData.role)) {
        updateData.Role = userData.role;
      }
      
      // Update user
      await SheetsHelper.updateRow(USERS_SHEET, id, updateData);
      
      // Return updated user without password
      const { Password, ...userWithoutPassword } = updateData;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  // Delete user
  static async deleteUser(id) {
    try {
      // Check if user exists
      const users = await this.getAllUsers();
      const user = users.find(u => u.ID === id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Don't allow deleting the last admin
      const admins = users.filter(u => u.Role === ROLES.ADMIN);
      if (admins.length === 1 && admins[0].ID === id) {
        throw new Error('Cannot delete the last admin user');
      }
      
      // Delete user
      await SheetsHelper.deleteRow(USERS_SHEET, id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

module.exports = { Auth, ROLES };
