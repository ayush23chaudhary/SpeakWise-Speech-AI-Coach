const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getUserProgress,
  getUserProfile,
  updateUserProfile
} = require('../controllers/user.controller');

// All routes require authentication
router.use(auth);

// Get user progress
router.get('/progress', getUserProgress);

// Get user profile
router.get('/profile', getUserProfile);

// Update user profile
router.put('/profile', updateUserProfile);

module.exports = router;
