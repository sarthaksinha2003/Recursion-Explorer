const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Algorithm = require('../models/Algorithm');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/algorithms
// @desc    Get algorithms (public and user's own)
// @access  Public/Private (optional auth)
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['Recursion', 'Backtracking', 'Memoization', 'Custom']),
  query('search').optional().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { category, search, author } = req.query;

    // Build query
    let query = {};
    
    if (req.user) {
      // If authenticated, show public algorithms and user's own
      query = {
        $or: [
          { isPublic: true },
          { author: req.user.id }
        ]
      };
    } else {
      // If not authenticated, only show public algorithms
      query = { isPublic: true };
    }

    if (category) {
      query.category = category;
    }

    if (author && req.user) {
      query.author = author;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const algorithms = await Algorithm.find(query)
      .populate('author', 'name')
      .select('-code') // Don't include code in list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Algorithm.countDocuments(query);

    res.json({
      algorithms,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/algorithms/:id
// @desc    Get single algorithm
// @access  Public/Private
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const algorithm = await Algorithm.findById(req.params.id)
      .populate('author', 'name');

    if (!algorithm) {
      return res.status(404).json({ message: 'Algorithm not found' });
    }

    // Check if user can access this algorithm
    if (!algorithm.isPublic && (!req.user || algorithm.author._id.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment view count
    algorithm.views += 1;
    await algorithm.save();

    res.json({ algorithm });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid algorithm ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/algorithms
// @desc    Create new algorithm
// @access  Private
router.post('/', auth, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('code')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Code must be between 1 and 10000 characters'),
  body('language')
    .isIn(['javascript', 'java'])
    .withMessage('Language must be javascript or java'),
  body('category')
    .optional()
    .isIn(['Recursion', 'Backtracking', 'Memoization', 'Custom'])
    .withMessage('Invalid category'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const algorithmData = {
      ...req.body,
      author: req.user.id
    };

    // Payload prepared

    const algorithm = new Algorithm(algorithmData);
    await algorithm.save();

    await algorithm.populate('author', 'name');

    res.status(201).json({
      message: 'Algorithm created successfully',
      algorithm
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   PUT /api/algorithms/:id
// @desc    Update algorithm
// @access  Private (owner only)
router.put('/:id', auth, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('code')
    .optional()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Code must be between 1 and 10000 characters'),
  body('language')
    .optional()
    .isIn(['javascript', 'java'])
    .withMessage('Language must be javascript or java'),
  body('category')
    .optional()
    .isIn(['Recursion', 'Backtracking', 'Memoization', 'Custom'])
    .withMessage('Invalid category'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const algorithm = await Algorithm.findById(req.params.id);

    if (!algorithm) {
      return res.status(404).json({ message: 'Algorithm not found' });
    }

    // Check if user owns this algorithm
    if (algorithm.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this algorithm' });
    }

    const allowedUpdates = ['title', 'description', 'code', 'language', 'category', 'isPublic', 'tags'];
    const updates = {};

    allowedUpdates.forEach(update => {
      if (req.body[update] !== undefined) {
        updates[update] = req.body[update];
      }
    });

    const updatedAlgorithm = await Algorithm.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('author', 'name');

    res.json({
      message: 'Algorithm updated successfully',
      algorithm: updatedAlgorithm
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid algorithm ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/algorithms/:id
// @desc    Delete algorithm
// @access  Private (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const algorithm = await Algorithm.findById(req.params.id);

    if (!algorithm) {
      return res.status(404).json({ message: 'Algorithm not found' });
    }

    // Check if user owns this algorithm
    if (algorithm.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this algorithm' });
    }

    await Algorithm.findByIdAndDelete(req.params.id);

    res.json({ message: 'Algorithm deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid algorithm ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/algorithms/:id/like
// @desc    Toggle like on algorithm
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const algorithm = await Algorithm.findById(req.params.id);

    if (!algorithm) {
      return res.status(404).json({ message: 'Algorithm not found' });
    }

    const likeIndex = algorithm.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Remove like
      algorithm.likes.splice(likeIndex, 1);
    } else {
      // Add like
      algorithm.likes.push(req.user.id);
    }

    await algorithm.save();

    res.json({
      message: likeIndex > -1 ? 'Like removed' : 'Algorithm liked',
      likeCount: algorithm.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid algorithm ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;