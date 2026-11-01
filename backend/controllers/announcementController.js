const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
exports.getAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.search) filters.search = req.query.search;

    const announcements = await Announcement.findAll(limit, offset, filters);
    
    res.json({
      success: true,
      count: announcements.length,
      page,
      data: announcements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Public
exports.getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin/Lecturer)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, expiry_date } = req.body;
    const image_path = req.file ? req.file.path : null;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    const announcementId = await Announcement.create({
      title,
      content,
      category: category || 'general',
      image_path,
      published_by: req.user.id,
      expiry_date: expiry_date || null
    });

    const announcement = await Announcement.findById(announcementId);

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin)
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.is_published !== undefined) updateData.is_published = req.body.is_published;
    if (req.body.expiry_date !== undefined) updateData.expiry_date = req.body.expiry_date;
    
    if (req.file) {
      updateData.image_path = req.file.path;
    }

    const updated = await Announcement.update(req.params.id, updateData);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    const updatedAnnouncement = await Announcement.findById(req.params.id);

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: updatedAnnouncement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    const deleted = await Announcement.delete(req.params.id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete announcement'
      });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get recent announcements
// @route   GET /api/announcements/recent
// @access  Public
exports.getRecentAnnouncements = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const announcements = await Announcement.getRecent(limit);

    res.json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    console.error('Get recent announcements error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get announcements by category
// @route   GET /api/announcements/category/:category
// @access  Public
exports.getAnnouncementsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const announcements = await Announcement.getByCategory(category, limit);

    res.json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    console.error('Get announcements by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search announcements
// @route   GET /api/announcements/search
// @access  Public
exports.searchAnnouncements = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const announcements = await Announcement.search(query);

    res.json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    console.error('Search announcements error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get announcement statistics
// @route   GET /api/announcements/stats
// @access  Private (Admin)
exports.getAnnouncementStats = async (req, res) => {
  try {
    const stats = await Announcement.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get announcement stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};