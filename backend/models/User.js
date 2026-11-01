const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  // Create new user
  static async create(userData) {
    const {
      username,
      email,
      password,
      role = 'student',
      full_name,
      department,
      phone
    } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password, role, full_name, department, phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, role, full_name, department, phone]
    );

    return { id: result.insertId, username, email, role, full_name };
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Find user by username
  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, username, email, role, full_name, department, phone, 
              profile_image, is_active, created_at, last_login 
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  // Update user
  static async update(id, userData) {
    const fields = [];
    const values = [];
    const validFields = ['full_name', 'department', 'phone', 'profile_image', 'is_active'];

    for (const [key, value] of Object.entries(userData)) {
      if (validFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);

    const [result] = await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    return result.affectedRows > 0;
  }

  // Delete user
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Check password
  static async comparePassword(enteredPassword, storedPassword) {
    return await bcrypt.compare(enteredPassword, storedPassword);
  }

  // Generate JWT token
  static generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
  }

  // Update last login
  static async updateLastLogin(id) {
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }

  // Get all users (for admin)
  static async findAll(limit = 50, offset = 0, role = null) {
    let query = `
      SELECT id, username, email, role, full_name, department, phone, 
             is_active, created_at, last_login 
      FROM users 
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Search users
  static async search(query, limit = 20) {
    const searchQuery = `
      SELECT id, username, email, role, full_name, department 
      FROM users 
      WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ?
      LIMIT ?
    `;
    
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(
      searchQuery,
      [searchTerm, searchTerm, searchTerm, limit]
    );
    
    return rows;
  }

  // Get user statistics
  static async getStats() {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as total_students,
        SUM(CASE WHEN role = 'lecturer' THEN 1 ELSE 0 END) as total_lecturers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as inactive_users,
        DATE(created_at) as date,
        COUNT(*) as daily_registrations
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    return stats;
  }
}

module.exports = User;