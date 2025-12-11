const express = require('express');
const router = express.Router();
const { 
  submitFeedback, 
  getAllFeedback, 
  getFeedbackStats 
} = require('../controllers/feedback.controller');
const auth = require('../middleware/auth');

// Public route - anyone can submit feedback
router.post('/submit', submitFeedback);

// Protected routes - for admin use (we can add admin middleware later)
router.get('/all', auth, getAllFeedback);
router.get('/stats', auth, getFeedbackStats);

module.exports = router;
