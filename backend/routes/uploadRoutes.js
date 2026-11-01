const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/uploadMiddleware');

// All routes protected
router.use(protect);

// Upload single file
router.post('/', 
  uploadSingle('file'),
  handleUploadError,
  uploadController.uploadFile
);

// Upload multiple files
router.post('/multiple', 
  uploadMultiple('files', 10),
  handleUploadError,
  uploadController.uploadMultipleFiles
);

// File management
router.delete('/', uploadController.deleteUploadedFile);
router.get('/:filename', uploadController.getFileInfo);

module.exports = router;