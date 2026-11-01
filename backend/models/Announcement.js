const pool = require('../config/database');

class Announcement {
  // Create new announcement
  static async create(announcementData) {
    const [result] = await pool.execute(
      `INSERT INTO announcements 
       (title, content, category, image_path, published_by, publish_date, expiry_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        announcementData.title,
        announcementData.content,
        announcementData.category || 'general',
        announcementData.image_path || null,
        announcementData.published_by,
        announcementData.publish_date || new Date(),
        announcementData.expiry_date || null
      ]
    );
    
    return result.insertId;
  }

  // Get all announcements
  static async findAll(limit = 20, offset = 0, filters = {}) {
    let query = `
      SELECT a.*, u.full_name as publisher_name 
      FROM announcements a
      LEFT JOIN users u ON a.published_by = u.id
      WHERE a.is_published = TRUE
        AND (a.expiry_date IS NULL OR a.expiry_date >= CURDATE())
    `;
    const params = [];
    
    if (filters.category) {
      query += ' AND a.category = ?';
      params.push(filters.category);
    }
    
    if (filters.search) {
      query += ' AND (a.title LIKE ? OR a.content LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY a.publish_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Find announcement by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.full_name as publisher_name 
       FROM announcements a
       LEFT JOIN users u ON a.published_by = u.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Update announcement
  static async update(id, announcementData) {
    const fields = [];
    const values = [];
    const validFields = [
      'title', 'content', 'category', 'image_path', 
      'is_published', 'publish_date', 'expiry_date'
    ];

    for (const [key, value] of Object.entries(announcementData)) {
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
      `UPDATE announcements SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete announcement
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM announcements WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get recent announcements
  static async getRecent(limit = 5) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.full_name as publisher_name 
       FROM announcements a
       LEFT JOIN users u ON a.published_by = u.id
       WHERE a.is_published = TRUE 
         AND (a.expiry_date IS NULL OR a.expiry_date >= CURDATE())
       ORDER BY a.publish_date DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  // Get announcements by category
  static async getByCategory(category, limit = 10) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.full_name as publisher_name 
       FROM announcements a
       LEFT JOIN users u ON a.published_by = u.id
       WHERE a.category = ? 
         AND a.is_published = TRUE
         AND (a.expiry_date IS NULL OR a.expiry_date >= CURDATE())
       ORDER BY a.publish_date DESC
       LIMIT ?`,
      [category, limit]
    );
    return rows;
  }

  // Get announcement statistics
  static async getStats() {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_announcements,
        SUM(CASE WHEN is_published = TRUE THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN is_published = FALSE THEN 1 ELSE 0 END) as unpublished,
        SUM(CASE WHEN expiry_date < CURDATE() THEN 1 ELSE 0 END) as expired,
        category,
        COUNT(*) as category_count
      FROM announcements 
      GROUP BY category
      ORDER BY category_count DESC
    `);
    
    return stats;
  }

  // Search announcements
  static async search(query, limit = 20) {
    const searchQuery = `
      SELECT a.*, u.full_name as publisher_name 
      FROM announcements a
      LEFT JOIN users u ON a.published_by = u.id
      WHERE (a.title LIKE ? OR a.content LIKE ?)
        AND a.is_published = TRUE
        AND (a.expiry_date IS NULL OR a.expiry_date >= CURDATE())
      ORDER BY a.publish_date DESC
      LIMIT ?
    `;
    
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(
      searchQuery,
      [searchTerm, searchTerm, limit]
    );
    
    return rows;
  }
}

module.exports = Announcement;