CREATE TABLE IF NOT EXISTS users (
 id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(190) UNIQUE NOT NULL,
 username VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL,
 full_name VARCHAR(190) NOT NULL, role ENUM('admin','student') NOT NULL DEFAULT 'student',
 must_change_password BOOLEAN NOT NULL DEFAULT TRUE, is_active BOOLEAN NOT NULL DEFAULT TRUE,
 moodle_id BIGINT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS students (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT UNIQUE NOT NULL, student_number VARCHAR(50) UNIQUE NOT NULL,
 programme VARCHAR(190) NOT NULL, study_mode VARCHAR(30) NOT NULL, planned_year INT NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS applications (
 id INT AUTO_INCREMENT PRIMARY KEY, application_number VARCHAR(64) UNIQUE NOT NULL,
 full_name VARCHAR(190) NOT NULL, email VARCHAR(190) NOT NULL, phone VARCHAR(40) NOT NULL,
 date_of_birth DATE NOT NULL, id_number VARCHAR(100), nationality VARCHAR(100), address VARCHAR(500),
 highest_qualification VARCHAR(100), institution VARCHAR(190), year_completed INT, results VARCHAR(500),
 intended_course VARCHAR(190) NOT NULL, planned_year INT NOT NULL, study_mode VARCHAR(30) NOT NULL,
 status ENUM('pending','reviewed','accepted','rejected') NOT NULL DEFAULT 'pending',
 student_id INT NULL, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(student_id) REFERENCES students(id)
);
CREATE TABLE IF NOT EXISTS courses (
 id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(40) UNIQUE NOT NULL, name VARCHAR(190) UNIQUE NOT NULL,
 school VARCHAR(40) NOT NULL, level VARCHAR(80) NOT NULL, duration VARCHAR(80) NOT NULL, moodle_id BIGINT NULL
);
CREATE TABLE IF NOT EXISTS enrollments (
 id INT AUTO_INCREMENT PRIMARY KEY, student_id INT NOT NULL, course_id INT NOT NULL,
 moodle_synced BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY(student_id,course_id), FOREIGN KEY(student_id) REFERENCES students(id),
 FOREIGN KEY(course_id) REFERENCES courses(id)
);
