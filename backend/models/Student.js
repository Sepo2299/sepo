const pool = require('../config/database');

class Student {
  // Generate student number
  static generateStudentNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `SEPO${year}${random}`;
  }

  // Create new student
  static async create(studentData) {
    const studentNumber = this.generateStudentNumber();
    
    const [result] = await pool.execute(
      `INSERT INTO students 
       (student_number, user_id, full_name, date_of_birth, id_number, 
        nationality, gender, phone, email, address, emergency_contact, enrollment_year) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentNumber,
        studentData.user_id,
        studentData.full_name,
        studentData.date_of_birth,
        studentData.id_number,
        studentData.nationality,
        studentData.gender,
        studentData.phone,
        studentData.email,
        studentData.address,
        studentData.emergency_contact,
        studentData.enrollment_year || new Date().getFullYear()
      ]
    );
    
    return { id: result.insertId, student_number: studentNumber };
  }

  // Get all students
  static async findAll(limit = 50, offset = 0, filters = {}) {
    let query = `
      SELECT s.*, u.email as login_email, u.username 
      FROM students s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    // Apply filters
    if (filters.status) {
      query += ' AND s.status = ?';
      params.push(filters.status);
    }
    
    if (filters.enrollment_year) {
      query += ' AND s.enrollment_year = ?';
      params.push(filters.enrollment_year);
    }
    
    if (filters.search) {
      query += ' AND (s.full_name LIKE ? OR s.student_number LIKE ? OR s.email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // Find student by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT s.*, u.email as login_email, u.username, u.profile_image 
       FROM students s 
       LEFT JOIN users u ON s.user_id = u.id 
       WHERE s.id = ?`,
      [id]
    );
    return rows[0];
  }

  // Find student by student number
  static async findByStudentNumber(student_number) {
    const [rows] = await pool.execute(
      `SELECT s.*, u.email as login_email, u.username 
       FROM students s 
       LEFT JOIN users u ON s.user_id = u.id 
       WHERE s.student_number = ?`,
      [student_number]
    );
    return rows[0];
  }

  // Find student by user ID
  static async findByUserId(user_id) {
    const [rows] = await pool.execute(
      `SELECT s.*, u.email as login_email, u.username 
       FROM students s 
       LEFT JOIN users u ON s.user_id = u.id 
       WHERE s.user_id = ?`,
      [user_id]
    );
    return rows[0];
  }

  // Update student
  static async update(id, studentData) {
    const fields = [];
    const values = [];
    const validFields = [
      'full_name', 'date_of_birth', 'id_number', 'nationality', 'gender',
      'phone', 'email', 'address', 'emergency_contact', 'status'
    ];

    for (const [key, value] of Object.entries(studentData)) {
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
      `UPDATE students SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // Delete student
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM students WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Get student courses
  static async getCourses(studentId) {
    const [rows] = await pool.execute(
      `SELECT c.*, e.enrollment_date, e.status as enrollment_status, e.grade,
              u.full_name as lecturer_name
       FROM courses c
       JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN users u ON c.lecturer_id = u.id
       WHERE e.student_id = ?
       ORDER BY e.enrollment_date DESC`,
      [studentId]
    );
    return rows;
  }

  // Enroll student in course
  static async enrollInCourse(studentId, courseId) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO enrollments (student_id, course_id) 
         VALUES (?, ?)`,
        [studentId, courseId]
      );
      return { id: result.insertId, success: true };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Student already enrolled in this course');
      }
      throw error;
    }
  }

  // Get student assignments
  static async getAssignments(studentId) {
    const [rows] = await pool.execute(
      `SELECT a.*, c.course_name, c.course_code,
              s.submission_date, s.marks, s.status as submission_status,
              s.file_path as submission_file
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
       WHERE e.student_id = ? AND e.status = 'enrolled'
       ORDER BY a.due_date`,
      [studentId, studentId]
    );
    return rows;
  }

  // Get student statistics
  static async getStats(studentId) {
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(DISTINCT e.course_id) as total_courses,
        SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed_courses,
        SUM(CASE WHEN e.status = 'enrolled' THEN 1 ELSE 0 END) as active_courses,
        AVG(CASE 
          WHEN e.grade = 'A' THEN 4.0
          WHEN e.grade = 'B' THEN 3.0
          WHEN e.grade = 'C' THEN 2.0
          WHEN e.grade = 'D' THEN 1.0
          WHEN e.grade = 'F' THEN 0.0
          ELSE NULL
        END) as gpa
       FROM enrollments e
       WHERE e.student_id = ?`,
      [studentId]
    );
    
    return stats[0];
  }

  // Search students
  static async search(query, limit = 20) {
    const searchQuery = `
      SELECT s.*, u.email as login_email 
      FROM students s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE s.full_name LIKE ? OR s.student_number LIKE ? OR s.email LIKE ?
      LIMIT ?
    `;
    
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(
      searchQuery,
      [searchTerm, searchTerm, searchTerm, limit]
    );
    
    return rows;
  }

  // Get all student statistics (admin)
  static async getAllStats() {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_students,
        SUM(CASE WHEN status = 'graduated' THEN 1 ELSE 0 END) as graduated_students,
        COUNT(DISTINCT enrollment_year) as enrollment_years,
        enrollment_year,
        COUNT(*) as yearly_enrollment
      FROM students 
      GROUP BY enrollment_year
      ORDER BY enrollment_year DESC
    `);
    
    return stats;
  }
}

module.exports = Student;