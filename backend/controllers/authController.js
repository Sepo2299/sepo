const User = require('../models/User');
const Student = require('../models/Student');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Login user (with student number OR email)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    console.log('🔐 Login attempt:', { username, userType });

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide username/student number and password'
      });
    }

    let user;
    let studentData = null;

    // Check if it's a student number login
    if (userType === 'student') {
      // Try to find student by student number
      const db = require('../config/database');
      
      const [students] = await db.execute(
        `SELECT s.*, u.id as user_id, u.username, u.email, u.password, u.role, u.full_name, 
         u.phone, u.is_active, u.created_at, u.last_login 
         FROM students s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.student_number = ?`,
        [username]
      );

      if (students.length === 0) {
        // Also try by email
        const [users] = await db.execute(
          `SELECT u.*, s.student_number, s.id as student_id 
           FROM users u 
           LEFT JOIN students s ON u.id = s.user_id 
           WHERE u.email = ? AND u.role = 'student'`,
          [username]
        );

        if (users.length === 0) {
          return res.status(401).json({
            success: false,
            error: 'Invalid student number/email or password'
          });
        }
        user = users[0];
      } else {
        user = students[0];
        studentData = {
          student_id: user.id,
          student_number: user.student_number,
          enrollment_year: user.enrollment_year,
          status: user.status
        };
      }
    } 
    // Check if it's a lecturer login
    else if (userType === 'lecturer') {
      const db = require('../config/database');
      const [users] = await db.execute(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND role = ?',
        [username, username, 'lecturer']
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Invalid username/email or password'
        });
      }
      user = users[0];
    } 
    // Check if it's admin login
    else if (userType === 'admin') {
      const db = require('../config/database');
      const [users] = await db.execute(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND role = ?',
        [username, username, 'admin']
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      user = users[0];
    } 
    else {
      return res.status(400).json({
        success: false,
        error: 'Invalid user type'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.user_id || user.id, user.role);

    // Update last login
    const db = require('../config/database');
    await db.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.user_id || user.id]
    );

    // Prepare response data
    const userResponse = {
      id: user.user_id || user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      phone: user.phone,
      is_active: user.is_active,
      created_at: user.created_at,
      last_login: user.last_login
    };

    // Add student data if applicable
    if (userType === 'student') {
      userResponse.student_number = user.student_number;
      userResponse.student_id = studentData?.student_id || user.student_id;
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse,
      student: studentData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const db = require('../config/database');
    let user;

    if (req.user.role === 'student') {
      const [rows] = await db.execute(
        `SELECT u.*, s.student_number, s.id as student_id, s.enrollment_year, s.status 
         FROM users u 
         LEFT JOIN students s ON u.id = s.user_id 
         WHERE u.id = ?`,
        [req.user.id]
      );
      user = rows[0];
    } else {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [req.user.id]
      );
      user = rows[0];
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password'
      });
    }

    // Get user with password
    const db = require('../config/database');
    const [rows] = await db.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, rows[0].password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Register user (for admin to create accounts)
// @route   POST /api/auth/register
// @access  Private/Admin
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, password, role, full_name, phone, student_number } = req.body;

    // Check if user exists
    const db = require('../config/database');
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email or username'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [userResult] = await db.execute(
      `INSERT INTO users (username, email, password, role, full_name, phone, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW())`,
      [username, email, hashedPassword, role || 'student', full_name, phone]
    );

    const userId = userResult.insertId;

    // If student, create student record
    let studentData = null;
    if (role === 'student' || !role) {
      const [studentResult] = await db.execute(
        `INSERT INTO students (student_number, user_id, full_name, email, phone, enrollment_year, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
        [student_number || `SEPO${new Date().getFullYear()}${userId}`, userId, full_name, email, phone, new Date().getFullYear()]
      );
      studentData = {
        student_id: studentResult.insertId,
        student_number: student_number || `SEPO${new Date().getFullYear()}${userId}`
      };
    }

    // Generate token
    const token = generateToken(userId, role || 'student');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username,
        email,
        role: role || 'student',
        full_name,
        phone
      },
      student: studentData
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email'
      });
    }

    const db = require('../config/database');
    const [users] = await db.execute(
      'SELECT id, email, full_name FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link'
      });
    }

    const user = users[0];

    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save reset token to database
    await db.execute(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, new Date(resetTokenExpiry), user.id]
    );

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request - Sepo College',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Dear ${user.full_name},</p>
          <p>You requested a password reset for your Sepo College account.</p>
          <p>Click the link below to reset your password:</p>
          <p>
            <a href="${resetUrl}" style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 16px 0;
            ">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>Sepo College Team</p>
        </div>
      `
    };

    // In development, log the reset link
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Password reset link:', resetUrl);
      console.log('📧 Reset token:', resetToken);
      
      return res.json({
        success: true,
        message: 'Password reset link generated (check console in development mode)',
        resetUrl: resetUrl // Only for development
      });
    }

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Error sending reset email'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide token and new password'
      });
    }

    const db = require('../config/database');
    
    // Find user by reset token
    const [users] = await db.execute(
      'SELECT id, reset_token_expiry FROM users WHERE reset_token = ?',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    const user = users[0];

    // Check if token is expired
    if (new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Reset token has expired'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await db.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW() WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};