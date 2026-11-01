const Course = require('../models/Course');
const Student = require('../models/Student');
const pool = require('../config/database');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.school) filters.school = req.query.school;
    if (req.query.lecturer_id) filters.lecturer_id = req.query.lecturer_id;
    if (req.query.search) filters.search = req.query.search;

    const courses = await Course.findAll(limit, offset, filters);
    
    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM courses WHERE is_active = TRUE'
    );
    const total = countResult[0].total;

    res.json({
      success: true,
      count: courses.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Admin/Lecturer)
exports.createCourse = async (req, res) => {
  try {
    const {
      course_code,
      course_name,
      school,
      description,
      lecturer_id,
      credits,
      duration,
      prerequisites
    } = req.body;

    // Validate required fields
    if (!course_code || !course_name || !school) {
      return res.status(400).json({
        success: false,
        error: 'Course code, name, and school are required'
      });
    }

    // Check if course code already exists
    const existingCourse = await Course.findByCode(course_code);
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: 'Course code already exists'
      });
    }

    const courseId = await Course.create({
      course_code,
      course_name,
      school,
      description,
      lecturer_id: lecturer_id || req.user.id,
      credits,
      duration,
      prerequisites
    });

    const course = await Course.findById(courseId);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin/Lecturer)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check authorization - lecturers can only update their own courses
    if (req.user.role === 'lecturer' && course.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this course'
      });
    }

    // Validate and filter update data
    const validFields = [
      'course_name', 'school', 'description', 'lecturer_id', 
      'credits', 'duration', 'prerequisites', 'is_active'
    ];
    
    const updateData = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (validFields.includes(key) && value !== undefined) {
        updateData[key] = value;
      }
    }

    const updated = await Course.update(req.params.id, updateData);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    // Get updated course
    const updatedCourse = await Course.findById(req.params.id);

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const deleted = await Course.delete(req.params.id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete course'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get course materials
// @route   GET /api/courses/:id/materials
// @access  Public (or Private for enrolled students)
exports.getCourseMaterials = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is enrolled (for private access)
    if (req.user && req.user.role === 'student') {
      const student = await Student.findByUserId(req.user.id);
      if (student) {
        const [enrollment] = await pool.execute(
          'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
          [student.id, req.params.id]
        );
        
        if (enrollment.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'You must be enrolled in this course to access materials'
          });
        }
      }
    }

    const materials = await Course.getMaterials(req.params.id);

    res.json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    console.error('Get course materials error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Add course material
// @route   POST /api/courses/:id/materials
// @access  Private (Lecturer/Admin)
exports.addCourseMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check authorization - lecturers can only add materials to their own courses
    if (req.user.role === 'lecturer' && course.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add materials to this course'
      });
    }

    const { title, description, file_type } = req.body;
    const file_path = req.file ? req.file.path : null;
    const file_size = req.file ? req.file.size : null;

    if (!title || !file_path) {
      return res.status(400).json({
        success: false,
        error: 'Title and file are required'
      });
    }

    const materialId = await Course.addMaterial(req.params.id, {
      title,
      description,
      file_path,
      file_type: file_type || 'other',
      file_size,
      uploaded_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Course material added successfully',
      materialId
    });
  } catch (error) {
    console.error('Add course material error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get enrolled students
// @route   GET /api/courses/:id/students
// @access  Private (Lecturer/Admin)
exports.getEnrolledStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check authorization - lecturers can only view students in their own courses
    if (req.user.role === 'lecturer' && course.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view students in this course'
      });
    }

    const students = await Course.getEnrolledStudents(req.params.id);

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Get enrolled students error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get course assignments
// @route   GET /api/courses/:id/assignments
// @access  Private (Lecturer/Enrolled Students)
exports.getCourseAssignments = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is enrolled or is lecturer
    if (req.user.role === 'student') {
      const student = await Student.findByUserId(req.user.id);
      if (student) {
        const [enrollment] = await pool.execute(
          'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
          [student.id, req.params.id]
        );
        
        if (enrollment.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'You must be enrolled in this course to view assignments'
          });
        }
      }
    } else if (req.user.role === 'lecturer' && course.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view assignments for this course'
      });
    }

    const assignments = await Course.getAssignments(req.params.id);

    res.json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    console.error('Get course assignments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get course statistics
// @route   GET /api/courses/:id/stats
// @access  Private (Lecturer/Admin)
exports.getCourseStats = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check authorization
    if (req.user.role === 'lecturer' && course.lecturer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view statistics for this course'
      });
    }

    const stats = await Course.getStats(req.params.id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search courses
// @route   GET /api/courses/search
// @access  Public
exports.searchCourses = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const courses = await Course.search(query);

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Search courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get courses by school
// @route   GET /api/courses/school/:school
// @access  Public
exports.getCoursesBySchool = async (req, res) => {
  try {
    const { school } = req.params;
    
    const validSchools = ['science', 'computers', 'automotive', 'entertainment'];
    if (!validSchools.includes(school)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid school name'
      });
    }

    const courses = await Course.findBySchool(school);

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Get courses by school error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};