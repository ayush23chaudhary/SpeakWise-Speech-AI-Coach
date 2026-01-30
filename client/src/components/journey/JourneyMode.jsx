import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  CheckCircle,
  Lock,
  Play,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  Mic,
  BookOpen,
  Zap
} from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';

const JourneyMode = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentTask, setCurrentTask] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [weaknesses, setWeaknesses] = useState([]);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);

  useEffect(() => {
    fetchJourneyProgress();
  }, []);

  const fetchJourneyProgress = async () => {
    try {
      const [journeyRes, speechRes] = await Promise.all([
        api.get('/journey/progress'),
        api.get('/speech/history')
      ]);
      
      setCurrentLevel(journeyRes.data.currentLevel || 1);
      setProgress(journeyRes.data.progress || {});
      setCurrentTask(journeyRes.data.currentTask || null);
      setCompletedTaskIds(journeyRes.data.completedTasks || []);

      // Calculate weaknesses from recent reports
      const speechReports = speechRes.data.reports || [];
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
    } catch (error) {
      console.error('Error fetching journey:', error);
      // Generate personalized task based on user data
      generateNextTask();
    } finally {
      setLoading(false);
    }
  };

  const generateNextTask = async () => {
    try {
      const response = await api.post('/journey/next-task', {
        currentLevel,
        userGoal: user?.onboarding?.user_purpose || 'interviews_evaluations',
        weaknesses: user?.preferences?.focusAreas || []
      });
      setCurrentTask(response.data.task);
    } catch (error) {
      console.error('Error generating task:', error);
    }
  };

  const journeyLevels = [
    {
      level: 1,
      title: 'Foundation Builder',
      icon: '🌱',
      color: 'from-emerald-600 to-emerald-700',
      description: 'Master the basics of clear communication',
      skills: [
        { name: 'Clear Pronunciation', completed: progress['pronunciation'] || false },
        { name: 'Speaking Slowly & Clearly', completed: progress['pace'] || false },
        { name: 'Simple Sentence Formation', completed: progress['sentences'] || false }
      ],
      tasks: [
        {
          id: 'intro',
          title: 'Introduce Yourself',
          description: 'Record a 30-second self-introduction',
          type: 'record',
          duration: 30,
          icon: Mic
        },
        {
          id: 'read-aloud',
          title: 'Read Aloud Practice',
          description: 'Read 5 sentences clearly and slowly',
          type: 'reading',
          duration: 60,
          icon: BookOpen
        },
        {
          id: 'repeat',
          title: 'Repeat After AI',
          description: 'Listen and repeat 10 phrases',
          type: 'repeat',
          duration: 120,
          icon: Play
        }
      ]
    },
    {
      level: 2,
      title: 'Clarity Champion',
      icon: '⚡',
      color: 'from-amber-600 to-amber-700',
      description: 'Eliminate filler words and improve flow',
      skills: [
        { name: 'No Filler Words', completed: progress['fillers'] || false },
        { name: 'Smooth Flow', completed: progress['flow'] || false },
        { name: 'Strategic Pauses', completed: progress['pauses'] || false }
      ],
      tasks: [
        {
          id: 'describe-picture',
          title: 'Describe a Picture',
          description: 'Speak for 45 seconds without "um" or "uh"',
          type: 'challenge',
          duration: 45,
          icon: Target
        },
        {
          id: 'topic-talk',
          title: 'Topic Talk',
          description: 'Speak on a random topic for 60 seconds',
          type: 'timed',
          duration: 60,
          icon: Zap
        },
        {
          id: 'sentence-reform',
          title: 'Sentence Restructuring',
          description: 'Fix and improve poorly structured sentences',
          type: 'exercise',
          duration: 90,
          icon: BookOpen
        }
      ]
    },
    {
      level: 3,
      title: 'Confidence Expert',
      icon: '🚀',
      color: 'from-[#1E2A5A] to-[#2A3A7A]',
      description: 'Speak with authority and structure',
      skills: [
        { name: 'Storytelling', completed: progress['storytelling'] || false },
        { name: 'Thought Organization', completed: progress['organization'] || false },
        { name: 'Vocal Confidence', completed: progress['confidence'] || false }
      ],
      tasks: [
        {
          id: 'story-time',
          title: 'Tell Your Story',
          description: '2-minute talk: "My proudest moment"',
          type: 'record',
          duration: 120,
          icon: Mic
        },
        {
          id: 'opinion',
          title: 'Opinion Challenge',
          description: 'Give your opinion on a controversial topic',
          type: 'challenge',
          duration: 90,
          icon: Target
        },
        {
          id: 'structure',
          title: 'Structured Response',
          description: 'Answer using First, Second, Finally format',
          type: 'exercise',
          duration: 120,
          icon: BookOpen
        }
      ]
    },
    {
      level: 4,
      title: 'Goal Master',
      icon: '🏆',
      color: 'from-[#1E2A5A] to-[#2A3A7A]',
      description: 'Specialized training for your objectives',
      skills: [
        { name: 'Goal-Specific Skills', completed: progress['goal_specific'] || false },
        { name: 'Advanced Techniques', completed: progress['advanced'] || false },
        { name: 'Real-World Application', completed: progress['real_world'] || false }
      ],
      tasks: [] // Dynamically generated based on user goal
    }
  ];

  const getCurrentLevelData = () => {
    return journeyLevels.find(l => l.level === currentLevel) || journeyLevels[0];
  };

  const handleStartTask = (task) => {
    // Store task data so practice components can access it
    sessionStorage.setItem('journeyTask', JSON.stringify({
      ...task,
      fromJourney: true,
      timestamp: Date.now()
    }));
    
    // Navigate based on task type
    if (task.type === 'record' || task.type === 'reading' || task.type === 'repeat') {
      // For recording tasks, go to studio tab
      localStorage.setItem('activeTab', 'studio');
      navigate('/dashboard');
      // Trigger tab change after navigation
      setTimeout(() => {
        window.location.href = '/dashboard#studio';
      }, 100);
    } else if (task.type === 'challenge' || task.type === 'exercise') {
      // For exercises, go to practice hub
      localStorage.setItem('activeTab', 'practice');
      navigate('/dashboard');
      setTimeout(() => {
        window.location.href = '/dashboard#practice';
      }, 100);
    } else {
      // Default to studio
      localStorage.setItem('activeTab', 'studio');
      navigate('/dashboard');
      setTimeout(() => {
        window.location.href = '/dashboard#studio';
      }, 100);
    }
  };

  const levelData = getCurrentLevelData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E2A5A] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[#1E2A5A] dark:text-blue-400 hover:underline mb-4 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Your Learning Journey
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Personalized path to communication mastery
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-5xl mb-2">{levelData.icon}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Level {currentLevel}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left: Current Level & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Level Card */}
            <div className={`bg-gradient-to-br ${levelData.color} rounded-xl shadow-lg p-8 text-white`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">Current Level</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{levelData.title}</h2>
                  <p className="text-white/90">{levelData.description}</p>
                </div>
                <div className="text-5xl">{levelData.icon}</div>
              </div>

              {/* Skills Progress */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm opacity-90 mb-2">Skills to Master:</h3>
                {levelData.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    {skill.completed ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-white/50 rounded-full" />
                    )}
                    <span className={skill.completed ? 'opacity-100' : 'opacity-75'}>
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-[#1E2A5A]" />
                Today's Tasks
              </h3>
              
              <div className="space-y-4">
                {levelData.tasks.map((task, idx) => {
                  const TaskIcon = task.icon;
                  const isCompleted = completedTaskIds.includes(task.id);
                  
                  return (
                    <div 
                      key={idx}
                      className={`border-2 rounded-xl p-4 transition-all ${
                        isCompleted
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg p-3 ${
                          isCompleted
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-[#EEF2FF] dark:bg-blue-900/30'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <TaskIcon className="w-6 h-6 text-[#1E2A5A] dark:text-blue-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 dark:text-white">
                              {task.title}
                            </h4>
                            {isCompleted && (
                              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                            <span>⏱ {task.duration}s</span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                              {task.type}
                            </span>
                          </div>
                        </div>
                        
                        {isCompleted ? (
                          <button
                            onClick={() => handleStartTask(task)}
                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                          >
                            Retry
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartTask(task)}
                            className="bg-[#1E2A5A] hover:bg-[#2A3A7A] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                          >
                            Start
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weaknesses Section */}
            {weaknesses.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  Focus Areas from Recent Practice
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Based on your evaluation data, these areas need improvement:
                </p>
                <div className="space-y-2">
                  {weaknesses.map((weakness, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                        {weakness === 'pace' ? 'Speaking pace' : weakness}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Copilot Recommendation */}
            {currentTask && (
              <div className="bg-[#EEF2FF] dark:from-[#1E2A5A]/20 dark:to-[#2A3A7A]/20 rounded-xl p-6 border border-[#1E2A5A]/20 dark:border-[#1E2A5A]">
                <div className="flex items-start gap-4">
                  <div className="bg-[#1E2A5A] rounded-lg p-3 text-white">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      AI Copilot Recommendation
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {currentTask.recommendation || "Based on your recent performance, I recommend focusing on fluency exercises to reduce filler words. Try speaking on topics for 60 seconds without 'um' or 'uh'."}
                    </p>
                    <button
                      onClick={() => handleStartTask(currentTask)}
                      className="text-sm font-medium text-[#1E2A5A] dark:text-[#2A3A7A] hover:underline"
                    >
                      Start Recommended Task →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Progress Overview */}
          <div className="space-y-6">
            
            {/* Level Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                All Levels
              </h3>
              
              <div className="space-y-3">
                {journeyLevels.map((level) => {
                  const isUnlocked = level.level <= currentLevel;
                  const isCurrent = level.level === currentLevel;
                  
                  return (
                    <div
                      key={level.level}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        isCurrent
                          ? 'border-blue-500 bg-[#F8FAFF] dark:border-blue-400 dark:bg-blue-900/20'
                          : isUnlocked
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl ${
                          isUnlocked ? 'bg-white dark:bg-gray-700' : 'opacity-50'
                        }`}>
                          {level.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {level.title}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Level {level.level}
                          </div>
                        </div>
                        {isCurrent ? (
                          <Play className="w-5 h-5 text-[#1E2A5A]" />
                        ) : isUnlocked ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Achievements
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>First session completed</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Level 1 unlocked</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Complete 10 sessions</span>
                </div>
              </div>
            </div>

            {/* Quick Tip */}
            <div className="bg-[#F8FAFF] dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-[#EEF2FF] dark:border-blue-800">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                💡 Quick Tip
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Practice for just 10 minutes daily to see significant improvement in 2 weeks. Consistency beats intensity!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyMode;
