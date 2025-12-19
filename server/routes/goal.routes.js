// server/routes/goal.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createGoal,
    getUserGoals,
    updateGoal,
    updateGoalProgress,
    deleteGoal
} = require('../controllers/goal.controller');

// All routes require authentication
router.use(auth);

// Base URL: /api/goals

// Create a new goal
router.post('/', createGoal);

// Get all user goals
router.get('/', getUserGoals);

// Update a goal
router.put('/:id', updateGoal);

// Update goal progress
router.put('/:id/progress', updateGoalProgress);

// Delete a goal
router.delete('/:id', deleteGoal);

module.exports = router;
