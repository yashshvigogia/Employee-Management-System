const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to check if user has required role
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userRole = req.user.role.name;

    if (Array.isArray(roles)) {
      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: 'Access denied: insufficient role permissions' });
      }
    } else {
      if (userRole !== roles) {
        return res.status(403).json({ message: 'Access denied: insufficient role permissions' });
      }
    }

    next();
  };
};

// Middleware to check if user has required permission
const hasPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const permissions = req.user.role.permissions;

    if (!permissions[resource] || !permissions[resource].includes(action)) {
      return res.status(403).json({
        message: `Access denied: insufficient permissions. Required: ${resource}:${action}`,
        userRole: req.user.role.name,
        requiredPermission: `${resource}:${action}`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  hasRole,
  hasPermission,
};
