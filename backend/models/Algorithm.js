const mongoose = require('mongoose');

const algorithmSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    maxlength: [10000, 'Code cannot be more than 10000 characters']
  },
  language: {
    type: String,
    enum: ['javascript', 'java'],
    default: 'javascript'
  },
  category: {
    type: String,
    enum: ['Recursion', 'Backtracking', 'Memoization', 'Custom'],
    default: 'Custom'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  forks: [{
    originalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Algorithm'
    },
    forkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    forkedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for search functionality
algorithmSchema.index({ title: 'text', description: 'text', tags: 'text' });
algorithmSchema.index({ author: 1, createdAt: -1 });
algorithmSchema.index({ category: 1, isPublic: 1 });

// Virtual for like count
algorithmSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for fork count
algorithmSchema.virtual('forkCount').get(function() {
  return this.forks.length;
});

// Ensure virtuals are included in JSON
algorithmSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Algorithm', algorithmSchema);