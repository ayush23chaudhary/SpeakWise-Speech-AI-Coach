// client/src/components/profile/streaks/StreakCounter.jsx
import React from 'react';

const StreakCounter = ({ streakData }) => {
  if (!streakData) return null;

  const getStreakEmoji = (streak) => {
    if (streak === 0) return '💤';
    if (streak < 3) return '🔥';
    if (streak < 7) return '⚡';
    if (streak < 30) return '🚀';
    return '👑';
  };

  const getStreakMessage = (status) => {
    switch (status) {
      case 'completed_today':
        return 'Great job! You practiced today! 🎉';
      case 'pending_today':
        return 'Practice today to keep your streak alive! 💪';
      case 'broken':
        return 'Start a new streak today! 🌟';
      default:
        return 'Start your practice journey! 🚀';
    }
  };

  const getStreakColor = (status) => {
    switch (status) {
      case 'completed_today':
        return 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700';
      case 'pending_today':
        return 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700';
      case 'broken':
        return 'from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700';
      default:
        return 'from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getStreakColor(streakData.streakStatus)} rounded-lg shadow-sm p-6 text-white`}>
      <div className="flex items-center justify-between">
        {/* Current Streak */}
        <div className="flex items-center space-x-4">
          <div className="text-6xl">
            {getStreakEmoji(streakData.currentStreak)}
          </div>
          <div>
            <div className="text-5xl font-bold">
              {streakData.currentStreak}
            </div>
            <div className="text-lg opacity-90">Day Streak</div>
          </div>
        </div>

        {/* Stats */}
        <div className="text-right space-y-2">
          <div>
            <div className="text-2xl font-bold">{streakData.longestStreak}</div>
            <div className="text-sm opacity-90">Longest Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{streakData.totalPracticeDays}</div>
            <div className="text-sm opacity-90">Total Days</div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-center text-lg">
          {getStreakMessage(streakData.streakStatus)}
        </p>
      </div>

      {/* Last Practice Date */}
      {streakData.lastPracticeDate && (
        <div className="mt-2 text-center text-sm opacity-75">
          Last practiced: {new Date(streakData.lastPracticeDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default StreakCounter;
