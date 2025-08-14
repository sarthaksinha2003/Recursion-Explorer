const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Algorithm = require('../models/Algorithm');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile with statistics
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get user's algorithm statistics
    const algorithmStats = await Algorithm.aggregate([
      { $match: { author: user._id } },
      {
        $group: {
          _id: null,
          totalAlgorithms: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } },
          publicAlgorithms: {
            $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = algorithmStats[0] || {
      totalAlgorithms: 0,
      totalViews: 0,
      totalLikes: 0,
      publicAlgorithms: 0
    };

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        bookmarks: user.bookmarks,
        createdAt: user.createdAt
      },
      stats
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        bookmarks: user.bookmarks
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get dashboard data for user
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's algorithms
    const algorithms = await Algorithm.find({ author: req.user.id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title description language category isPublic views likes createdAt updatedAt');

    const totalAlgorithms = await Algorithm.countDocuments({ author: req.user.id });

    // Get recent activity (algorithms user has liked)
    const recentLikes = await Algorithm.find({ 
      likes: req.user.id,
      author: { $ne: req.user.id }
    })
      .populate('author', 'name')
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title author createdAt');

    res.json({
      algorithms,
      recentLikes,
      pagination: {
        current: page,
        pages: Math.ceil(totalAlgorithms / limit),
        total: totalAlgorithms,
        hasNext: page < Math.ceil(totalAlgorithms / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { password } = req.body;
    
    // Get user with password for verification
    const user = await User.findById(req.user.id).select('+password');
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Delete user's algorithms
    await Algorithm.deleteMany({ author: req.user.id });

    // Delete user account
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;