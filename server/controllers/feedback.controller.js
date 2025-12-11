const Feedback = require('../models/Feedback.model');
const jwt = require('jsonwebtoken');

// Submit feedback (guest or authenticated user)
exports.submitFeedback = async (req, res) => {
  try {
    console.log('📝 Feedback submission received');
    const { rating, comment, email, sessionId } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user is authenticated
    let userId = null;
    let userType = 'guest';
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        userId = decoded.userId;
        userType = 'authenticated';
        console.log('   - Authenticated user feedback:', decoded.userId);
      } catch (error) {
        console.log('   - Guest user feedback (invalid token)');
      }
    } else {
      console.log('   - Guest user feedback (no token)');
    }

    // Create feedback
    const feedback = new Feedback({
      user: userId,
      rating: parseInt(rating),
      comment: comment?.trim() || '',
      email: email?.trim() || '',
      userType,
      sessionId: sessionId || null,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      status: 'pending'
    });

    await feedback.save();

    console.log('✅ Feedback saved:', {
      id: feedback._id,
      rating: feedback.rating,
      userType: feedback.userType
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: {
        feedbackId: feedback._id,
        rating: feedback.rating
      }
    });

  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

// Get all feedback (admin only - we'll add auth later)
exports.getAllFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 20, rating, userType, status } = req.query;

    const query = {};
    if (rating) query.rating = parseInt(rating);
    if (userType) query.userType = userType;
    if (status) query.status = status;

    const feedback = await Feedback.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

// Get feedback statistics
exports.getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          guestFeedback: {
            $sum: { $cond: [{ $eq: ['$userType', 'guest'] }, 1, 0] }
          },
          authenticatedFeedback: {
            $sum: { $cond: [{ $eq: ['$userType', 'authenticated'] }, 1, 0] }
          }
        }
      }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalFeedback: 0,
          averageRating: 0,
          guestFeedback: 0,
          authenticatedFeedback: 0
        },
        ratingDistribution
      }
    });

  } catch (error) {
    console.error('❌ Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics',
      error: error.message
    });
  }
};
