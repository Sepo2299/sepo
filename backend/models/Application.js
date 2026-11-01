const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Application {
  // Generate application number
  static generateApplicationNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `APP${year}${month}${random}`;
  }

  // Create new application
// Replace the create() method in Application.js with this:

// Create new application
static async create(applicationData) {
  const application_number = this.generateApplicationNumber();
  
  // Convert undefined values to null for SQL
  const safeValue = (val) => {
    if (val === undefined || val === '') return null;
    return val;
  };

  const [result] = await pool.execute(
    `INSERT INTO applications 
     (application_number, full_name, date_of_birth, id_number, nationality, gender,
      phone, email, address, emergency_contact, highest_qualification, institution,
      year_completed, results, intended_course, planned_year, study_mode, 
      documents_path, status,  created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
    [
      application_number,
      applicationData.full_name,
      applicationData.date_of_birth,
      safeValue(applicationData.id_number),
      applicationData.nationality || 'Namibian',
      safeValue(applicationData.gender),
      applicationData.phone,
      applicationData.email,
      safeValue(applicationData.address),
      safeValue(applicationData.emergency_contact),
      safeValue(applicationData.highest_qualification),
      safeValue(applicationData.institution),
      safeValue(applicationData.year_completed),
      safeValue(applicationData.results),
      applicationData.intended_course,
      applicationData.planned_year,
      applicationData.study_mode || 'full-time',
      safeValue(applicationData.documents_path)
     
    ]
  );
  
  return { id: result.insertId, application_number, ...applicationData };
}

  // Get all applications
  static async findAll(limit = 50, offset = 0, filters = {}) {
    let query = 'SELECT * FROM applications WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.intended_course) {
      query += ' AND intended_course = ?';
      params.push(filters.intended_course);
    }
    
    if (filters.planned_year) {
      query += ' AND planned_year = ?';
      params.push(filters.planned_year);
    }
    
    if (filters.search) {
      query += ' AND (full_name LIKE ? OR application_number LIKE ? OR email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Find application by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM applications WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Find application by application number
  static async findByApplicationNumber(application_number) {
    const [rows] = await pool.execute(
      'SELECT * FROM applications WHERE application_number = ?',
      [application_number]
    );
    return rows[0];
  }

  // Update application
  static async update(id, applicationData) {
    const fields = [];
    const values = [];
    const validFields = [
      'full_name', 'date_of_birth', 'id_number', 'nationality', 'gender',
      'phone', 'email', 'address', 'emergency_contact', 'highest_qualification',
      'institution', 'year_completed', 'results', 'intended_course',
      'planned_year', 'study_mode', 'documents_path', 'notes'
    ];

    for (const [key, value] of Object.entries(applicationData)) {
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
      `UPDATE applications SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Update application status
  static async updateStatus(id, status, student_id = null, reviewed_by = null, notes = null) {
    const updateData = { status };
    
    if (student_id) {
      updateData.student_id = student_id;
    }
    
    if (reviewed_by) {
      updateData.reviewed_by = reviewed_by;
      updateData.reviewed_at = new Date();
    }
    
    if (notes) {
      updateData.notes = notes;
    }

    return await this.update(id, updateData);
  }

  // Delete application
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM applications WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get statistics
  static async getStats(timeframe = 'month') {
    let interval;
    switch (timeframe) {
      case 'day':
        interval = 'DAY';
        break;
      case 'week':
        interval = 'WEEK';
        break;
      case 'month':
        interval = 'MONTH';
        break;
      case 'year':
        interval = 'YEAR';
        break;
      default:
        interval = 'MONTH';
    }

    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        DATE(created_at) as date,
        intended_course,
        COUNT(*) as course_applications
      FROM applications 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 ${interval})
      GROUP BY DATE(created_at), intended_course
      ORDER BY date DESC
    `);
    
    return rows;
  }

  // Get application trends
  static async getTrends() {
    const [trends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as applications,
        intended_course,
        status
      FROM applications 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), intended_course, status
      ORDER BY month DESC, intended_course
    `);
    
    return trends;
  }

  // Get application by student
  static async getByStudent(student_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM applications WHERE student_id = ? ORDER BY created_at DESC',
      [student_id]
    );
    return rows;
  }

  // Search applications
  static async search(query, limit = 20) {
    const searchQuery = `
      SELECT * FROM applications 
      WHERE full_name LIKE ? OR application_number LIKE ? OR email LIKE ? OR phone LIKE ?
      ORDER BY created_at DESC
      LIMIT ?
    `;
    
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(
      searchQuery,
      [searchTerm, searchTerm, searchTerm, searchTerm, limit]
    );
    
    return rows;
  }
}

module.exports = Application;