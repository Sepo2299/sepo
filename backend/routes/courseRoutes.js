const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', courseController.getCourses);
router.get('/search', courseController.searchCourses);
router.get('/school/:school', courseController.getCoursesBySchool);
router.get('/:id', courseController.getCourse);
router.get('/:id/materials', optionalAuth, courseController.getCourseMaterials);

// Protected routes
router.use(protect);

router.post('/', authorize('admin', 'lecturer'), courseController.createCourse);
router.put('/:id', authorize('admin', 'lecturer'), courseController.updateCourse);
router.delete('/:id', authorize('admin'), courseController.deleteCourse);

// Course materials (lecturer/admin only)
router.post('/:id/materials', 
  authorize('admin', 'lecturer'),
  uploadSingle('course_material'),
  courseController.addCourseMaterial
);

// Course students (lecturer/admin only)
router.get('/:id/students', 
  authorize('admin', 'lecturer'), 
  courseController.getEnrolledStudents
);

// Course assignments
router.get('/:id/assignments', 
  authorize('student', 'lecturer', 'admin'),
  courseController.getCourseAssignments
);

// Course statistics (lecturer/admin only)
router.get('/:id/stats', 
  authorize('admin', 'lecturer'),
  courseController.getCourseStats
);

module.exports = router;