// server/services/streak.service.js
const User = require('../models/User.model');
const { startOfDay, differenceInDays, parseISO } = require('date-fns');

class StreakService {
  // Update user's streak when they practice
  static async updateStreak(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const today = startOfDay(new Date());
      const lastPractice = user.lastPracticeDate ? startOfDay(new Date(user.lastPracticeDate)) : null;

      if (!lastPractice) {
        // First practice ever
        user.currentStreak = 1;
        user.longestStreak = 1;
        user.totalPracticeDays = 1;
        user.lastPracticeDate = today;
      } else {
        const daysDiff = differenceInDays(today, lastPractice);

        if (daysDiff === 0) {
          // Already practiced today, no change
          return user;
        } else if (daysDiff === 1) {
          // Practiced yesterday, increment streak
          user.currentStreak += 1;
          user.totalPracticeDays += 1;
          user.lastPracticeDate = today;
          
          // Update longest streak if current is higher
          if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
          }
        } else {
          // Streak broken, reset to 1
          user.currentStreak = 1;
          user.totalPracticeDays += 1;
          user.lastPracticeDate = today;
        }
      }

      await user.save();
      return user;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  // Get streak statistics for a user
  static async getStreakStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const today = startOfDay(new Date());
      const lastPractice = user.lastPracticeDate ? startOfDay(new Date(user.lastPracticeDate)) : null;
      
      let streakStatus = 'active';
      if (lastPractice) {
        const daysDiff = differenceInDays(today, lastPractice);
        if (daysDiff > 1) {
          streakStatus = 'broken';
        } else if (daysDiff === 0) {
          streakStatus = 'completed_today';
        } else if (daysDiff === 1) {
          streakStatus = 'pending_today';
        }
      }

      return {
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        totalPracticeDays: user.totalPracticeDays || 0,
        lastPracticeDate: user.lastPracticeDate,
        streakStatus
      };
    } catch (error) {
      console.error('Error getting streak stats:', error);
      throw error;
    }
  }

  // Check all users and update streaks (can be run as a daily cron job)
  static async checkExpiredStreaks() {
    try {
      const users = await User.find({ currentStreak: { $gt: 0 } });
      const today = startOfDay(new Date());
      let updatedCount = 0;

      for (const user of users) {
        if (user.lastPracticeDate) {
          const lastPractice = startOfDay(new Date(user.lastPracticeDate));
          const daysDiff = differenceInDays(today, lastPractice);

          if (daysDiff > 1) {
            // Streak expired, reset to 0
            user.currentStreak = 0;
            await user.save();
            updatedCount++;
          }
        }
      }

      console.log(`✅ Checked ${users.length} users, reset ${updatedCount} expired streaks`);
      return updatedCount;
    } catch (error) {
      console.error('Error checking expired streaks:', error);
      throw error;
    }
  }
}

module.exports = StreakService;
