const User = require('../models/User.model');
const UserProgress = require('../models/UserProgress.model');

/**
 * Get user's overall progress
 */
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize journeyProgress if it doesn't exist
    if (!user.journeyProgress) {
      user.journeyProgress = {
        currentLevel: 1,
        completedTasks: [],
        skillProgress: {},
        lastUpdated: new Date()
      };
      await user.save();
    }

    // Get user progress data
    const userProgress = await UserProgress.findOne({ userId });

    // Calculate progress percentage based on current level
    const currentLevel = user.journeyProgress.currentLevel || 1;
    const completedTasks = user.journeyProgress.completedTasks || [];
    
    // Level thresholds: L1→L2: 5 tasks, L2→L3: 10 tasks, L3→L4: 15 tasks
    const levelThresholds = [5, 10, 15];
    const threshold = levelThresholds[currentLevel - 1] || 15;
    const progressPercentage = Math.min(100, Math.round((completedTasks.length / threshold) * 100));

    res.json({
      level: currentLevel,
      progress: progressPercentage,
      journey: user.journeyProgress,
      sessions: userProgress?.sessions || [],
      completedExercises: userProgress?.completedExercises || [],
      dailyStreak: userProgress?.dailyStreak || {
        current: 0,
        longest: 0,
        lastPracticeDate: null
      },
      skillLevels: userProgress?.skillLevels || {
        pronunciation: 0,
        fluency: 0,
        pacing: 0,
        confidence: 0,
        vocabulary: 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user progress',
      message: error.message 
    });
  }
};

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user profile',
      message: error.message 
    });
  }
};

/**
 * Update user profile
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Don't allow updating sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates.googleId;
    delete updates.githubId;
    delete updates.provider;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      error: 'Failed to update user profile',
      message: error.message 
    });
  }
};
