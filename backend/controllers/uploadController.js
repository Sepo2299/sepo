const fs = require('fs');
const path = require('path');
const { deleteFile } = require('../middleware/uploadMiddleware');

// @desc    Upload file
// @route   POST /api/uploads
// @access  Private
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Upload multiple files
// @route   POST /api/uploads/multiple
// @access  Private
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      url: `${req.protocol}://${req.get('host')}/${file.path.replace(/\\/g, '/')}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      count: files.length,
      data: files
    });
  } catch (error) {
    console.error('Upload multiple files error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete file
// @route   DELETE /api/uploads
// @access  Private
exports.deleteUploadedFile = async (req, res) => {
  try {
    const { filepath } = req.body;

    if (!filepath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    // Security check: Ensure file is within uploads directory
    const uploadsDir = path.resolve(process.env.UPLOAD_PATH || './uploads');
    const filePath = path.resolve(filepath);
    
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const deleted = deleteFile(filePath);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get file information
// @route   GET /api/uploads/:filename
// @access  Private
exports.getFileInfo = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(process.env.UPLOAD_PATH || './uploads', filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const stats = fs.statSync(filepath);
    
    res.json({
      success: true,
      data: {
        filename,
        path: filepath,
        url: `${req.protocol}://${req.get('host')}/uploads/${filename}`,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory()
      }
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};