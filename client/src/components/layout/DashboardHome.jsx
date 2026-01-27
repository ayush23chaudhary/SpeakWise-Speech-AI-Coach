import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Video, 
  Briefcase, 
  Target, 
  TrendingUp, 
  Award, 
  Calendar,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import api from '../../utils/api';

const DashboardHome = () => {
  const [recentInterview, setRecentInterview] = useState(null);
  const [stats, setStats] = useState({ total: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviewStats();
  }, []);

  const fetchInterviewStats = async () => {
    try {
      const response = await api.get('/interview/history');
      const interviews = response.data.sessions || [];
      const completed = interviews.filter(i => i.status === 'completed');
      
      setRecentInterview(interviews[0] || null);
      setStats({
        total: interviews.length,
        avgScore: completed.length > 0
          ? completed.reduce((sum, i) => sum + (i.overallScore || i.overallPerformance?.overallScore || i.overallPerformance?.averageScore || 0), 0) / completed.length
          : 0
      });
    } catch (error) {
      console.error('Error fetching interview stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Welcome to SpeakWise
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your AI-powered speech coaching platform
          </p>
        </div>

        {/* Main Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Interview Mode Card - Highlighted */}
          <Link 
            to="/dashboard/interview"
            className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-6 text-white col-span-full md:col-span-2"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-1 text-xs bg-white/20 px-3 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>AI-Powered</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">AI Interview Mode</h2>
            <p className="text-blue-100 mb-4">
              Practice real job interviews with AI-generated questions tailored to your job description. 
              Get instant feedback on both your speech delivery and content quality.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold mb-1">{stats.total}</div>
                <div className="text-xs text-blue-100">Interviews Taken</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold mb-1">{(stats.avgScore || 0).toFixed(0)}</div>
                <div className="text-xs text-blue-100">Average Score</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium mb-1">Features:</div>
                <ul className="text-xs text-blue-100 space-y-1">
                  <li>✓ AI-generated questions from job descriptions</li>
                  <li>✓ Dual analysis: speech + content quality</li>
                  <li>✓ Instant feedback with actionable tips</li>
                </ul>
              </div>
              <ChevronRight className="w-6 h-6" />
            </div>
          </Link>

          {/* Recent Interview */}
          {recentInterview && (
            <Link
              to={`/dashboard/interview/${recentInterview._id || recentInterview.id}${recentInterview.status === 'completed' ? '/report' : ''}`}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-purple-600" />
                {recentInterview.status === 'completed' && (
                  <div className="text-2xl font-bold text-purple-600">
                    {(recentInterview.overallScore || 
                      recentInterview.overallPerformance?.overallScore || 
                      recentInterview.overallPerformance?.averageScore || 
                      0).toFixed(0)}
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                Last Interview
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {recentInterview.jobTitle}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-4 h-4" />
                {new Date(recentInterview.createdAt).toLocaleDateString()}
              </div>
              
              <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                {recentInterview.status === 'completed' ? 'View Report' : 'Continue Interview'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          )}

          {/* View All Interviews */}
          <Link
            to="/dashboard/interview/history"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
          >
            <TrendingUp className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              Interview History
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Track your progress and review all past interviews
            </p>
            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
              View History
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/dashboard/interview"
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                Start New Interview
              </span>
            </Link>
            
            <Link
              to="/dashboard/interview/history"
              className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                View History
              </span>
            </Link>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Video className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                Record Speech
              </span>
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <Target className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                Practice Hub
              </span>
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">📝 Interview Types</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Technical Coding</li>
              <li>• System Design</li>
              <li>• Behavioral</li>
              <li>• Product Management</li>
              <li>• And more...</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">🎯 Dual Analysis</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Speech metrics (40%)</li>
              <li>• Content quality (60%)</li>
              <li>• Instant feedback</li>
              <li>• Actionable tips</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">✨ AI-Powered</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Custom questions</li>
              <li>• Industry standards</li>
              <li>• Real-time analysis</li>
              <li>• Detailed reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
