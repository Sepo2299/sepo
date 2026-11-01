const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sepocollege',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection function
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Create tables if they don't exist
const initializeDatabase = async () => {
  try {
    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'lecturer', 'admin') DEFAULT 'student',
        full_name VARCHAR(100),
        department VARCHAR(100),
        phone VARCHAR(20),
        profile_image VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Students table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_number VARCHAR(20) UNIQUE NOT NULL,
        user_id INT UNIQUE,
        full_name VARCHAR(100) NOT NULL,
        date_of_birth DATE,
        id_number VARCHAR(50),
        nationality VARCHAR(50),
        gender ENUM('male', 'female', 'other'),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        emergency_contact VARCHAR(20),
        enrollment_year YEAR,
        status ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Courses table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_code VARCHAR(20) UNIQUE NOT NULL,
        course_name VARCHAR(100) NOT NULL,
        school ENUM('science', 'computers', 'automotive', 'entertainment'),
        description TEXT,
        lecturer_id INT,
        credits INT DEFAULT 3,
        duration VARCHAR(50),
        prerequisites TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Student enrollments
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        enrollment_date DATE DEFAULT (CURRENT_DATE),
        status ENUM('enrolled', 'completed', 'dropped', 'failed') DEFAULT 'enrolled',
        grade VARCHAR(5),
        completed_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE KEY unique_enrollment (student_id, course_id)
      )
    `);

    // Applications table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        application_number VARCHAR(20) UNIQUE NOT NULL,
        student_id INT NULL,
        full_name VARCHAR(100) NOT NULL,
        date_of_birth DATE,
        id_number VARCHAR(50),
        nationality VARCHAR(50),
        gender ENUM('male', 'female', 'other'),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        emergency_contact VARCHAR(20),
        highest_qualification VARCHAR(100),
        institution VARCHAR(100),
        year_completed YEAR,
        results VARCHAR(50),
        intended_course VARCHAR(100),
        planned_year YEAR,
        study_mode ENUM('full-time', 'part-time', 'online'),
        status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
        documents_path TEXT,
        notes TEXT,
        reviewed_by INT NULL,
        reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Course materials
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS course_materials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        file_path VARCHAR(500),
        file_type ENUM('outline', 'unit', 'assignment', 'test', 'exam', 'textbook', 'video', 'other'),
        file_size INT,
        uploaded_by INT,
        is_published BOOLEAN DEFAULT TRUE,
        publish_date DATE DEFAULT (CURRENT_DATE),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Announcements
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        category ENUM('general', 'academic', 'registration', 'event', 'alert'),
        image_path VARCHAR(500),
        is_published BOOLEAN DEFAULT TRUE,
        published_by INT,
        publish_date DATE DEFAULT (CURRENT_DATE),
        expiry_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Assignments/Submissions
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        file_path VARCHAR(500),
        due_date DATETIME,
        total_marks DECIMAL(5,2),
        is_published BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Assignment submissions
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        assignment_id INT NOT NULL,
        student_id INT NOT NULL,
        file_path VARCHAR(500),
        submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        marks DECIMAL(5,2) NULL,
        feedback TEXT,
        graded_by INT NULL,
        graded_at TIMESTAMP NULL,
        status ENUM('submitted', 'late', 'graded', 'missing') DEFAULT 'submitted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_submission (assignment_id, student_id)
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
};

// Initialize database on startup
if (process.env.NODE_ENV !== 'test') {
  testConnection();
  initializeDatabase();
}

module.exports = pool;