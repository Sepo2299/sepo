const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect, adminAuth } = require('../middleware/authMiddleware');

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
];

const loginValidation = [
  body('username').notEmpty().withMessage('Username/Student number/Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('userType').isIn(['student', 'lecturer', 'admin']).withMessage('Valid user type is required')
];

// Public routes
router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes (user only)
router.get('/me', protect, authController.getMe);
router.put('/change-password', protect, authController.changePassword);

// Admin only routes
router.post('/register', adminAuth, registerValidation, authController.register);

module.exports = router;