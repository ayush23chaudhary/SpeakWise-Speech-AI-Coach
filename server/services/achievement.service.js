// server/services/achievement.service.js
const Achievement = require('../models/Achievement.model');
const User = require('../models/User.model');
const AnalysisReport = require('../models/AnalysisReport.model');

// Predefined achievements/badges
const DEFAULT_ACHIEVEMENTS = [
  {
    badgeId: 'first_session',
    name: 'First Steps',
    description: 'Complete your first practice session',
    icon: '🎯',
    category: 'milestone',
    criteria: { type: 'sessions_count', value: 1 },
    points: 10,
    rarity: 'common'
  },
  {
    badgeId: 'ten_sessions',
    name: 'Getting Started',
    description: 'Complete 10 practice sessions',
    icon: '🔟',
    category: 'milestone',
    criteria: { type: 'sessions_count', value: 10 },
    points: 25,
    rarity: 'common'
  },
  {
    badgeId: 'fifty_sessions',
    name: 'Dedicated Learner',
    description: 'Complete 50 practice sessions',
    icon: '💪',
    category: 'milestone',
    criteria: { type: 'sessions_count', value: 50 },
    points: 50,
    rarity: 'rare'
  },
  {
    badgeId: 'hundred_sessions',
    name: 'Century Club',
    description: 'Complete 100 practice sessions',
    icon: '💯',
    category: 'milestone',
    criteria: { type: 'sessions_count', value: 100 },
    points: 100,
    rarity: 'epic'
  },
  {
    badgeId: 'three_day_streak',
    name: 'Consistency',
    description: 'Practice for 3 days in a row',
    icon: '🔥',
    category: 'streak',
    criteria: { type: 'streak_days', value: 3 },
    points: 15,
    rarity: 'common'
  },
  {
    badgeId: 'week_streak',
    name: 'Week Warrior',
    description: 'Practice for 7 days in a row',
    icon: '⚡',
    category: 'streak',
    criteria: { type: 'streak_days', value: 7 },
    points: 30,
    rarity: 'rare'
  },
  {
    badgeId: 'month_streak',
    name: 'Monthly Master',
    description: 'Practice for 30 days in a row',
    icon: '🏆',
    category: 'streak',
    criteria: { type: 'streak_days', value: 30 },
    points: 100,
    rarity: 'epic'
  },
  {
    badgeId: 'hundred_day_streak',
    name: 'Legend',
    description: 'Practice for 100 days in a row',
    icon: '👑',
    category: 'streak',
    criteria: { type: 'streak_days', value: 100 },
    points: 250,
    rarity: 'legendary'
  },
  {
    badgeId: 'score_70',
    name: 'Good Performance',
    description: 'Achieve a score of 70 or higher',
    icon: '⭐',
    category: 'performance',
    criteria: { type: 'score_threshold', value: 70 },
    points: 20,
    rarity: 'common'
  },
  {
    badgeId: 'score_85',
    name: 'Great Performance',
    description: 'Achieve a score of 85 or higher',
    icon: '🌟',
    category: 'performance',
    criteria: { type: 'score_threshold', value: 85 },
    points: 40,
    rarity: 'rare'
  },
  {
    badgeId: 'score_95',
    name: 'Outstanding',
    description: 'Achieve a score of 95 or higher',
    icon: '✨',
    category: 'performance',
    criteria: { type: 'score_threshold', value: 95 },
    points: 75,
    rarity: 'epic'
  },
  {
    badgeId: 'perfect_score',
    name: 'Perfection',
    description: 'Achieve a perfect score of 100',
    icon: '💎',
    category: 'performance',
    criteria: { type: 'score_threshold', value: 100 },
    points: 150,
    rarity: 'legendary'
  },
  {
    badgeId: 'ten_hours',
    name: 'Time Invested',
    description: 'Practice for 10 hours total',
    icon: '⏰',
    category: 'practice',
    criteria: { type: 'hours_practiced', value: 10 },
    points: 30,
    rarity: 'common'
  },
  {
    badgeId: 'fifty_hours',
    name: 'Dedicated Speaker',
    description: 'Practice for 50 hours total',
    icon: '⏱️',
    category: 'practice',
    criteria: { type: 'hours_practiced', value: 50 },
    points: 75,
    rarity: 'rare'
  },
  {
    badgeId: 'hundred_hours',
    name: 'Master of Practice',
    description: 'Practice for 100 hours total',
    icon: '🎓',
    category: 'practice',
    criteria: { type: 'hours_practiced', value: 100 },
    points: 150,
    rarity: 'epic'
  },
  {
    badgeId: 'improvement_20',
    name: 'Growing Speaker',
    description: 'Improve your average score by 20%',
    icon: '📈',
    category: 'performance',
    criteria: { type: 'improvement_rate', value: 20 },
    points: 50,
    rarity: 'rare'
  },
  {
    badgeId: 'improvement_50',
    name: 'Remarkable Progress',
    description: 'Improve your average score by 50%',
    icon: '🚀',
    category: 'performance',
    criteria: { type: 'improvement_rate', value: 50 },
    points: 100,
    rarity: 'epic'
  },
  {
    badgeId: 'early_bird',
    name: 'Early Bird',
    description: 'Practice 7 sessions before 8 AM',
    icon: '🌅',
    category: 'practice',
    criteria: { type: 'sessions_count', value: 7 },
    points: 30,
    rarity: 'rare'
  },
  {
    badgeId: 'night_owl',
    name: 'Night Owl',
    description: 'Practice 7 sessions after 10 PM',
    icon: '🦉',
    category: 'practice',
    criteria: { type: 'sessions_count', value: 7 },
    points: 30,
    rarity: 'rare'
  }
];

class AchievementService {
  // Initialize default achievements in database
  static async seedAchievements() {
    try {
      for (const achievement of DEFAULT_ACHIEVEMENTS) {
        await Achievement.findOneAndUpdate(
          { badgeId: achievement.badgeId },
          achievement,
          { upsert: true, new: true }
        );
      }
      console.log('✅ Achievements seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding achievements:', error);
    }
  }

  // Check and award new badges to user
  static async checkAndAwardBadges(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      const reports = await AnalysisReport.find({ user: userId });
      const totalSessions = reports.length;
      
      // Calculate total practice time in hours
      const totalHours = reports.reduce((sum, r) => sum + (r.duration || 0), 0) / 3600;
      
      // Get all possible achievements
      const allAchievements = await Achievement.find({ isActive: true });
      const earnedBadgeIds = user.badges.map(b => b.badgeId);
      const newBadges = [];

      for (const achievement of allAchievements) {
        // Skip if already earned
        if (earnedBadgeIds.includes(achievement.badgeId)) continue;

        let earned = false;

        switch (achievement.criteria.type) {
          case 'sessions_count':
            earned = totalSessions >= achievement.criteria.value;
            break;

          case 'streak_days':
            earned = user.currentStreak >= achievement.criteria.value;
            break;

          case 'score_threshold':
            const highScore = reports.reduce((max, r) => Math.max(max, r.overallScore), 0);
            earned = highScore >= achievement.criteria.value;
            break;

          case 'hours_practiced':
            earned = totalHours >= achievement.criteria.value;
            break;

          case 'improvement_rate':
            if (reports.length >= 10) {
              const firstFive = reports.slice(0, 5);
              const lastFive = reports.slice(-5);
              const firstAvg = firstFive.reduce((sum, r) => sum + r.overallScore, 0) / 5;
              const lastAvg = lastFive.reduce((sum, r) => sum + r.overallScore, 0) / 5;
              const improvement = ((lastAvg - firstAvg) / firstAvg) * 100;
              earned = improvement >= achievement.criteria.value;
            }
            break;
        }

        if (earned) {
          const badge = {
            badgeId: achievement.badgeId,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            earnedAt: new Date()
          };
          user.badges.push(badge);
          newBadges.push(badge);
        }
      }

      if (newBadges.length > 0) {
        await user.save();
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  // Get all achievements with user's progress
  static async getUserAchievements(userId) {
    try {
      const user = await User.findById(userId);
      const allAchievements = await Achievement.find({ isActive: true });
      const reports = await AnalysisReport.find({ user: userId });

      const totalSessions = reports.length;
      const totalHours = reports.reduce((sum, r) => sum + (r.duration || 0), 0) / 3600;
      const highScore = reports.reduce((max, r) => Math.max(max, r.overallScore), 0);

      let improvementRate = 0;
      if (reports.length >= 10) {
        const firstFive = reports.slice(0, 5);
        const lastFive = reports.slice(-5);
        const firstAvg = firstFive.reduce((sum, r) => sum + r.overallScore, 0) / 5;
        const lastAvg = lastFive.reduce((sum, r) => sum + r.overallScore, 0) / 5;
        improvementRate = ((lastAvg - firstAvg) / firstAvg) * 100;
      }

      const achievementsWithProgress = allAchievements.map(achievement => {
        const earned = user.badges.find(b => b.badgeId === achievement.badgeId);
        
        let progress = 0;
        let currentValue = 0;

        switch (achievement.criteria.type) {
          case 'sessions_count':
            currentValue = totalSessions;
            break;
          case 'streak_days':
            currentValue = user.currentStreak;
            break;
          case 'score_threshold':
            currentValue = highScore;
            break;
          case 'hours_practiced':
            currentValue = totalHours;
            break;
          case 'improvement_rate':
            currentValue = improvementRate;
            break;
        }

        progress = Math.min((currentValue / achievement.criteria.value) * 100, 100);

        return {
          ...achievement.toObject(),
          earned: !!earned,
          earnedAt: earned?.earnedAt || null,
          progress: Math.round(progress),
          currentValue: Math.round(currentValue * 10) / 10,
          targetValue: achievement.criteria.value
        };
      });

      return achievementsWithProgress;
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }
}

module.exports = AchievementService;
