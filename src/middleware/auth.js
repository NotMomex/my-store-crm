const jwt = require('jsonwebtoken');
const { ROLES } = require('../models/auth');

// Authentication middleware
exports.auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
    
    // Add user to request object
    req.user = decoded;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Role-based access control middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists and has a role
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    
    next();
  };
};

// Admin-only access middleware
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// Viewer and above access middleware (viewer, agent, admin)
exports.viewerAndAbove = (req, res, next) => {
  if (!req.user || ![ROLES.VIEWER, ROLES.AGENT, ROLES.ADMIN].includes(req.user.role)) {
    return res.status(403).json({ error: 'Viewer access required' });
  }
  
  next();
};

// Agent and above access middleware (agent, admin)
exports.agentAndAbove = (req, res, next) => {
  if (!req.user || ![ROLES.AGENT, ROLES.ADMIN].includes(req.user.role)) {
    return res.status(403).json({ error: 'Agent access required' });
  }
  
  next();
};