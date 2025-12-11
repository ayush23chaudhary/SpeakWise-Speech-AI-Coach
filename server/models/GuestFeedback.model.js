// server/models/GuestFeedback.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * GuestFeedback Schema
 * Stores analysis results from guest users (non-authenticated)
 * Useful for:
 * - Analytics and usage patterns
 * - Improving AI models
 * - Understanding user behavior before sign-up
 * - Marketing insights
 */
const GuestFeedbackSchema = new Schema({
  // Session Information
  sessionId: {
    type: String,
    required: true,
    index: true,
    comment: 'Unique identifier for guest session (from frontend or generated)'
  },
  
  // IP and Location (for analytics, optional)
  ipAddress: {
    type: String,
    comment: 'IP address for basic analytics (anonymized after 30 days)'
  },
  
  // Analysis Results (same as AnalysisReport)
  transcript: { 
    type: String, 
    required: true,
    comment: 'Full transcribed text from speech'
  },
  
  overallScore: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100,
    comment: 'Weighted overall performance score'
  },
  
  metrics: {
    clarity: { 
      type: Number,
      min: 0,
      max: 100,
      comment: 'Speech clarity and pronunciation score'
    },
    confidence: { 
      type: Number,
      min: 0,
      max: 100,
      comment: 'Speaking confidence assessment'
    },
    fluency: { 
      type: Number,
      min: 0,
      max: 100,
      comment: 'Speech fluency and flow score'
    },
    pace: { 
      type: Number,
      min: 0,
      max: 100,
      comment: 'Speaking pace appropriateness score'
    },
    tone: { 
      type: Number,
      min: 0,
      max: 100,
      comment: 'Voice tone and engagement score'
    },
  },
  
  pace: {
    wordsPerMinute: { 
      type: Number,
      comment: 'Calculated WPM from speech'
    },
    status: { 
      type: String,
      enum: ['Too Slow', 'Good', 'Too Fast', 'N/A'],
      comment: 'Pace assessment status'
    },
  },
  
  fillerWords: { 
    type: Map, 
    of: Number,
    comment: 'Map of filler words and their counts'
  },
  
  strengths: {
    type: [String],
    comment: 'AI-generated positive feedback points'
  },
  
  areasForImprovement: {
    type: [String],
    comment: 'AI-generated areas needing work'
  },
  
  recommendations: {
    type: [String],
    comment: 'AI-generated actionable recommendations'
  },
  
  // Recording Metadata
  recordingDuration: {
    type: Number,
    comment: 'Duration of recording in seconds'
  },
  
  audioFileSize: {
    type: Number,
    comment: 'Size of audio file in bytes'
  },
  
  // User Actions (for conversion tracking)
  convertedToUser: {
    type: Boolean,
    default: false,
    comment: 'Whether this guest later created an account'
  },
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    comment: 'Reference to user if they signed up (for conversion tracking)'
  },
  
  // Feedback from Guest (optional)
  userRating: {
    type: Number,
    min: 1,
    max: 5,
    comment: 'Guest rating of the analysis (1-5 stars)'
  },
  
  userComment: {
    type: String,
    comment: 'Optional feedback comment from guest'
  },
  
  // Technical Metadata
  userAgent: {
    type: String,
    comment: 'Browser/device information'
  },
  
  platform: {
    type: String,
    comment: 'Platform (web, mobile-web, etc.)'
  },
  
  // Privacy and Compliance
  dataRetentionDate: {
    type: Date,
    comment: 'Date when this record should be anonymized/deleted (GDPR compliance)'
  },
  
}, { 
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'guestfeedbacks' // Explicit collection name
});

// Indexes for performance
GuestFeedbackSchema.index({ createdAt: -1 }); // For recent queries
GuestFeedbackSchema.index({ sessionId: 1, createdAt: -1 }); // For session tracking
GuestFeedbackSchema.index({ overallScore: -1 }); // For analytics
GuestFeedbackSchema.index({ convertedToUser: 1 }); // For conversion tracking
GuestFeedbackSchema.index({ dataRetentionDate: 1 }); // For cleanup jobs

// Automatically set data retention date (90 days for guest data)
GuestFeedbackSchema.pre('save', function(next) {
  if (!this.dataRetentionDate) {
    const retentionDays = 90; // Keep guest data for 90 days
    this.dataRetentionDate = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);
  }
  next();
});

// Static method for anonymizing old data (GDPR compliance)
GuestFeedbackSchema.statics.anonymizeExpiredData = async function() {
  const now = new Date();
  const result = await this.updateMany(
    { dataRetentionDate: { $lte: now } },
    { 
      $set: { 
        ipAddress: 'anonymized',
        userAgent: 'anonymized',
        transcript: '[REDACTED]'
      }
    }
  );
  return result;
};

// Static method for analytics
GuestFeedbackSchema.statics.getAnalytics = async function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return await this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalRecordings: { $sum: 1 },
        avgOverallScore: { $avg: '$overallScore' },
        avgClarity: { $avg: '$metrics.clarity' },
        avgFluency: { $avg: '$metrics.fluency' },
        avgPace: { $avg: '$metrics.pace' },
        avgConfidence: { $avg: '$metrics.confidence' },
        avgTone: { $avg: '$metrics.tone' },
        conversionRate: {
          $avg: { $cond: ['$convertedToUser', 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('GuestFeedback', GuestFeedbackSchema);
