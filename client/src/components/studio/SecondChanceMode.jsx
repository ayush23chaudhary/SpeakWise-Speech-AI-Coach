import React, { useState } from 'react';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Zap,
  Target,
  Info
} from 'lucide-react';
import api from '../../utils/api';

const SecondChanceMode = ({ firstAttemptReport, onSecondAttempt }) => {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async (secondAttemptReportId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/speech/second-chance/compare', {
        beforeReportId: firstAttemptReport._id,
        afterReportId: secondAttemptReportId,
        evaluationMode: firstAttemptReport.evaluationMode || 'interview'
      });

      setComparison(response.data.data);
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.response?.data?.message || 'Failed to compare attempts');
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-[#1E2A5A]" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-gray-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'positive':
        return 'bg-[#F8FAFF] dark:bg-blue-900/20 border-[#EEF2FF] dark:border-blue-800';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'info':
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'stable':
        return 'text-green-600 dark:text-green-400';
      case 'moderate':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'high':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!comparison) {
    return (
      <div className="card">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <RefreshCw className="w-8 h-8 text-[#1FB6A6]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Second-Chance Mode
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Try the same prompt again to see how evaluators perceive your improvement. 
              The system will compare your before/after performance with human benchmarks.
            </p>
            <button
              onClick={() => onSecondAttempt(handleCompare)}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Record Second Attempt</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-[#F8FAFF] to-[#F8FAFF] dark:from-primary-900/20 dark:to-blue-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <RefreshCw className="w-6 h-6 mr-2 text-[#1FB6A6]" />
              Second-Chance Comparison
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Before/after analysis with {comparison.humanBenchmark.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#1FB6A6] dark:text-primary-400">
              {comparison.changes.overallImprovement > 0 ? '+' : ''}
              {comparison.changes.overallImprovement}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Point Change
            </div>
          </div>
        </div>
      </div>

      {/* Before/After Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before Card */}
        <div className="card border-2 border-gray-300 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              First Attempt
            </h3>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
              comparison.before.riskLevel === 'stable' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              comparison.before.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {comparison.before.riskLevel.toUpperCase()}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {comparison.before.score}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {comparison.before.confidence}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Hesitation Index</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {comparison.before.hesitationIndex}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Filler Words</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {comparison.before.fillerWords}
              </span>
            </div>
          </div>
        </div>

        {/* After Card */}
        <div className="card border-2 border-primary-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Second Attempt
            </h3>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
              comparison.after.riskLevel === 'stable' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              comparison.after.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {comparison.after.riskLevel.toUpperCase()}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-[#1FB6A6] dark:text-primary-400">
                  {comparison.after.score}
                </span>
                {comparison.changes.overallImprovement !== 0 && (
                  <span className={`text-sm font-medium ${
                    comparison.changes.overallImprovement > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {comparison.changes.overallImprovement > 0 ? '+' : ''}
                    {comparison.changes.overallImprovement}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {comparison.after.confidence}
                </span>
                {comparison.changes.confidenceChange !== 0 && (
                  <span className={`text-xs font-medium ${
                    comparison.changes.confidenceChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ({comparison.changes.confidenceChangePercent > 0 ? '+' : ''}
                    {comparison.changes.confidenceChangePercent}%)
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Hesitation Index</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {comparison.after.hesitationIndex}
                </span>
                {comparison.changes.hesitationChange !== 0 && (
                  <span className={`text-xs font-medium ${
                    comparison.changes.hesitationChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ({comparison.changes.hesitationChange > 0 ? '-' : '+'}
                    {Math.abs(comparison.changes.hesitationChangePercent)}%)
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Filler Words</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {comparison.after.fillerWords}
                </span>
                {comparison.changes.fillerWordReduction !== 0 && (
                  <span className={`text-xs font-medium ${
                    comparison.changes.fillerWordReduction > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ({comparison.changes.fillerWordReduction > 0 ? '-' : '+'}
                    {Math.abs(comparison.changes.fillerWordReduction)})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Transition */}
      {comparison.riskTransition.from !== comparison.riskTransition.to && (
        <div className={`card border-l-4 ${
          comparison.riskTransition.improved 
            ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
            : 'border-orange-600 bg-orange-50 dark:bg-orange-900/20'
        }`}>
          <div className="flex items-center space-x-3">
            {comparison.riskTransition.improved ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-orange-600" />
            )}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Risk Level Transition
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className={getRiskLevelColor(comparison.riskTransition.from)}>
                  {comparison.riskTransition.from.toUpperCase()}
                </span>
                {' → '}
                <span className={getRiskLevelColor(comparison.riskTransition.to)}>
                  {comparison.riskTransition.to.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Insights Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-600" />
          Evaluator Perception Changes
        </h3>
        
        {comparison.insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getInsightBgColor(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {insight.category}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {insight.message}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {insight.detail}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Human Benchmark Context */}
      <div className="card bg-gradient-to-r from-[#EEF2FF] to-[#F8FAFF] dark:from-[#2A3A7A]/20 dark:to-blue-900/20 border-l-4 border-[#6C63FF]">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <Clock className="w-6 h-6 text-[#6C63FF]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {comparison.humanBenchmark.name}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {comparison.humanBenchmark.description}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Max Pause
                </div>
                <div className="text-lg font-bold text-[#6C63FF] dark:text-[#6C63FF]">
                  {comparison.humanBenchmark.thresholds.maxPause}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Attention Span
                </div>
                <div className="text-lg font-bold text-[#6C63FF] dark:text-[#6C63FF]">
                  {comparison.humanBenchmark.thresholds.attentionSpan}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Hesitation Tolerance
                </div>
                <div className="text-lg font-bold text-[#6C63FF] dark:text-[#6C63FF]">
                  {comparison.humanBenchmark.thresholds.hesitationTolerance}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
              Context: {comparison.humanBenchmark.context}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondChanceMode;
