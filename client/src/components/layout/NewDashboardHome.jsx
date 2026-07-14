import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Joyride, STATUS } from 'react-joyride';
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Briefcase,
  MessageCircle,
  Award,
  Clock,
  ChevronRight,
  Play,
  Lock,
  CheckCircle,
  Flame,
  Calendar,
  BarChart3,
  AlertCircle,
  TrendingDown,
  Users,
  BookOpen
} from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const NewDashboardHome = ({ setActiveTab }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    streak: 0,
    totalSessions: 0,
    avgScore: 0,
    level: 1,
    progress: 0
  });
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const hasSeenTour = localStorage.getItem('hasSeenDashboardTour');
    if (!hasSeenTour) {
      // Set to true immediately so returning to the dashboard doesn't re-trigger it
      localStorage.setItem('hasSeenDashboardTour', 'true');
      // Small delay to ensure the DOM is painted
      setTimeout(() => setRunTour(true), 500);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status, index, action } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('hasSeenDashboardTour', 'true');
    }
  };

  const tourSteps = [
    {
      target: 'body',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6C63FF] to-[#2A3A7A] rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Welcome to SpeakWise</h3>
              <p className="text-xs text-gray-500">Your personal communication coach</p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">We're here to help you become a confident communicator. This quick tour will show you how to unlock your full potential.</p>
          <div className="bg-gradient-to-r from-[#6C63FF]/10 to-[#2A3A7A]/10 border border-[#6C63FF]/20 p-3 rounded-lg">
            <p className="text-sm text-gray-600"><strong>Tip:</strong> You can skip this tour anytime and access it later from your settings.</p>
          </div>
        </div>
      ),
      disableBeacon: true,
      placement: 'center'
    },
    {
      target: '.tour-journey-mode',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#6C63FF] text-white rounded-lg flex items-center justify-center text-sm font-bold">1</div>
            <h3 className="font-bold text-gray-900 text-lg">Your Learning Journey</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">Follow a structured, 4-level learning path designed to progressively build your communication skills:</p>
          <div className="space-y-2 mt-3">
            <div className="flex gap-2 text-sm">
              <span className="text-[#6C63FF] font-bold min-w-fit">Level 1</span>
              <span className="text-gray-600">Master pronunciation, clarity & speech fundamentals</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-[#6C63FF] font-bold min-w-fit">Level 2</span>
              <span className="text-gray-600">Eliminate filler words, improve flow & pacing</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-[#6C63FF] font-bold min-w-fit">Level 3</span>
              <span className="text-gray-600">Build confidence, authority & delivery impact</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-[#6C63FF] font-bold min-w-fit">Level 4</span>
              <span className="text-gray-600">Specialize in interviews, presentations & more</span>
            </div>
          </div>
        </div>
      ),
      placement: 'bottom'
    },
    {
      target: '.tour-practice-modes',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#6C63FF] text-white rounded-lg flex items-center justify-center text-sm font-bold">2</div>
            <h3 className="font-bold text-gray-900 text-lg">Practice Hub</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">Choose your practice mode based on your goal. Each method offers unique benefits and real-time AI feedback.</p>
          <div className="bg-[#6C63FF]/5 border border-[#6C63FF]/20 p-2 rounded-lg mt-2">
            <p className="text-xs text-gray-600">Explore each mode below →</p>
          </div>
        </div>
      ),
      placement: 'left'
    },
    {
      target: '.tour-ai-interview',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#6C63FF] text-white rounded-lg flex items-center justify-center text-sm font-bold">3</div>
            <h3 className="font-bold text-gray-900 text-lg">AI Interview Mode</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">Practice real job interviews with our AI recruiter. Receive instant feedback on:</p>
          <div className="space-y-1.5 mt-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Speaking pace and rhythm</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Voice confidence and clarity</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Filler word elimination</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Overall presentation quality</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 italic mt-2">Pro tip: Practice 2-3 sessions before your actual interview</p>
        </div>
      ),
      placement: 'left'
    },
    {
      target: '.tour-daily-practice',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#6C63FF] text-white rounded-lg flex items-center justify-center text-sm font-bold">4</div>
            <h3 className="font-bold text-gray-900 text-lg">Daily Practice</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">Quick, scenario-based training sessions (5-10 minutes). Perfect for building consistent habits.</p>
          <div className="space-y-1.5 mt-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Build and maintain daily streaks</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Targeted skill improvement</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Pre-presentation warm-up</span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg mt-2">
            <p className="text-xs text-amber-900 font-medium">Consistency matters: Practice daily to unlock achievements</p>
          </div>
        </div>
      ),
      placement: 'left'
    },
    {
      target: '.tour-free-practice',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#6C63FF] text-white rounded-lg flex items-center justify-center text-sm font-bold">5</div>
            <h3 className="font-bold text-gray-900 text-lg">Free Practice Studio</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">No scripts, no constraints. Record anything and get detailed AI analysis.</p>
          <div className="space-y-1.5 mt-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Record presentations or talks</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Practice storytelling and speeches</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Read articles and books aloud</span>
            </div>
          </div>
        </div>
      ),
      placement: 'left'
    },
    {
      target: '.tour-community-hub',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#6C63FF] text-white rounded-lg flex items-center justify-center text-sm font-bold">6</div>
            <h3 className="font-bold text-gray-900 text-lg">Community Hub</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">Learn from expert guides and industry best practices. A resource library to complement your practice.</p>
          <div className="space-y-1.5 mt-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Expert articles and guides</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Proven communication techniques</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></div>
              <span>Industry best practices</span>
            </div>
          </div>
        </div>
      ),
      placement: 'left'
    },
    {
      target: 'body',
      content: (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">You're Ready to Begin</h3>
          <p className="text-gray-700 text-sm leading-relaxed">Your personalized journey awaits. Here's the recommended path to success:</p>
          <div className="space-y-3 mt-4">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 bg-[#6C63FF] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Start Your Journey</p>
                <p className="text-gray-600 text-xs">Follow the structured 4-level path at your own pace</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 bg-[#6C63FF] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Build Daily Habits</p>
                <p className="text-gray-600 text-xs">Dedicate 10 minutes daily to maintain your streak</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 bg-[#6C63FF] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Learn & Improve</p>
                <p className="text-gray-600 text-xs">Read community guides to strengthen your technique</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 bg-[#6C63FF] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Master Your Goal</p>
                <p className="text-gray-600 text-xs">Use AI Interview when you need to excel</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#6C63FF] to-[#2A3A7A] p-3 rounded-lg mt-4">
            <p className="text-white text-sm font-semibold">Let's transform your communication today.</p>
          </div>
        </div>
      ),
      placement: 'center'
    }
  ];

  const fetchDashboardData = async () => {
    try {
      // Fetch user stats, journey progress, and speech history
      const [progressRes, journeyRes, interviewRes, speechRes] = await Promise.all([
        api.get('/user/progress'),
        api.get('/journey/progress'),
        api.get('/interview/history'),
        api.get('/speech/history')
      ]);

      const interviews = interviewRes.data.sessions || [];
      const completed = interviews.filter(i => i.status === 'completed');
      const speechReports = speechRes.data.reports || [];

      // Calculate weaknesses from recent reports
      const recentReports = speechReports.slice(0, 5);
      const weaknessMap = {};
      
      recentReports.forEach(report => {
        if (report.clarity < 70) weaknessMap['clarity'] = (weaknessMap['clarity'] || 0) + 1;
        if (report.confidence < 70) weaknessMap['confidence'] = (weaknessMap['confidence'] || 0) + 1;
        if (report.fluency < 70) weaknessMap['fluency'] = (weaknessMap['fluency'] || 0) + 1;
        if (report.pace < 70) weaknessMap['pace'] = (weaknessMap['pace'] || 0) + 1;
      });

      const topWeaknesses = Object.entries(weaknessMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([skill]) => skill);

      setWeaknesses(topWeaknesses);

      // Format progress data for chart - combine interviews and speech reports
      const allSessions = [
        ...completed.map(i => ({
          date: new Date(i.createdAt),
          score: i.overallScore || 0
        })),
        ...speechReports.map(r => ({
          date: new Date(r.createdAt),
          score: r.overallScore || 0
        }))
      ]
      .sort((a, b) => a.date - b.date)
      .slice(-10)
      .map(s => ({
        date: s.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: s.score
      }));

      setProgressData(allSessions);

      // Use journey progress for accurate average score from completed tasks
      const avgScore = journeyRes.data?.avgScore || 0;

      setStats({
        streak: user?.currentStreak || 0,
        totalSessions: interviews.length + speechReports.length,
        avgScore: avgScore, // Use the correct average from journey tasks
        level: progressRes.data?.level || 1,
        progress: progressRes.data?.progress || 0
      });

      setJourney(progressRes.data?.journey || null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const journeyLevels = [
    {
      level: 1,
      title: 'Foundation Builder',
      description: 'Master the basics of clear communication',
      skills: ['Pronunciation', 'Basic Fluency', 'Simple Sentences'],
      unlocked: stats.level >= 1
    },
    {
      level: 2,
      title: 'Clarity Champion',
      description: 'Eliminate filler words and improve flow',
      skills: ['Remove Fillers', 'Smooth Flow', 'Better Pauses'],
      unlocked: stats.level >= 2
    },
    {
      level: 3,
      title: 'Confidence Expert',
      description: 'Speak with authority and structure',
      skills: ['Storytelling', 'Organization', 'Vocal Power'],
      unlocked: stats.level >= 3
    },
    {
      level: 4,
      title: 'Goal Master',
      description: 'Specialized training for your objectives',
      skills: ['Interview Mastery', 'Presentation Skills', 'Persuasion'],
      unlocked: stats.level >= 4
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        callback={handleJoyrideCallback}
        disableScrolling={false}
        scrollToFirstStep={true}
        styles={{
          options: {
            arrowColor: '#ffffff',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            primaryColor: '#6C63FF',
            textColor: '#333333',
            width: 420,
            zIndex: 1000,
            borderRadius: 16,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
          buttonNext: {
            backgroundColor: '#6C63FF',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 28px',
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(108, 99, 255, 0.3)',
          },
          buttonBack: {
            marginRight: 15,
            fontSize: '14px',
            color: '#6C63FF',
            fontWeight: '600',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          },
          buttonSkip: {
            color: '#999',
            fontSize: '14px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
          },
          tooltip: {
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(108, 99, 255, 0.1)',
            animation: 'fadeInScale 0.4s ease-out',
          },
          spotlight: {
            borderRadius: '8px',
          },
          spotlight_base: {
            transition: 'box-shadow 0.3s ease',
            borderRadius: '8px',
          }
        }}
        floaterProps={{
          disableAnimation: false,
        }}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Welcome Hero Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                What would you like to work on today?
              </p>
            </div>

            {/* Streak Badge */}
            {stats.streak > 0 && (
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-700 dark:to-orange-800 text-white rounded-xl px-6 py-4 shadow-md">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-5 h-5" />
                  <span className="text-2xl font-bold">{stats.streak}</span>
                </div>
                <div className="text-xs opacity-90">Day Streak</div>
              </div>
            )}
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-[#EEF2FF] dark:bg-blue-900/30 rounded-lg p-2">
                  <BarChart3 className="w-5 h-5 text-[#1E2A5A] dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.avgScore.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Avg Score</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-[#6C63FF]/10 dark:bg-[#2A3A7A]/30 rounded-lg p-2">
                  <Target className="w-5 h-5 text-[#6C63FF] dark:text-[#6C63FF]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    Level {stats.level}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Current Level</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalSessions}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Sessions</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          {/* Left Column - Your Journey (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Goal Card */}
            <div className="tour-journey-mode bg-gradient-to-br from-slate-700 to-slate-900 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">Your Journey</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {journeyLevels[stats.level - 1]?.title || 'Foundation Builder'}
                  </h2>
                  <p className="text-gray-300 text-sm mb-4">
                    {journeyLevels[stats.level - 1]?.description || 'Master the basics of clear communication'}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-xs opacity-75">Level</div>
                  <div className="text-2xl font-bold">{stats.level}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="opacity-90">Progress to Next Level</span>
                  <span className="font-medium">{stats.progress}%</span>
                </div>
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>

              {/* Skills to Master */}
              <div className="mb-4">
                <div className="text-xs opacity-75 mb-2">Skills to Master:</div>
                <div className="flex flex-wrap gap-2">
                  {journeyLevels[stats.level - 1]?.skills.map((skill, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-md text-xs">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard/journey')}
                className="w-full bg-white dark:bg-gray-700 text-slate-900 dark:text-white font-semibold py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600"
              >
                Continue Your Journey
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Level Roadmap */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Your Learning Path
              </h3>
              <div className="space-y-3">
                {journeyLevels.map((lvl, idx) => (
                  <div 
                    key={idx}
                    onClick={() => lvl.unlocked && navigate('/dashboard/journey')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      lvl.unlocked
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 cursor-pointer hover:border-green-300 hover:shadow-sm dark:hover:border-green-700'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        lvl.unlocked
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {lvl.unlocked ? (
                          stats.level === lvl.level ? <Play className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            Level {lvl.level}: {lvl.title}
                          </h4>
                          {stats.level === lvl.level && (
                            <span className="text-xs bg-[#EEF2FF] text-[#1E2A5A] dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{lvl.description}</p>
                      </div>
                      {stats.level === lvl.level && (
                        <ChevronRight className="w-5 h-5 text-[#1E2A5A] dark:text-blue-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Trajectory Chart */}
            {progressData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#1E2A5A]" />
                      Your Progress Trajectory
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Track your improvement over time
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className="flex items-center gap-1 px-4 py-2 bg-[#1E2A5A] hover:bg-[#2A3A7A] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Detailed Analysis
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            
            {/* Practice Modes */}
            <div className="tour-practice-modes bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Practice Modes
              </h3>
              <div className="space-y-3">
                
                {/* AI Interview */}
                <Link
                  to="/dashboard/interview"
                  className="tour-ai-interview block p-4 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 dark:from-gray-800 dark:to-gray-900 text-white hover:from-slate-600 hover:to-slate-700 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all shadow-md"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-6 h-6" />
                    <div className="flex-1">
                      <h4 className="font-bold">AI Interview</h4>
                      <p className="text-xs opacity-90">Job-specific practice</p>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </Link>

                {/* Daily Practice - Navigate to Scenario Training */}
                <button
                  onClick={() => setActiveTab('practice')}
                  className="tour-daily-practice w-full p-4 rounded-lg bg-gradient-to-r from-[#1E2A5A] to-[#2A3A7A] dark:from-blue-800/60 dark:to-blue-900/60 text-white hover:from-[#1A2449] hover:to-[#1F2F68] dark:hover:from-blue-700/60 dark:hover:to-blue-800/60 transition-all shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6" />
                    <div className="flex-1 text-left">
                      <h4 className="font-bold">Daily Practice</h4>
                      <p className="text-xs opacity-90">Scenario training</p>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>

                {/* Free Practice - Navigate to Record Tab */}
                <button
                  onClick={() => setActiveTab('studio')}
                  className="tour-free-practice w-full p-4 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-700/70 dark:to-emerald-800/70 text-white hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-emerald-600/70 dark:hover:to-emerald-700/70 transition-all shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6" />
                    <div className="flex-1 text-left">
                      <h4 className="font-bold">Free Practice</h4>
                      <p className="text-xs opacity-90">Record & analyze</p>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              </div>
            </div>

            {/* Today's Focus */}
            <div className="bg-amber-50 dark:bg-gray-800 rounded-xl p-6 border border-amber-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Areas to Improve</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Based on your recent performance:
              </p>
              <div className="space-y-2">
                {weaknesses.length > 0 ? (
                  weaknesses.map((weakness, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span className="text-gray-800 dark:text-gray-200 capitalize">
                        {weakness === 'pace' ? 'Speaking pace' : weakness}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span className="text-gray-800 dark:text-gray-200">Complete a practice session</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span className="text-gray-800 dark:text-gray-200">Build consistency</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent Achievement */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Recent Wins</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {stats.streak > 0 && (
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>{stats.streak} day streak! 🔥</span>
                  </div>
                )}
                {stats.totalSessions > 0 && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>{stats.totalSessions} sessions completed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Community Hub - New Section */}
            <div className="tour-community-hub bg-gradient-to-br from-[#EEF2FF] to-[#F8FAFF] dark:from-blue-900/30 dark:to-slate-800 rounded-2xl shadow-lg p-6 border border-[#6C63FF]/20 dark:border-blue-800/30">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-[#6C63FF] dark:text-blue-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Community Hub</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Learn from expert articles, tips, and techniques
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <BookOpen className="w-4 h-4 text-[#1E2A5A] dark:text-blue-400" />
                  <span>6 Expert Articles</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>Proven Techniques</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <MessageCircle className="w-4 h-4 text-[#6C63FF] dark:text-[#6C63FF]" />
                  <span>Community Tips</span>
                </div>
              </div>
              <Link
                to="/dashboard/community"
                className="block w-full px-4 py-3 bg-gradient-to-r from-[#6C63FF] to-[#2A3A7A] hover:from-[#5A52E8] hover:to-[#1F2F68] dark:from-[#5A52E8] dark:to-[#4A42D8] dark:hover:from-[#4A42D8] dark:hover:to-[#3A32C8] text-white text-center font-medium rounded-lg transition-all shadow-md"
              >
                Explore Community
                <ChevronRight className="inline w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewDashboardHome;
