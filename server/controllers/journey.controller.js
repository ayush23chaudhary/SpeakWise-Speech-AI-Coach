const User = require('../models/User.model');
const UserProgress = require('../models/UserProgress.model');
const JourneyCopilotService = require('../services/journeyCopilot.service');

/**
 * Get user's journey progress
 */
exports.getJourneyProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Fetch user with journey progress
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

    // Get journey data
    const completedTasks = user.journeyProgress.completedTasks || [];
    const completedCount = completedTasks.length;
    const avgScore = completedCount > 0
      ? completedTasks.reduce((sum, t) => sum + (t.score || 0), 0) / completedCount
      : 0;
    
    const currentLevel = user.journeyProgress.currentLevel || 1;
    const progressToNext = calculateLevelProgress(completedCount, avgScore, currentLevel);
    
    // Get current task recommendation
    const lastTask = completedTasks[completedTasks.length - 1];
    const currentTask = await JourneyCopilotService.generateNextTask({
      userId,
      currentLevel,
      userGoal: user.onboarding?.user_purpose || 'interviews_evaluations',
      weaknesses: user.preferences?.focusAreas || [],
      lastPerformance: lastTask ? {
        fluency: lastTask.score || 70,
        confidence: 70,
        clarity: lastTask.score || 70,
        fillerCount: 0
      } : null
    });
    
    res.json({
      currentLevel,
      progress: user.journeyProgress.skillProgress || {},
      progressToNext,
      totalSessions: completedCount,
      avgScore: Math.round(avgScore),
      currentTask,
      completedTasks: completedTasks.map(t => t.taskId),
      journey: {
        level: currentLevel,
        unlocked: [1, 2, 3, 4].filter(l => l <= currentLevel),
        nextMilestone: getNextMilestone(currentLevel, completedCount, avgScore)
      }
    });
    
  } catch (error) {
    console.error('Error fetching journey progress:', error);
    res.status(500).json({ 
      error: 'Failed to fetch journey progress',
      message: error.message 
    });
  }
};

/**
 * Generate next personalized task
 */
exports.generateNextTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentLevel, userGoal, weaknesses } = req.body;
    
    // Get user's last performance
    const progress = await UserProgress.findOne({ userId });
    const lastSession = progress?.sessions?.[progress.sessions.length - 1];
    
    const task = await JourneyCopilotService.generateNextTask({
      userId,
      currentLevel: currentLevel || 1,
      userGoal: userGoal || 'interviews_evaluations',
      weaknesses: weaknesses || [],
      lastPerformance: lastSession ? {
        fluency: lastSession.fluency || 70,
        confidence: lastSession.confidence || 70,
        clarity: lastSession.clarity || 70,
        fillerCount: lastSession.fillerCount || 0
      } : null
    });
    
    res.json({ task });
    
  } catch (error) {
    console.error('Error generating task:', error);
    res.status(500).json({ 
      error: 'Failed to generate task',
      message: error.message 
    });
  }
};

/**
 * Complete a task
 */
exports.completeTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const { taskId, taskTitle, taskType, score, reportId } = req.body;
    
    // Get user and update journey progress
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
    }

    // Check if task already completed
    const alreadyCompleted = user.journeyProgress.completedTasks.some(
      task => task.taskId === taskId
    );

    if (!alreadyCompleted) {
      // Add completed task
      user.journeyProgress.completedTasks.push({
        taskId,
        taskTitle,
        taskType,
        completedAt: new Date(),
        score: score || 0,
        reportId: reportId || null
      });

      // Update skill progress based on task type and score
      if (score >= 70) {
        // Map task IDs to skills
        const taskSkillMap = {
          'intro': ['pronunciation', 'sentences'],
          'read-aloud': ['pronunciation', 'pace'],
          'repeat': ['pronunciation', 'flow'],
          'describe-picture': ['fillers', 'flow'],
          'no-fillers': ['fillers', 'pauses'],
          'smooth-talk': ['flow', 'pauses'],
          'story-time': ['storytelling', 'organization'],
          'opinion': ['confidence', 'organization'],
          'structure': ['organization', 'storytelling']
        };

        const skills = taskSkillMap[taskId] || [];
        skills.forEach(skill => {
          if (user.journeyProgress.skillProgress) {
            user.journeyProgress.skillProgress[skill] = true;
          }
        });
      }

      user.journeyProgress.lastUpdated = new Date();
      await user.save();
    }

    // Calculate if user should level up
    const completedCount = user.journeyProgress.completedTasks.length;
    const avgScore = user.journeyProgress.completedTasks.reduce((sum, t) => sum + (t.score || 0), 0) / completedCount || 0;
    
    // Count unique tasks completed per level
    const level1Tasks = ['intro', 'read-aloud', 'repeat'];
    const level2Tasks = ['describe-picture', 'topic-talk', 'sentence-reform'];
    const level3Tasks = ['story-time', 'opinion', 'structure'];
    
    const completedLevel1 = user.journeyProgress.completedTasks.filter(t => level1Tasks.includes(t.taskId)).length;
    const completedLevel2 = user.journeyProgress.completedTasks.filter(t => level2Tasks.includes(t.taskId)).length;
    const completedLevel3 = user.journeyProgress.completedTasks.filter(t => level3Tasks.includes(t.taskId)).length;
    
    let shouldLevelUp = false;
    let newLevel = user.journeyProgress.currentLevel;

    // Level 1 to 2: Complete all 3 Foundation tasks with avg score >= 65
    if (user.journeyProgress.currentLevel === 1 && completedLevel1 >= 3 && avgScore >= 65) {
      shouldLevelUp = true;
      newLevel = 2;
    } 
    // Level 2 to 3: Complete all 3 Clarity tasks with avg score >= 70
    else if (user.journeyProgress.currentLevel === 2 && completedLevel2 >= 3 && avgScore >= 70) {
      shouldLevelUp = true;
      newLevel = 3;
    } 
    // Level 3 to 4: Complete all 3 Confidence tasks with avg score >= 75
    else if (user.journeyProgress.currentLevel === 3 && completedLevel3 >= 3 && avgScore >= 75) {
      shouldLevelUp = true;
      newLevel = 4;
    }

    if (shouldLevelUp) {
      user.journeyProgress.currentLevel = newLevel;
      await user.save();
    }

    res.json({
      success: true,
      alreadyCompleted,
      completedTasks: user.journeyProgress.completedTasks,
      skillProgress: user.journeyProgress.skillProgress,
      shouldLevelUp,
      newLevel: user.journeyProgress.currentLevel,
      message: shouldLevelUp 
        ? `🎉 Congratulations! You've leveled up to Level ${newLevel}!`
        : alreadyCompleted 
          ? 'Task already completed'
          : '✅ Task completed successfully!'
    });
    
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ 
      error: 'Failed to complete task',
      message: error.message 
    });
  }
};

/**
 * Update user level
 */
exports.updateLevel = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newLevel } = req.body;
    
    // Update user's level in their profile
    await User.findByIdAndUpdate(userId, {
      'preferences.difficultyLevel': 
        newLevel === 1 ? 'beginner' :
        newLevel === 2 ? 'intermediate' :
        newLevel === 3 ? 'advanced' : 'advanced'
    });
    
    res.json({
      success: true,
      newLevel,
      message: `Congratulations! You've reached Level ${newLevel}!`
    });
    
  } catch (error) {
    console.error('Error updating level:', error);
    res.status(500).json({ 
      error: 'Failed to update level',
      message: error.message 
    });
  }
};

// Helper functions

function calculateLevelProgress(sessionsCount, avgScore, currentLevel) {
  // Define requirements for each level (3 tasks per level)
  const requirements = {
    1: { sessions: 3, score: 65 },
    2: { sessions: 3, score: 70 },
    3: { sessions: 3, score: 75 },
    4: { sessions: 999, score: 100 } // Max level
  };
  
  if (currentLevel >= 4) return 100;
  
  const nextReq = requirements[currentLevel] || requirements[1];
  
  // Calculate progress based on both sessions and score
  const sessionProgress = Math.min(100, (sessionsCount / nextReq.sessions) * 100);
  const scoreProgress = Math.min(100, (avgScore / nextReq.score) * 100);
  
  // Average of both
  return Math.round((sessionProgress + scoreProgress) / 2);
}

function getNextMilestone(level, sessions, avgScore) {
  const milestones = {
    1: { sessions: 3, score: 65, description: 'Complete all 3 Foundation tasks with 65+ avg score to reach Level 2' },
    2: { sessions: 3, score: 70, description: 'Complete all 3 Clarity tasks with 70+ avg score to reach Level 3' },
    3: { sessions: 3, score: 75, description: 'Complete all 3 Confidence tasks with 75+ avg score to reach Level 4' },
    4: { sessions: 999, score: 100, description: 'You\'ve reached the maximum level! Keep practicing to maintain mastery.' }
  };
  
  return milestones[level] || milestones[1];
}
