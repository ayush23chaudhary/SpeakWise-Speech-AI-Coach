const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // User info (optional - guests may not have accounts)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Feedback details
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Metadata
  userType: {
    type: String,
    enum: ['guest', 'authenticated'],
    required: true
  },
  
  // Optional contact info from guests
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Session info
  sessionId: {
    type: String,
    default: null
  },
  
  // User agent and IP for analytics
  userAgent: String,
  ipAddress: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'archived'],
    default: 'pending'
  },
  
  // Admin notes
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ userType: 1 });
feedbackSchema.index({ status: 1 });

// Virtual for getting star display
feedbackSchema.virtual('stars').get(function() {
  return '⭐'.repeat(this.rating);
});

// Instance method to check if feedback is from guest
feedbackSchema.methods.isGuest = function() {
  return this.userType === 'guest';
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
