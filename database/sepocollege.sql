-- Sepo College Database Schema
-- MySQL Script

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS sepocollege;
USE sepocollege;

-- Users table (for all users: students, lecturers, admins)
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- Students table
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_number (student_number),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_enrollment_year (enrollment_year)
);

-- Courses table
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
    FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_course_code (course_code),
    INDEX idx_school (school),
    INDEX idx_lecturer (lecturer_id),
    INDEX idx_active (is_active)
);

-- Student enrollments
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
    UNIQUE KEY unique_enrollment (student_id, course_id),
    INDEX idx_student_course (student_id, course_id),
    INDEX idx_status (status),
    INDEX idx_enrollment_date (enrollment_date)
);

-- Applications table
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
    is_quick_application BOOLEAN DEFAULT FALSE,
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
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_application_number (application_number),
    INDEX idx_status (status),
    INDEX idx_intended_course (intended_course),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Course materials
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
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_course (course_id),
    INDEX idx_published (is_published),
    INDEX idx_publish_date (publish_date)
);

-- Announcements
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
    FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_published (is_published),
    INDEX idx_publish_date (publish_date),
    INDEX idx_expiry_date (expiry_date)
);

-- Assignments
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
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_course (course_id),
    INDEX idx_due_date (due_date),
    INDEX idx_published (is_published)
);

-- Assignment submissions
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
    UNIQUE KEY unique_submission (assignment_id, student_id),
    INDEX idx_assignment (assignment_id),
    INDEX idx_student (student_id),
    INDEX idx_status (status),
    INDEX idx_submission_date (submission_date)
);

-- Insert sample data

-- Sample admin user (password: admin123)
INSERT INTO users (username, email, password, role, full_name, department) VALUES
('admin', 'admin@sepocollege.com.na', '$2a$10$N9qo8uLOickgx2ZMRZoMye.MW/.aM6c8pJpBf6Q3Jz8LpQY7lB4vW', 'admin', 'System Administrator', 'Administration');

-- Sample lecturer users (password: lecturer123)
INSERT INTO users (username, email, password, role, full_name, department) VALUES
('lecturer1', 'lecturer1@sepocollege.com.na', '$2a$10$N9qo8uLOickgx2ZMRZoMye.MW/.aM6c8pJpBf6Q3Jz8LpQY7lB4vW', 'lecturer', 'Dr. John Smith', 'Computer Science'),
('lecturer2', 'lecturer2@sepocollege.com.na', '$2a$10$N9qo8uLOickgx2ZMRZoMye.MW/.aM6c8pJpBf6Q3Jz8LpQY7lB4vW', 'lecturer', 'Prof. Sarah Johnson', 'Natural Sciences');

-- Sample courses
INSERT INTO courses (course_code, course_name, school, description, lecturer_id, credits) VALUES
('CSC101', 'Introduction to Computer Technology', 'computers', 'Basic computer concepts and applications', 2, 3),
('CSC102', 'Software Development', 'computers', 'Introduction to programming and software development', 2, 4),
('SCI101', 'Biology Fundamentals', 'science', 'Introduction to biological concepts', 3, 3),
('SCI102', 'Chemistry Basics', 'science', 'Fundamental principles of chemistry', 3, 3),
('AUT101', 'Basic Driving Skills', 'automotive', 'Fundamentals of safe driving', NULL, 2),
('ENT101', 'Media Production', 'entertainment', 'Introduction to media production techniques', NULL, 3);

-- Sample announcements
INSERT INTO announcements (title, content, category, published_by) VALUES
('Welcome to Sepo College', 'We are excited to welcome new and returning students for the 2024 academic year.', 'general', 1),
('Registration Open for 2024', 'Online registration for the 2024 academic year is now open. Please visit the student kiosk to register.', 'registration', 1),
('New e-Learning Platform', 'We have launched our new e-learning platform with enhanced features for students and lecturers.', 'academic', 1),
('Scholarship Opportunities', 'Apply for scholarships for the 2024 academic year. Deadline: 30 November 2023.', 'academic', 1);

-- Display table information
SELECT 'Database created successfully' as message;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as course_count FROM courses;
SELECT COUNT(*) as announcement_count FROM announcements;