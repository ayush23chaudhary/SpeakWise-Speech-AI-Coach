import React, { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, Award, Flame, BookOpen, 
  Play, Clock, Star, Trophy, ChevronRight, Zap,
  CheckCircle
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import ExerciseModal from './ExerciseModal';
import api from '../../utils/api';

const PracticeHub = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [progress, setProgress] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  useEffect(() => {
    fetchPracticeHubData();
  }, []);

  const fetchPracticeHubData = async () => {
    setLoading(true);
    try {
      const [recRes, challengeRes, progressRes, statsRes] = await Promise.all([
        api.get('/practice-hub/recommendations'),
        api.get('/practice-hub/daily-challenge'),
        api.get('/practice-hub/progress'),
        api.get('/practice-hub/stats')
      ]);

      setRecommendations(recRes.data.data);
      setDailyChallenge(challengeRes.data.data);
      setProgress(progressRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching practice hub data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExercise = (exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };

  const handleExerciseComplete = async (completionData) => {
    await fetchPracticeHubData();
    setShowExerciseModal(false);
    setSelectedExercise(null);
    
    if (completionData.newAchievements && completionData.newAchievements.length > 0) {
      completionData.newAchievements.forEach(achievement => {
        alert(`🎉 Achievement Unlocked: ${achievement.icon} ${achievement.title}\n${achievement.description}`);
      });
    }
  };

  const handleCloseModal = () => {
    setShowExerciseModal(false);
    setSelectedExercise(null);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'pronunciation': 'bg-purple-500',
      'fluency': 'bg-blue-500',
      'pacing': 'bg-cyan-500',
      'confidence': 'bg-yellow-500',
      'vocabulary': 'bg-green-500',
      'filler-words': 'bg-red-500',
      'tone': 'bg-pink-500',
      'articulation': 'bg-indigo-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'beginner': 'success',
      'intermediate': 'warning',
      'advanced': 'danger'
    };
    return colors[difficulty] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎯 Practice Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Personalized exercises and challenges to improve your speaking skills
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.currentStreak || 0} days
            </p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Exercises Done</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.totalExercises || 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Achievements</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.totalAchievements || 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Skill Level</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.averageSkillLevel || 0}%
            </p>
          </div>
        </Card>
      </div>

      {dailyChallenge && (
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5" />
                <h2 className="text-xl font-bold">Today's Challenge</h2>
              </div>
              <h3 className="text-2xl font-bold mb-2">{dailyChallenge.title}</h3>
              <p className="text-purple-100 mb-4">{dailyChallenge.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{dailyChallenge.duration} min</span>
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full">
                  {dailyChallenge.difficulty}
                </span>
                <span className="text-purple-100">⏰ {dailyChallenge.expiresIn}</span>
              </div>
            </div>
            <Button 
              variant="secondary"
              onClick={() => handleStartExercise(dailyChallenge)}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Challenge
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {recommendations && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Target className="w-6 h-6 mr-2 text-purple-600" />
                  Recommended for You
                </h2>
              </div>

              {recommendations.weakAreas && recommendations.weakAreas.length > 0 && (
                <Card className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-600" />
                    Areas to Focus On
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.weakAreas.map((area, index) => (
                      <Badge 
                        key={index}
                        variant={area.severity === 'high' ? 'danger' : 'warning'}
                      >
                        {area.category}: {area.severity}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {recommendations.aiRecommendations && (
                <Card className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    🤖 AI-Powered Activities
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">
                    "{recommendations.aiRecommendations.motivationalMessage}"
                  </p>
                  <div className="space-y-3">
                    {recommendations.aiRecommendations.activities?.map((activity, index) => (
                      <div 
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleStartExercise(activity)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {activity.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {activity.description}
                            </p>
                            <div className="flex items-center space-x-3 text-xs">
                              <span className="flex items-center text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {activity.duration} min
                              </span>
                              <Badge variant={getDifficultyColor(activity.difficulty)}>
                                {activity.difficulty}
                              </Badge>
                              <span className={`px-2 py-1 rounded text-white ${getCategoryColor(activity.category)}`}>
                                {activity.category}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {recommendations.exercises && recommendations.exercises.length > 0 && (
                <Card>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Recommended Exercises
                  </h3>
                  <div className="space-y-3">
                    {recommendations.exercises.map((exercise) => (
                      <div 
                        key={exercise._id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors cursor-pointer"
                        onClick={() => handleStartExercise(exercise)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {exercise.title}
                          </h4>
                          <Badge variant={getDifficultyColor(exercise.difficulty)}>
                            {exercise.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {exercise.description}
                        </p>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="flex items-center text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {exercise.duration} min
                          </span>
                          <span className={`px-2 py-1 rounded text-white ${getCategoryColor(exercise.category)}`}>
                            {exercise.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {stats?.skillLevels && (
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Your Skill Levels
              </h3>
              <div className="space-y-4">
                {Object.entries(stats.skillLevels).map(([skill, level]) => (
                  <div key={skill}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300 capitalize">
                        {skill}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {level}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {progress?.achievements && progress.achievements.length > 0 && (
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {progress.achievements.slice(-5).reverse().map((achievement, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {recommendations?.improvementPlan?.thirtyDayChallenge && (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                30-Day Challenge
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                {recommendations.improvementPlan.thirtyDayChallenge.description}
              </p>
              <div className="space-y-2">
                {recommendations.improvementPlan.thirtyDayChallenge.milestones?.map((milestone, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-2 text-sm"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center font-bold text-purple-600 dark:text-purple-300">
                      {milestone.day}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 dark:text-gray-300">{milestone.goal}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{milestone.reward}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {showExerciseModal && selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={handleCloseModal}
          onComplete={handleExerciseComplete}
        />
      )}
    </div>
  );
};

export default PracticeHub;
