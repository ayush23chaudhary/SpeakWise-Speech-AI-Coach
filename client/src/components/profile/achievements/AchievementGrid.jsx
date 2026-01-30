// client/src/components/profile/achievements/AchievementGrid.jsx
import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';

const AchievementGrid = () => {
  const [achievements, setAchievements] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await api.get('/auth/profile/achievements');
      setAchievements(response.data.achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'earned') return achievement.earned;
    if (filter === 'locked') return !achievement.earned;
    return achievement.category === filter;
  });

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalPoints = achievements
    .filter(a => a.earned)
    .reduce((sum, a) => sum + a.points, 0);

  const rarityColors = {
    common: 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700',
    rare: 'from-blue-400 to-[#F8FAFF]0 dark:from-[#F8FAFF]0 dark:to-[#2A3A7A]',
    epic: 'from-[#6C63FF] to-[#EEF2FF]0 dark:from-[#EEF2FF]0 dark:to-[#6C63FF]',
    legendary: 'from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600'
  };

  if (loading) {
    return <div className="text-center py-8">Loading achievements...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-[#1FB6A6] dark:text-primary-400">{earnedCount}/{achievements.length}</div>
          <div className="text-gray-600 dark:text-gray-400">Achievements Unlocked</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{totalPoints}</div>
          <div className="text-gray-600 dark:text-gray-400">Total Points</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {Math.round((earnedCount / achievements.length) * 100)}%
          </div>
          <div className="text-gray-600 dark:text-gray-400">Completion Rate</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {['all', 'earned', 'locked', 'milestone', 'streak', 'performance', 'practice'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize transition-all duration-200 ${
              filter === f
                ? 'bg-[#1FB6A6] text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement._id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md ${
              !achievement.earned ? 'opacity-60' : ''
            }`}
          >
            {/* Achievement Header with Rarity Color */}
            <div className={`bg-gradient-to-r ${rarityColors[achievement.rarity]} h-2`}></div>

            <div className="p-6">
              {/* Icon and Lock Status */}
              <div className="flex items-center justify-between mb-4">
                <div className={`text-5xl ${achievement.earned ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                {!achievement.earned && (
                  <div className="text-gray-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Achievement Info */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {achievement.description}
              </p>

              {/* Progress Bar */}
              {!achievement.earned && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{achievement.currentValue} / {achievement.targetValue}</span>
                    <span>{achievement.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-[#1FB6A6] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  achievement.rarity === 'common' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                  achievement.rarity === 'rare' ? 'bg-[#EEF2FF] dark:bg-blue-900/30 text-[#2A3A7A] dark:text-blue-300' :
                  achievement.rarity === 'epic' ? 'bg-[#6C63FF]/10 dark:bg-[#2A3A7A]/30 text-[#5A52E8] dark:text-[#6C63FF]/30' :
                  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                }`}>
                  {achievement.rarity}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {achievement.points} pts
                </span>
              </div>

              {/* Earned Date */}
              {achievement.earned && achievement.earnedAt && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-green-600 dark:text-green-400">
                    ✓ Unlocked {new Date(achievement.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No achievements found in this category.
        </div>
      )}
    </div>
  );
};

export default AchievementGrid;
