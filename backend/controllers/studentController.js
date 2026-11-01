const Student = require('../models/Student');
const Course = require('../models/Course');
const User = require('../models/User');
const pool = require('../config/database');

// @desc    Get student dashboard data (for e-learning)
// @route   GET /api/students/dashboard
// @access  Private/Student
exports.getDashboard = async (req, res) => {
  try {
    // Get student info
    const student = await Student.findByUserId(req.user.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    // Get user data
    const user = await User.findById(req.user.id);

    // Try to get enrolled courses
    let courses = [];
    try {
      courses = await Student.getCourses(student.id);
    } catch (error) {
      console.log('Courses not available, using sample data:', error.message);
      // Provide sample courses if real courses don't exist
      courses = [
        {
          id: 1,
          code: 'CSC101',
          name: 'Introduction to Computer Technology',
          description: 'Fundamentals of computer systems and programming',
          instructor: 'Dr. John Smith',
          credits: 3,
          semester: 'Fall 2024',
          enrolled_date: '2024-01-15',
          enrollment_status: 'active'
        },
        {
          id: 2,
          code: 'SCI101',
          name: 'Biology Fundamentals',
          description: 'Introduction to biological concepts and principles',
          instructor: 'Prof. Sarah Johnson',
          credits: 4,
          semester: 'Fall 2024',
          enrolled_date: '2024-01-15',
          enrollment_status: 'active'
        }
      ];
    }

    // Get assignments (sample for now)
    const assignments = [
      {
        id: 1,
        title: 'Programming Assignment 1',
        course_code: 'CSC101',
        course_name: 'Introduction to Computer Technology',
        due_date: '2024-02-15',
        submitted: true,
        score: 85,
        max_score: 100
      },
      {
        id: 2,
        title: 'Lab Report 1',
        course_code: 'SCI101',
        course_name: 'Biology Fundamentals',
        due_date: '2024-02-20',
        submitted: false,
        score: null,
        max_score: 100
      }
    ];

    // Get recent grades (sample for now)
    const recentGrades = [
      {
        assignment_title: 'Quiz 1 - Computer Basics',
        course_name: 'Introduction to Computer Technology',
        score: 90,
        max_score: 100,
        graded_at: '2024-02-10'
      },
      {
        assignment_title: 'Midterm Exam',
        course_name: 'Biology Fundamentals',
        score: 78,
        max_score: 100,
        graded_at: '2024-02-05'
      }
    ];

    // Calculate statistics
    const totalCourses = courses.length;
    const pendingAssignments = assignments.filter(a => !a.submitted).length;
    const completedAssignments = assignments.filter(a => a.submitted).length;
    const averageGrade = recentGrades.length > 0 ? 
      Math.round(recentGrades.reduce((sum, g) => sum + g.score, 0) / recentGrades.length) : 0;

    res.json({
      success: true,
      student: {
        student_id: student.id,
        student_number: student.student_number,
        full_name: student.full_name || user.full_name,
        email: student.email || user.email,
        phone: student.phone || user.phone,
        enrollment_year: student.enrollment_year,
        status: student.status,
        address: student.address,
        emergency_contact: student.emergency_contact
      },
      dashboard: {
        total_courses: totalCourses,
        pending_assignments: pendingAssignments,
        completed_assignments: completedAssignments,
        average_grade: averageGrade
      },
      courses: courses,
      upcoming_assignments: assignments,
      recent_grades: recentGrades
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching dashboard data'
    });
  }
};

// @desc    Get student courses (for e-learning)
// @route   GET /api/students/courses
// @access  Private/Student
exports.getStudentCourses = async (req, res) => {
  try {
    // Get student ID from user ID
    const student = await Student.findByUserId(req.user.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    let courses;
    try {
      // Try to get courses from database
      courses = await Student.getCourses(student.id);
    } catch (error) {
      console.log('Courses table not available, using sample data');
      
      // Return sample courses for e-learning portal
      courses = [
        {
          id: 1,
          code: 'CSC101',
          name: 'Introduction to Computer Technology',
          instructor: 'Dr. John Smith',
          description: 'Fundamentals of computer systems and programming',
          credits: 3,
          semester: 'Fall 2024',
          progress: 65,
          materials: [
            { type: 'outline', name: 'Course Outline', date: '2024-01-15' },
            { type: 'unit', name: 'Unit 1: Computer Basics', date: '2024-01-20' },
            { type: 'assignment', name: 'Assignment 1', due_date: '2024-02-10', submitted: true },
            { type: 'test', name: 'Quiz 1', date: '2024-02-05', score: 85 },
            { type: 'textbook', name: 'Digital Textbook', date: '2024-01-10' },
          ]
        },
        {
          id: 2,
          code: 'SCI101',
          name: 'Biology Fundamentals',
          instructor: 'Prof. Sarah Johnson',
          description: 'Introduction to biological concepts and principles',
          credits: 4,
          semester: 'Fall 2024',
          progress: 40,
          materials: [
            { type: 'outline', name: 'Course Outline', date: '2024-01-15' },
            { type: 'unit', name: 'Unit 1: Cell Biology', date: '2024-01-22' },
            { type: 'assignment', name: 'Lab Report 1', due_date: '2024-02-15', submitted: false },
            { type: 'video', name: 'Cell Structure Lecture', date: '2024-01-25' },
          ]
        },
        {
          id: 3,
          code: 'MTH101',
          name: 'Mathematics for Computing',
          instructor: 'Dr. Michael Brown',
          description: 'Essential mathematics for computer science students',
          credits: 3,
          semester: 'Fall 2024',
          progress: 30,
          materials: [
            { type: 'outline', name: 'Course Outline', date: '2024-01-15' },
            { type: 'unit', name: 'Unit 1: Algebra Review', date: '2024-01-18' },
            { type: 'assignment', name: 'Problem Set 1', due_date: '2024-02-12', submitted: true },
          ]
        }
      ];
    }

    res.json({
      success: true,
      courses: courses
    });

  } catch (error) {
    console.error('Get student courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching courses'
    });
  }
};

// @desc    Get my profile (student)
// @route   GET /api/students/me/profile
// @access  Private (Student)
exports.getMyProfile = async (req, res) => {
  try {
    // Get student data for current user
    const student = await Student.findByUserId(req.user.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    // Get user data
    const user = await User.findById(req.user.id);

    // Get student courses
    let courses = [];
    try {
      courses = await Student.getCourses(student.id);
    } catch (error) {
      console.log('Courses not available for profile');
    }

    // Get student statistics
    let stats = {};
    try {
      stats = await Student.getStats(student.id);
    } catch (error) {
      console.log('Stats not available for profile');
      stats = {
        total_courses: courses.length,
        completed_courses: courses.filter(c => c.progress >= 100).length,
        average_grade: 75,
        attendance_rate: 95
      };
    }

    res.json({
      success: true,
      data: {
        ...student,
        user: {
          username: user.username,
          email: user.email,
          profile_image: user.profile_image,
          phone: user.phone,
          created_at: user.created_at,
          last_login: user.last_login
        },
        courses,
        stats
      }
    });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin/Lecturer)
exports.getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.enrollment_year) filters.enrollment_year = req.query.enrollment_year;
    if (req.query.search) filters.search = req.query.search;

    const students = await Student.findAll(limit, offset, filters);
    
    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM students'
    );
    const total = countResult[0].total;

    res.json({
      success: true,
      count: students.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Check authorization - students can only view their own data
    if (req.user.role === 'student' && student.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this student'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Check authorization
    if (req.user.role === 'student' && student.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this student'
      });
    }

    // Validate and filter update data
    const validFields = [
      'full_name', 'date_of_birth', 'id_number', 'nationality', 'gender',
      'phone', 'email', 'address', 'emergency_contact'
    ];
    
    const updateData = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (validFields.includes(key) && value !== undefined) {
        updateData[key] = value;
      }
    }

    // Also update user data if full_name changed
    if (updateData.full_name && student.user_id) {
      await User.update(student.user_id, { full_name: updateData.full_name });
    }

    const updated = await Student.update(req.params.id, updateData);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    // Get updated student
    const updatedStudent = await Student.findById(req.params.id);

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const deleted = await Student.delete(req.params.id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete student'
      });
    }

    // Also delete associated user if exists
    if (student.user_id) {
      await User.delete(student.user_id);
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get student courses (for admin/lecturer view)
// @route   GET /api/students/:id/courses
// @access  Private
exports.getStudentCoursesById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Check authorization
    if (req.user.role === 'student' && student.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this student\'s courses'
      });
    }

    let courses;
    try {
      courses = await Student.getCourses(req.params.id);
    } catch (error) {
      courses = []; // Return empty if courses don't exist
    }

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Get student courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Enroll student in course
// @route   POST /api/students/:id/enroll
// @access  Private (Student/Admin)
exports.enrollInCourse = async (req, res) => {
  try {
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({
        success: false,
        error: 'Course ID is required'
      });
    }

    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Check authorization
    if (req.user.role === 'student' && student.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to enroll this student'
      });
    }

    // Check if course exists
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if student is already enrolled
    const [existingEnrollment] = await pool.execute(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
      [req.params.id, course_id]
    );

    if (existingEnrollment.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Student is already enrolled in this course'
      });
    }

    // Enroll student
    try {
      const result = await Student.enrollInCourse(req.params.id, course_id);
      
      res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        enrollmentId: result.id
      });
    } catch (error) {
      if (error.message === 'Student already enrolled in this course') {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get student assignments
// @route   GET /api/students/:id/assignments
// @access  Private
exports.getStudentAssignments = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Check authorization
    if (req.user.role === 'student' && student.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this student\'s assignments'
      });
    }

    const assignments = await Student.getAssignments(req.params.id);

    res.json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search students
// @route   GET /api/students/search
// @access  Private (Admin/Lecturer)
exports.searchStudents = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const students = await Student.search(query);

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Search students error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/students/:id/stats
// @access  Private
exports.getStudentStats = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Check authorization
    if (req.user.role === 'student' && student.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this student\'s statistics'
      });
    }

    const stats = await Student.getStats(req.params.id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};