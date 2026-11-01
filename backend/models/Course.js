const pool = require('../config/database');

class Course {
  // Create new course
  static async create(courseData) {
    const [result] = await pool.execute(
      `INSERT INTO courses 
       (course_code, course_name, school, description, lecturer_id, credits, duration, prerequisites) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        courseData.course_code,
        courseData.course_name,
        courseData.school,
        courseData.description,
        courseData.lecturer_id,
        courseData.credits || 3,
        courseData.duration || '1 semester',
        courseData.prerequisites || null
      ]
    );
    
    return result.insertId;
  }

  // Get all courses
  static async findAll(limit = 100, offset = 0, filters = {}) {
    let query = `
      SELECT c.*, u.full_name as lecturer_name 
      FROM courses c 
      LEFT JOIN users u ON c.lecturer_id = u.id
      WHERE c.is_active = TRUE
    `;
    const params = [];
    
    if (filters.school) {
      query += ' AND c.school = ?';
      params.push(filters.school);
    }
    
    if (filters.lecturer_id) {
      query += ' AND c.lecturer_id = ?';
      params.push(filters.lecturer_id);
    }
    
    if (filters.search) {
      query += ' AND (c.course_code LIKE ? OR c.course_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY c.course_code LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Find course by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT c.*, u.full_name as lecturer_name, u.email as lecturer_email 
       FROM courses c 
       LEFT JOIN users u ON c.lecturer_id = u.id 
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Find course by code
  static async findByCode(course_code) {
    const [rows] = await pool.execute(
      `SELECT c.*, u.full_name as lecturer_name 
       FROM courses c 
       LEFT JOIN users u ON c.lecturer_id = u.id 
       WHERE c.course_code = ?`,
      [course_code]
    );
    return rows[0];
  }

  // Find courses by school
  static async findBySchool(school) {
    const [rows] = await pool.execute(
      `SELECT c.*, u.full_name as lecturer_name 
       FROM courses c 
       LEFT JOIN users u ON c.lecturer_id = u.id 
       WHERE c.school = ? AND c.is_active = TRUE
       ORDER BY c.course_code`,
      [school]
    );
    return rows;
  }

  // Update course
  static async update(id, courseData) {
    const fields = [];
    const values = [];
    const validFields = [
      'course_name', 'school', 'description', 'lecturer_id', 
      'credits', 'duration', 'prerequisites', 'is_active'
    ];

    for (const [key, value] of Object.entries(courseData)) {
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
      `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete course (soft delete by setting is_active to false)
  static async delete(id) {
    const [result] = await pool.execute(
      'UPDATE courses SET is_active = FALSE WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get course materials
  static async getMaterials(courseId) {
    const [rows] = await pool.execute(
      `SELECT cm.*, u.full_name as uploaded_by_name 
       FROM course_materials cm
       LEFT JOIN users u ON cm.uploaded_by = u.id
       WHERE cm.course_id = ? AND cm.is_published = TRUE
       ORDER BY cm.publish_date DESC, cm.created_at DESC`,
      [courseId]
    );
    return rows;
  }

  // Add course material
  static async addMaterial(courseId, materialData) {
    const [result] = await pool.execute(
      `INSERT INTO course_materials 
       (course_id, title, description, file_path, file_type, file_size, uploaded_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        courseId,
        materialData.title,
        materialData.description,
        materialData.file_path,
        materialData.file_type,
        materialData.file_size,
        materialData.uploaded_by
      ]
    );
    
    return result.insertId;
  }

  // Get enrolled students
  static async getEnrolledStudents(courseId) {
    const [rows] = await pool.execute(
      `SELECT s.*, e.enrollment_date, e.status as enrollment_status, e.grade,
              u.email as login_email
       FROM students s
       JOIN enrollments e ON s.id = e.student_id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE e.course_id = ?
       ORDER BY s.full_name`,
      [courseId]
    );
    return rows;
  }

  // Get course assignments
  static async getAssignments(courseId) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.full_name as created_by_name,
              COUNT(s.id) as submission_count
       FROM assignments a
       LEFT JOIN users u ON a.created_by = u.id
       LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
       WHERE a.course_id = ? AND a.is_published = TRUE
       GROUP BY a.id
       ORDER BY a.due_date`,
      [courseId]
    );
    return rows;
  }

  // Search courses
  static async search(query, limit = 20) {
    const searchQuery = `
      SELECT c.*, u.full_name as lecturer_name 
      FROM courses c 
      LEFT JOIN users u ON c.lecturer_id = u.id
      WHERE (c.course_code LIKE ? OR c.course_name LIKE ? OR c.description LIKE ?)
        AND c.is_active = TRUE
      LIMIT ?
    `;
    
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(
      searchQuery,
      [searchTerm, searchTerm, searchTerm, limit]
    );
    
    return rows;
  }

  // Get course statistics
  static async getStats(courseId) {
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(DISTINCT e.student_id) as total_students,
        SUM(CASE WHEN e.status = 'enrolled' THEN 1 ELSE 0 END) as active_students,
        SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed_students,
        COUNT(cm.id) as total_materials,
        COUNT(a.id) as total_assignments,
        AVG(CASE 
          WHEN e.grade = 'A' THEN 4.0
          WHEN e.grade = 'B' THEN 3.0
          WHEN e.grade = 'C' THEN 2.0
          WHEN e.grade = 'D' THEN 1.0
          WHEN e.grade = 'F' THEN 0.0
          ELSE NULL
        END) as average_grade
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN course_materials cm ON c.id = cm.course_id AND cm.is_published = TRUE
       LEFT JOIN assignments a ON c.id = a.course_id AND a.is_published = TRUE
       WHERE c.id = ?
       GROUP BY c.id`,
      [courseId]
    );
    
    return stats[0];
  }

  // Get all course statistics (admin)
  static async getAllStats() {
    const [stats] = await pool.execute(`
      SELECT 
        c.school,
        COUNT(*) as total_courses,
        SUM(CASE WHEN c.is_active = TRUE THEN 1 ELSE 0 END) as active_courses,
        COUNT(DISTINCT c.lecturer_id) as total_lecturers,
        COUNT(DISTINCT e.student_id) as total_students,
        AVG(c.credits) as average_credits
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.school
      ORDER BY c.school
    `);
    
    return stats;
  }
}

module.exports = Course;