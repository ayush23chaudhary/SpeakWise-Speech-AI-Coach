import React from 'react';
import { TrendingUp, TrendingDown, Minus, Award, Target, Zap, Volume2, MessageCircle } from 'lucide-react';

const DetailedMetricsOverview = ({ metrics }) => {
  const metricsData = [
    {
      name: 'Clarity',
      score: metrics.clarity || 0,
      icon: MessageCircle,
      description: 'How clearly you articulated your words',
      color: 'primary',
      gradient: 'from-[#1FB6A6] to-[#F8FAFF]0',
      bgLight: 'bg-gray-50',
      bgDark: 'dark:bg-gray-800/50',
      textColor: 'text-gray-700 dark:text-gray-200',
      borderColor: 'border-gray-200 dark:border-gray-700'
    },
    {
      name: 'Confidence',
      score: metrics.confidence || 0,
      icon: Award,
      description: 'Your speaking confidence and assertiveness',
      color: 'primary',
      gradient: 'from-[#1FB6A6] to-[#F8FAFF]0',
      bgLight: 'bg-gray-50',
      bgDark: 'dark:bg-gray-800/50',
      textColor: 'text-gray-700 dark:text-gray-200',
      borderColor: 'border-gray-200 dark:border-gray-700'
    },
    {
      name: 'Fluency',
      score: metrics.fluency || 0,
      icon: Zap,
      description: 'Smoothness and flow of your speech',
      color: 'primary',
      gradient: 'from-[#1FB6A6] to-[#F8FAFF]0',
      bgLight: 'bg-gray-50',
      bgDark: 'dark:bg-gray-800/50',
      textColor: 'text-gray-700 dark:text-gray-200',
      borderColor: 'border-gray-200 dark:border-gray-700'
    },
    {
      name: 'Pace',
      score: metrics.pace || 0,
      icon: Target,
      description: 'Your speaking speed and rhythm',
      color: 'primary',
      gradient: 'from-[#1FB6A6] to-[#F8FAFF]0',
      bgLight: 'bg-gray-50',
      bgDark: 'dark:bg-gray-800/50',
      textColor: 'text-gray-700 dark:text-gray-200',
      borderColor: 'border-gray-200 dark:border-gray-700'
    },
    {
      name: 'Tone',
      score: metrics.tone || 0,
      icon: Volume2,
      description: 'Quality and variation in your voice',
      color: 'primary',
      gradient: 'from-[#1FB6A6] to-[#F8FAFF]0',
      bgLight: 'bg-gray-50',
      bgDark: 'dark:bg-gray-800/50',
      textColor: 'text-gray-700 dark:text-gray-200',
      borderColor: 'border-gray-200 dark:border-gray-700'
    }
  ];

  const getScoreLabel = (score) => {
    if (score >= 90) return { label: 'Excellent', icon: TrendingUp, color: 'text-[#1FB6A6] dark:text-primary-400' };
    if (score >= 80) return { label: 'Very Good', icon: TrendingUp, color: 'text-[#1FB6A6] dark:text-primary-400' };
    if (score >= 70) return { label: 'Good', icon: TrendingUp, color: 'text-gray-600 dark:text-gray-400' };
    if (score >= 60) return { label: 'Fair', icon: Minus, color: 'text-gray-600 dark:text-gray-400' };
    if (score >= 50) return { label: 'Needs Work', icon: TrendingDown, color: 'text-gray-500 dark:text-gray-500' };
    return { label: 'Poor', icon: TrendingDown, color: 'text-gray-500 dark:text-gray-500' };
  };

  const getProgressBarColor = (score) => {
    if (score >= 80) return 'bg-gradient-to-r from-[#1FB6A6] to-[#F8FAFF]0';
    if (score >= 60) return 'bg-gradient-to-r from-gray-400 to-gray-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
          <Award className="w-7 h-7 mr-2 text-[#1FB6A6] dark:text-primary-400" />
          Performance Metrics Overview
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed breakdown of your speaking performance
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricsData.map((metric, index) => {
          const MetricIcon = metric.icon;
          const scoreInfo = getScoreLabel(metric.score);
          const ScoreIcon = scoreInfo.icon;
          
          return (
            <div
              key={metric.name}
              className={`relative overflow-hidden rounded-lg border ${metric.borderColor} ${metric.bgLight} ${metric.bgDark} p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
            >
              {/* Header with Icon */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-sm`}>
                    <MetricIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-base font-semibold ${metric.textColor}`}>
                      {metric.name}
                    </h4>
                  </div>
                </div>
                
                {/* Score Badge */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.score}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">/ 100</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressBarColor(metric.score)} transition-all duration-1000 ease-out rounded-full`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>

              {/* Score Label with Icon */}
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${scoreInfo.color} bg-gray-100 dark:bg-gray-700/50`}>
                  <ScoreIcon className="w-3.5 h-3.5 mr-1" />
                  {scoreInfo.label}
                </span>
                
                {/* Percentage */}
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {metric.score}%
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Average Score Card */}
      <div className="mt-4 p-5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Overall Average Score
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Combined performance across all metrics
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#1FB6A6] dark:text-primary-400">
              {Math.round(
                metricsData.reduce((sum, m) => sum + m.score, 0) / metricsData.length
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              out of 100
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedMetricsOverview;
