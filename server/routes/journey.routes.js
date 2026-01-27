const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getJourneyProgress,
  generateNextTask,
  completeTask,
  updateLevel
} = require('../controllers/journey.controller');

// All routes require authentication
router.use(auth);

// Get user's journey progress
router.get('/progress', getJourneyProgress);

// Generate next personalized task
router.post('/next-task', generateNextTask);

// Mark task as completed
router.post('/complete-task', completeTask);

// Update user level (after evaluation)
router.post('/update-level', updateLevel);

module.exports = router;
