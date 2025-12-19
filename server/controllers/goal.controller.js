// server/controllers/goal.controller.js
const Goal = require('../models/Goal.model');
const User = require('../models/User.model');

// @desc Create a new goal
// @route POST /api/goals
// @access Private
const createGoal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title, description, type, targetValue, targetDate, targetSkill, priority } = req.body;

        // Prepare goal data, only include targetSkill if it's a valid value
        const goalData = {
            user: userId,
            title,
            description,
            type,
            targetValue,
            targetDate,
            priority
        };

        // Only add targetSkill if it's not empty/undefined
        if (targetSkill && targetSkill.trim() !== '') {
            goalData.targetSkill = targetSkill;
        }

        const goal = new Goal(goalData);

        await goal.save();

        res.status(201).json({ goal });
    } catch (error) {
        console.error('❌ Error creating goal:', error);
        res.status(500).json({ message: 'Error creating goal', error: error.message });
    }
};

// @desc Get all user goals
// @route GET /api/goals
// @access Private
const getUserGoals = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status } = req.query;

        const query = { user: userId };
        if (status) {
            query.status = status;
        }

        const goals = await Goal.find(query).sort({ createdAt: -1 });

        res.json({ goals });
    } catch (error) {
        console.error('❌ Error fetching goals:', error);
        res.status(500).json({ message: 'Error fetching goals', error: error.message });
    }
};

// @desc Update a goal
// @route PUT /api/goals/:id
// @access Private
const updateGoal = async (req, res) => {
    try {
        const userId = req.user._id;
        const goalId = req.params.id;
        const updates = req.body;

        const goal = await Goal.findOneAndUpdate(
            { _id: goalId, user: userId },
            { $set: updates },
            { new: true }
        );

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        res.json({ goal });
    } catch (error) {
        console.error('❌ Error updating goal:', error);
        res.status(500).json({ message: 'Error updating goal', error: error.message });
    }
};

// @desc Update goal progress
// @route PUT /api/goals/:id/progress
// @access Private
const updateGoalProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const goalId = req.params.id;
        const { currentValue } = req.body;

        const goal = await Goal.findOne({ _id: goalId, user: userId });

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        goal.currentValue = currentValue;
        await goal.save();

        res.json({ goal });
    } catch (error) {
        console.error('❌ Error updating goal progress:', error);
        res.status(500).json({ message: 'Error updating goal progress', error: error.message });
    }
};

// @desc Delete a goal
// @route DELETE /api/goals/:id
// @access Private
const deleteGoal = async (req, res) => {
    try {
        const userId = req.user._id;
        const goalId = req.params.id;

        const goal = await Goal.findOneAndDelete({ _id: goalId, user: userId });

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting goal:', error);
        res.status(500).json({ message: 'Error deleting goal', error: error.message });
    }
};

module.exports = {
    createGoal,
    getUserGoals,
    updateGoal,
    updateGoalProgress,
    deleteGoal
};
