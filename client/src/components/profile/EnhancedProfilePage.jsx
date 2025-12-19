// client/src/components/profile/EnhancedProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import SkillRadarChart from './charts/SkillRadarChart';
import ProgressTimeline from './charts/ProgressTimeline';
import PracticeHeatmap from './charts/PracticeHeatmap';
import AchievementGrid from './achievements/AchievementGrid';
import StreakCounter from './streaks/StreakCounter';
import GoalTracker from './goals/GoalTracker';
import SessionHistory from './history/SessionHistory';
import ProfileSettings from './settings/ProfileSettings';

const EnhancedProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnhancedStats();
  }, []);

  const fetchEnhancedStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile/enhanced-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching enhanced stats:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const checkForNewBadges = async () => {
    try {
      toast.loading('Checking for earned badges...', { id: 'badge-check' });
      const response = await api.post('/auth/profile/check-badges');
      
      toast.dismiss('badge-check');
      
      if (response.data.newBadges && response.data.newBadges.length > 0) {
        // Show toast for each new badge
        response.data.newBadges.forEach((badge, index) => {
          setTimeout(() => {
            toast.success(
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{badge.icon}</span>
                <div>
                  <div className="font-bold">🎉 Achievement Unlocked!</div>
                  <div className="text-sm">{badge.name}</div>
                  <div className="text-xs opacity-75">{badge.description}</div>
                </div>
              </div>,
              {
                duration: 5000,
                position: 'top-center',
                style: {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#fff',
                  minWidth: '350px',
                  boxShadow: '0 10px 25px -5px rgb(37 99 235 / 0.3)',
                },
                icon: '🏆',
              }
            );
          }, index * 1000);
        });
        
        // Refresh stats to show new badges
        fetchEnhancedStats();
      } else {
        toast.success('All caught up! No new badges to award.', { icon: '✅' });
      }
    } catch (error) {
      toast.dismiss('badge-check');
      console.error('Error checking badges:', error);
      toast.error('Failed to check badges');
    }
  };

  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      id: 'achievements', 
      label: 'Achievements', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    { 
      id: 'goals', 
      label: 'Goals', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Profile Header with Enhanced Visual Effects */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">{/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 text-xs sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={checkForNewBadges}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 flex-1 sm:flex-none text-xs sm:text-base"
                title="Check for earned badges"
              >
                <span>🏆</span>
                <span className="hidden sm:inline">Check Badges</span>
                <span className="sm:hidden">Badges</span>
              </button>

              <button
                onClick={toggleTheme}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 flex-1 sm:flex-none text-xs sm:text-base"
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
            {/* Profile Picture with Enhanced Effects */}
            <div className="relative group flex-shrink-0">
              {/* Animated Ring Effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/40 to-white/20 blur-md group-hover:blur-lg transition-all duration-300"></div>
              
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-white shadow-2xl object-cover ring-4 ring-white/30 group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm border-4 border-white shadow-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold ring-4 ring-white/30 group-hover:scale-105 transition-transform duration-300">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Online Status Badge */}
              <div className="absolute bottom-0 right-0 h-6 w-6 sm:h-7 sm:w-7 bg-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <div className="h-2 w-2 sm:h-3 sm:w-3 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md">{user?.name}</h1>
              <p className="text-white/90 drop-shadow-sm text-sm sm:text-base">{user?.email}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-white/90">
                <span className="flex items-center backdrop-blur-sm bg-white/10 px-2 sm:px-3 py-1 rounded-full">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                  <span className="sm:hidden">Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </span>
                {user?.location && (
                  <span className="flex items-center backdrop-blur-sm bg-white/10 px-2 sm:px-3 py-1 rounded-full">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {user.location}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats with Enhanced Cards */}
            {stats?.basicStats && (
              <div className="flex space-x-3 sm:space-x-4 w-full sm:w-auto justify-center">
                <div className="text-center backdrop-blur-md bg-white/15 px-3 sm:px-6 py-2 sm:py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg flex-1 sm:flex-none">
                  <div className="text-xl sm:text-3xl font-bold drop-shadow-md">{stats.basicStats.totalSessions}</div>
                  <div className="text-white/90 text-xs sm:text-sm font-medium">Sessions</div>
                </div>
                <div className="text-center backdrop-blur-md bg-white/15 px-3 sm:px-6 py-2 sm:py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg flex-1 sm:flex-none">
                  <div className="text-xl sm:text-3xl font-bold drop-shadow-md">{stats.basicStats.averageScore}</div>
                  <div className="text-white/90 text-xs sm:text-sm font-medium">Score</div>
                </div>
                <div className="text-center backdrop-blur-md bg-white/15 px-3 sm:px-6 py-2 sm:py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg flex-1 sm:flex-none">
                  <div className="text-xl sm:text-3xl font-bold drop-shadow-md">{stats.streakStats?.currentStreak || 0}</div>
                  <div className="text-white/90 text-xs sm:text-sm font-medium">Streak</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="flex-shrink-0">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === 'overview' && stats && (
          <OverviewTab stats={stats} user={user} />
        )}
        {activeTab === 'analytics' && stats && (
          <AnalyticsTab stats={stats} />
        )}
        {activeTab === 'achievements' && (
          <AchievementsTab onCheckBadges={checkForNewBadges} />
        )}
        {activeTab === 'goals' && (
          <GoalsTab />
        )}
        {activeTab === 'history' && (
          <HistoryTab />
        )}
        {activeTab === 'settings' && (
          <SettingsTab user={user} updateUser={updateUser} />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, user }) => {
  return (
    <div className="space-y-6">
      {/* Streak Counter */}
      <StreakCounter streakData={stats.streakStats} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          icon={(
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
          label="Total Sessions"
          value={stats.basicStats.totalSessions}
          color="blue"
        />
        <StatCard
          icon={(
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
          label="Average Score"
          value={stats.basicStats.averageScore}
          color="yellow"
        />
        <StatCard
          icon={(
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
          label="Improvement"
          value={`${stats.basicStats.improvementRate}%`}
          color="green"
        />
        <StatCard
          icon={(
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          label="Practice Time"
          value={`${stats.basicStats.totalPracticeTime} min`}
          color="purple"
        />
      </div>

      {/* Skill Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Skill Breakdown</h3>
        <div className="overflow-x-auto">
          <SkillRadarChart data={stats.skillBreakdown} />
        </div>
      </div>

      {/* Recent Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Progress</h3>
        <div className="overflow-x-auto">
          <ProgressTimeline data={stats.progressTimeline} />
        </div>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ stats }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Practice Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Practice Activity</h3>
        <div className="overflow-x-auto">
          <PracticeHeatmap data={stats.practiceHeatmap} />
        </div>
      </div>

      {/* Most Improved Areas */}
      {stats.mostImprovedAreas && stats.mostImprovedAreas.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Most Improved Areas</h3>
          <div className="space-y-3">
            {stats.mostImprovedAreas.map((area, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 capitalize">{area.skill}</span>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="flex-1 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(area.improvement, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm sm:text-base text-green-600 dark:text-green-400 font-semibold whitespace-nowrap">
                    +{area.improvement}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Peak Practice Times */}
      {stats.peakPracticeHours && stats.peakPracticeHours.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Peak Practice Times</h3>
          <div className="space-y-3">
            {stats.peakPracticeHours.map((peak, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  {peak.hour}:00 - {peak.hour + 1}:00
                </span>
                <span className="text-sm sm:text-base text-blue-600 dark:text-blue-400 font-semibold">
                  {peak.count} sessions
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Achievements Tab
const AchievementsTab = ({ onCheckBadges }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Your Achievements</h2>
        <button
          onClick={onCheckBadges}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <span>🏆</span>
          <span>Check for New Badges</span>
        </button>
      </div>
      <AchievementGrid />
    </div>
  );
};

// Goals Tab
const GoalsTab = () => {
  return <GoalTracker />;
};

// History Tab
const HistoryTab = () => {
  return <SessionHistory />;
};

// Settings Tab
const SettingsTab = ({ user, updateUser }) => {
  return <ProfileSettings user={user} updateUser={updateUser} />;
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
    yellow: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg shadow-sm border p-3 sm:p-4 lg:p-6 transition-all duration-200 hover:shadow-md group`}>
      <div className="mb-2 opacity-80 group-hover:opacity-100 transition-opacity">{icon}</div>
      <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs sm:text-sm opacity-75">{label}</div>
    </div>
  );
};

export default EnhancedProfilePage;
