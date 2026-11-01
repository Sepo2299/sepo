const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes protected
router.use(protect);

// ========== E-LEARNING PORTAL ROUTES ==========
// Add these routes at the top
router.get('/dashboard', authorize('student'), studentController.getDashboard);
router.get('/courses/me', authorize('student'), studentController.getStudentCourses); // Changed endpoint

// Student profile routes
router.get('/me/profile', authorize('student'), studentController.getMyProfile);

// ========== ADMIN/MANAGEMENT ROUTES ==========
// Existing routes
router.get('/', authorize('admin', 'lecturer'), studentController.getStudents);
router.get('/search', authorize('admin', 'lecturer'), studentController.searchStudents);
router.get('/:id', studentController.getStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', authorize('admin'), studentController.deleteStudent);
router.get('/:id/courses', studentController.getStudentCourses); // This is for admin view
router.get('/:id/assignments', studentController.getStudentAssignments);
router.get('/:id/stats', studentController.getStudentStats);
router.post('/:id/enroll', studentController.enrollInCourse);

module.exports = router;