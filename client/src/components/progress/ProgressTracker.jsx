import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Zap,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import api from '../../utils/api';

const ProgressTracker = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('overallScore');
  const [timeRange, setTimeRange] = useState('all');
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (reports.length > 0) {
      calculateTrends();
    }
  }, [reports, timeRange]);

  const fetchReports = async () => {
    try {
      const response = await api.get('/speech/history');
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMetricLabel = (metric) => {
    const labels = {
      overallScore: 'Overall Score',
      clarity: 'Clarity',
      confidence: 'Confidence',
      fluency: 'Fluency',
      pace: 'Pace',
      tone: 'Tone'
    };
    return labels[metric] || metric;
  };

  const getMetricColor = (metric) => {
    const colors = {
      overallScore: '#3b82f6',
      clarity: '#10b981',
      confidence: '#f59e0b',
      fluency: '#ef4444',
      pace: '#8b5cf6',
      tone: '#06b6d4'
    };
    return colors[metric] || '#3b82f6';
  };

  const filterReportsByTimeRange = (reports) => {
    const now = new Date();
    const filtered = reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      
      switch (timeRange) {
        case 'week':
          return reportDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return reportDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'quarter':
          return reportDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    });
    
    return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  /**
   * Calculate trend analytics - NO RAW TABLES
   * Shows: Hesitation reduction %, Confidence stability improvement, etc.
   */
  const calculateTrends = () => {
    const filteredReports = filterReportsByTimeRange(reports);
    if (filteredReports.length < 2) {
      setTrends(null);
      return;
    }

    // Split into first half and second half for comparison
    const midpoint = Math.floor(filteredReports.length / 2);
    const firstHalf = filteredReports.slice(0, midpoint);
    const secondHalf = filteredReports.slice(midpoint);

    const avgMetric = (reports, key) => {
      const sum = reports.reduce((acc, r) => {
        if (key === 'hesitation') {
          // Calculate hesitation from filler words
          const fillerCount = r.fillerWords 
            ? Object.values(r.fillerWords).reduce((sum, count) => sum + count, 0)
            : 0;
          return acc + fillerCount;
        } else if (key === 'pauseFrequency') {
          return acc + (r.riskSignals?.longPauseIndex || 0);
        }
        return acc + (r.metrics?.[key] || r[key] || 0);
      }, 0);
      return sum / reports.length;
    };

    // Calculate improvements
    const hesitationFirst = avgMetric(firstHalf, 'hesitation');
    const hesitationSecond = avgMetric(secondHalf, 'hesitation');
    const hesitationReduction = hesitationFirst > 0 
      ? ((hesitationFirst - hesitationSecond) / hesitationFirst * 100)
      : 0;

    const confidenceFirst = avgMetric(firstHalf, 'confidence');
    const confidenceSecond = avgMetric(secondHalf, 'confidence');
    const confidenceImprovement = confidenceSecond - confidenceFirst;

    const fluencyFirst = avgMetric(firstHalf, 'fluency');
    const fluencySecond = avgMetric(secondHalf, 'fluency');
    const fluencyImprovement = fluencySecond - fluencyFirst;

    const pauseFirst = avgMetric(firstHalf, 'pauseFrequency');
    const pauseSecond = avgMetric(secondHalf, 'pauseFrequency');
    const pauseReduction = pauseFirst > 0
      ? ((pauseFirst - pauseSecond) / pauseFirst * 100)
      : 0;

    const overallFirst = avgMetric(firstHalf, 'overallScore');
    const overallSecond = avgMetric(secondHalf, 'overallScore');
    const overallImprovement = overallSecond - overallFirst;

    setTrends({
      hesitationReduction,
      confidenceImprovement,
      fluencyImprovement,
      pauseReduction,
      overallImprovement,
      totalSessions: filteredReports.length,
      recentAverage: overallSecond,
      bestScore: Math.max(...filteredReports.map(r => r.overallScore)),
      consistency: calculateConsistency(secondHalf)
    });
  };

  const calculateConsistency = (recentReports) => {
    if (recentReports.length < 2) return 0;
    const scores = recentReports.map(r => r.overallScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    // Lower std dev = higher consistency (convert to 0-100 scale, inverted)
    return Math.max(0, 100 - stdDev * 2);
  };

  const prepareChartData = () => {
    const filteredReports = filterReportsByTimeRange(reports);
    
    return filteredReports.map((report, index) => ({
      index: index + 1,
      date: formatDate(report.createdAt),
      fullDate: report.createdAt,
      overallScore: report.overallScore,
      clarity: report.metrics?.clarity || 0,
      confidence: report.metrics?.confidence || 0,
      fluency: report.metrics?.fluency || 0,
      pace: report.metrics?.pace || 0,
      tone: report.metrics?.tone || 0,
      // Risk signals
      trustLevel: 100 - (report.riskSignals?.longPauseIndex || 0),
      engagement: 100 - (report.riskSignals?.hesitationIndex || 0)
    }));
  };

  const getTrendIcon = (value) => {
    if (value > 2) return <ArrowUpRight className="w-5 h-5 text-green-600" />;
    if (value < -2) return <ArrowDownRight className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getTrendColor = (value) => {
    if (value > 2) return 'text-green-600 dark:text-green-400';
    if (value < -2) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTrendLabel = (value) => {
    if (value > 10) return 'Strong improvement';
    if (value > 2) return 'Improving';
    if (value < -10) return 'Needs attention';
    if (value < -2) return 'Declining';
    return 'Stable';
  };

  const calculateProgressStats = () => {
    if (reports.length < 2) return null;
    
    const sortedReports = [...reports].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstScore = sortedReports[0].overallScore;
    const latestScore = sortedReports[sortedReports.length - 1].overallScore;
    const improvement = latestScore - firstScore;
    
    return {
      improvement,
      totalSessions: reports.length,
      averageScore: Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length),
      bestScore: Math.max(...reports.map(r => r.overallScore)),
      improvementPercentage: Math.round((improvement / firstScore) * 100)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FB6A6] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your communication trajectory...</p>
          </div>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="card text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Communication Trajectory Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete your first evaluator perception analysis to start tracking your trajectory.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Communication Trajectory
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your evaluator confidence evolution—not raw metrics, but perception trends
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Range:
              </span>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">All Time</option>
              <option value="quarter">Last 3 Months</option>
              <option value="month">Last Month</option>
              <option value="week">Last Week</option>
            </select>
          </div>
        </div>

        {/* Trend Analysis Cards - NO RAW TABLES */}
        {trends && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Hesitation Reduction */}
              <div className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hesitation Pattern
                    </span>
                  </div>
                  {getTrendIcon(trends.hesitationReduction)}
                </div>
                <div className={`text-2xl font-bold mb-1 ${getTrendColor(trends.hesitationReduction)}`}>
                  {trends.hesitationReduction > 0 ? '-' : '+'}{Math.abs(trends.hesitationReduction).toFixed(0)}%
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {trends.hesitationReduction > 0 
                    ? 'Hesitation reduced across sessions—evaluators notice fewer "um, uh" clusters'
                    : trends.hesitationReduction < -5
                    ? 'Hesitation increasing—signals uncertainty to evaluators'
                    : 'Hesitation stable—maintain current preparation level'}
                </p>
              </div>

              {/* Confidence Stability */}
              <div className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-[#1E2A5A]" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confidence Stability
                    </span>
                  </div>
                  {getTrendIcon(trends.confidenceImprovement)}
                </div>
                <div className={`text-2xl font-bold mb-1 ${getTrendColor(trends.confidenceImprovement)}`}>
                  {trends.confidenceImprovement > 0 ? '+' : ''}{trends.confidenceImprovement.toFixed(0)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {trends.confidenceImprovement > 2
                    ? 'Vocal stability improving—examiners perceive growing expertise'
                    : trends.confidenceImprovement < -2
                    ? 'Confidence declining—vocal instability signals nervousness'
                    : 'Confidence consistent—evaluators see steady competence'}
                </p>
              </div>

              {/* Overall Trajectory */}
              <div className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Overall Trajectory
                    </span>
                  </div>
                  {getTrendIcon(trends.overallImprovement)}
                </div>
                <div className={`text-2xl font-bold mb-1 ${getTrendColor(trends.overallImprovement)}`}>
                  {trends.overallImprovement > 0 ? '+' : ''}{trends.overallImprovement.toFixed(0)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {getTrendLabel(trends.overallImprovement)} - {trends.totalSessions} evaluations analyzed
                </p>
              </div>

              {/* Performance Consistency */}
              <div className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-[#6C63FF]" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Consistency Score
                    </span>
                  </div>
                  {trends.consistency >= 70 ? (
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <Minus className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className={`text-2xl font-bold mb-1 ${
                  trends.consistency >= 70 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {trends.consistency.toFixed(0)}%
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {trends.consistency >= 80
                    ? 'Highly consistent—evaluators can predict reliable performance'
                    : trends.consistency >= 60
                    ? 'Moderate consistency—performance varies session to session'
                    : 'High variance—unpredictable outcomes undermine evaluator confidence'}
                </p>
              </div>
            </div>

            {/* Additional Trend Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pause Pattern Trend */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <TrendingDown className="w-5 h-5 mr-2 text-orange-600" />
                    Pause Pattern Evolution
                  </h3>
                  <span className={`text-sm font-medium ${getTrendColor(trends.pauseReduction)}`}>
                    {trends.pauseReduction > 0 ? '↓' : '↑'} {Math.abs(trends.pauseReduction).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {trends.pauseReduction > 10
                    ? '✅ Strong improvement: Long pauses reduced significantly—interviewers interpret as growing preparation mastery'
                    : trends.pauseReduction > 0
                    ? '⚡ Gradual improvement: Pause frequency declining—evaluators notice smoother flow'
                    : trends.pauseReduction < -10
                    ? '⚠️ Pause frequency increasing: Extended silences signal "thinking gaps" to evaluators'
                    : '➖ Pause pattern stable: Maintain current rehearsal strategies'}
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  In interview contexts, pauses over 2s typically interpreted as "I don't know" rather than "thoughtful consideration"
                </div>
              </div>

              {/* Fluency Trajectory */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-[#1E2A5A]" />
                    Fluency Trajectory
                  </h3>
                  <span className={`text-sm font-medium ${getTrendColor(trends.fluencyImprovement)}`}>
                    {trends.fluencyImprovement > 0 ? '↑' : '↓'} {Math.abs(trends.fluencyImprovement).toFixed(0)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {trends.fluencyImprovement > 5
                    ? '✅ Speech flow improving: Fewer interruptions—examiners perceive subject mastery'
                    : trends.fluencyImprovement > 0
                    ? '⚡ Fluency gradually improving: Smoother delivery signals growing confidence to evaluators'
                    : trends.fluencyImprovement < -5
                    ? '⚠️ Fluency declining: Increased disruptions undermine evaluator trust'
                    : '➖ Fluency stable: Current preparation level maintaining evaluator expectations'}
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Recent average: {trends.recentAverage.toFixed(0)}/100 • Best: {trends.bestScore}/100
                </div>
              </div>
            </div>
          </>
        )}

        {/* Trajectory Visualization - Area Chart for Confidence Evolution */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-[#1FB6A6]" />
                Evaluator Confidence Evolution
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Your trajectory across {chartData.length} evaluation sessions
              </p>
            </div>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="input-field w-auto"
            >
              <option value="overallScore">Overall Index</option>
              <option value="confidence">Confidence Stability</option>
              <option value="fluency">Fluency Flow</option>
              <option value="trustLevel">Evaluator Trust</option>
              <option value="engagement">Engagement Signals</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="index" 
                tickFormatter={(value) => `S${value}`}
                stroke="#888"
              />
              <YAxis domain={[0, 100]} stroke="#888" />
              <Tooltip 
                labelFormatter={(value, payload) => {
                  if (payload && payload[0]) {
                    return `Session ${value} • ${payload[0].payload.date}`;
                  }
                  return `Session ${value}`;
                }}
                formatter={(value) => [value.toFixed(0), getMetricLabel(selectedMetric)]}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={getMetricColor(selectedMetric)}
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insight: What Evaluators See */}
        {trends && (
          <div className="card bg-gradient-to-r from-[#F8FAFF] to-[#EEF2FF] dark:from-blue-900/20 dark:to-[#2A3A7A]/20 border-l-4 border-[#1E2A5A]">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <Award className="w-6 h-6 text-[#1E2A5A]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Evaluator Perception Summary
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {trends.overallImprovement > 10
                    ? `Strong upward trajectory detected. Evaluators likely perceive ${trends.totalSessions >= 5 ? 'consistent improvement and preparation commitment' : 'early positive signals'}. Your hesitation reduction of ${Math.abs(trends.hesitationReduction).toFixed(0)}% suggests growing subject mastery.`
                    : trends.overallImprovement > 0
                    ? `Gradual improvement trajectory. Evaluators see ${trends.consistency >= 70 ? 'reliable' : 'variable'} performance. Focus on consistency to strengthen evaluator confidence.`
                    : trends.overallImprovement < -5
                    ? `⚠️ Declining trajectory detected. Evaluators may interpret this as preparation gaps or confidence erosion. Recent sessions show ${trends.confidenceImprovement < 0 ? 'vocal instability' : 'inconsistent patterns'}.`
                    : `Stable performance trajectory. Evaluators see predictable outcomes. ${trends.consistency >= 70 ? 'High consistency strengthens trust' : 'Increase consistency to boost evaluator confidence'}.`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {trends.hesitationReduction > 10 && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                      ✓ Hesitation mastery
                    </span>
                  )}
                  {trends.confidenceImprovement > 5 && (
                    <span className="px-3 py-1 bg-[#EEF2FF] dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                      ✓ Confidence strengthening
                    </span>
                  )}
                  {trends.consistency >= 80 && (
                    <span className="px-3 py-1 bg-[#6C63FF]/10 dark:bg-[#2A3A7A]/30 text-[#4A42D8] dark:text-[#6C63FF]/30 text-xs rounded-full">
                      ✓ High consistency
                    </span>
                  )}
                  {trends.pauseReduction > 10 && (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                      ✓ Pause control improving
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
