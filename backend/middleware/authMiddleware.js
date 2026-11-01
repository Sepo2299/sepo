const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const [users] = await pool.execute(
        `SELECT id, username, email, role, full_name, phone, is_active, 
         created_at, last_login 
         FROM users WHERE id = ?`,
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if user is active
      if (!users[0].is_active) {
        return res.status(401).json({
          success: false,
          error: 'User account is deactivated'
        });
      }

      // Attach user to request object
      req.user = users[0];
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token has expired. Please login again.'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Not authorized, invalid token'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token provided'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const [users] = await pool.execute(
        'SELECT id, username, email, role, full_name, phone FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length > 0) {
        req.user = users[0];
      }
    } catch (error) {
      // Token is invalid, but that's OK for optional auth
      console.log('Optional auth - invalid token:', error.message);
    }
  }

  next();
};

// Special middleware for student access
const studentAuth = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can access this route'
      });
    }
    next();
  });
};

// Special middleware for lecturer access
const lecturerAuth = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user.role !== 'lecturer') {
      return res.status(403).json({
        success: false,
        error: 'Only lecturers can access this route'
      });
    }
    next();
  });
};

// Special middleware for admin access
const adminAuth = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can access this route'
      });
    }
    next();
  });
};

module.exports = { 
  protect, 
  authorize, 
  optionalAuth, 
  studentAuth, 
  lecturerAuth, 
  adminAuth 
};