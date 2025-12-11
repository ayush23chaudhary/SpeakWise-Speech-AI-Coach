import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Play, 
  Pause, 
  Volume2, 
  TrendingUp, 
  Target, 
  Zap, 
  Award,
  Clock,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import DetailedMetricsOverview from './DetailedMetricsOverview';
import { ANALYSIS_RECOMMENDATIONS, CHART_COLORS } from '../../utils/constants';

const EnhancedAnalysisDashboard = ({ analysisData }) => {
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [selectedMetric, setSelectedMetric] = useState('overallScore');
  const [showDetailedView, setShowDetailedView] = useState(false);

  useEffect(() => {
    if (analysisData) {
      setCurrentTranscript(analysisData.transcript || '');
    }
  }, [analysisData]);

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Analysis Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Record a speech in the Performance Studio to see your analysis results here.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const { 
    overallScore, 
    metrics, 
    fillerWords, 
    pace, 
    recommendations, 
    strengths, 
    areasForImprovement 
  } = analysisData;

  // Prepare data for charts
  const fillerWordsData = Object.entries(fillerWords).map(([word, count]) => ({
    word: word.charAt(0).toUpperCase() + word.slice(1),
    count,
    fill: CHART_COLORS.primary
  }));

  const radarData = [
    { metric: 'Clarity', score: metrics.clarity, fullMark: 100 },
    { metric: 'Confidence', score: metrics.confidence, fullMark: 100 },
    { metric: 'Fluency', score: metrics.fluency, fullMark: 100 },
    { metric: 'Pace', score: metrics.pace, fullMark: 100 },
    { metric: 'Tone', score: metrics.tone, fullMark: 100 }
  ];

  const performanceData = [
    { name: 'Excellent', value: metrics.clarity >= 80 ? 1 : 0, fill: CHART_COLORS.success },
    { name: 'Good', value: metrics.clarity >= 60 && metrics.clarity < 80 ? 1 : 0, fill: CHART_COLORS.warning },
    { name: 'Needs Work', value: metrics.clarity < 60 ? 1 : 0, fill: CHART_COLORS.danger }
  ];

  const handleWordClick = (index) => {
    setCurrentWordIndex(index);
    // In a real implementation, this would play audio from that timestamp
    console.log(`Playing audio from word index: ${index}`);
  };

  const highlightFillerWords = (text) => {
    const words = text.split(' ');
    return words.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:]/, '');
      const isFillerWord = Object.keys(fillerWords).includes(cleanWord);
      
      return (
        <span
          key={index}
          className={`cursor-pointer transition-all duration-200 ${
            isFillerWord 
              ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-1 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700' 
              : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-1 rounded'
          } ${currentWordIndex === index ? 'bg-blue-200 dark:bg-blue-800 ring-2 ring-blue-400' : ''}`}
          onClick={() => handleWordClick(index)}
          title={isFillerWord ? `Filler word: ${cleanWord}` : ''}
        >
          {word}{' '}
        </span>
      );
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getPerformanceLevel = (score) => {
    if (score >= 80) return { level: 'Excellent', icon: Award, color: 'text-green-600' };
    if (score >= 60) return { level: 'Good', icon: ThumbsUp, color: 'text-yellow-600' };
    return { level: 'Needs Work', icon: AlertTriangle, color: 'text-red-600' };
  };

  const performanceLevel = getPerformanceLevel(overallScore);
  const PerformanceIcon = performanceLevel.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Analysis Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your latest speech analysis results
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-40 h-40 rounded-full flex items-center justify-center ${getScoreBgColor(overallScore)} relative`}>
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(overallScore)} mb-2`}>
                  {overallScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">/ 100</div>
              </div>
              
              {/* Performance Level Badge */}
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-700">
                <PerformanceIcon className={`w-6 h-6 ${performanceLevel.color}`} />
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Overall Performance Score
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {performanceLevel.level} - {overallScore >= 80 ? 'Outstanding work!' : overallScore >= 60 ? 'Good progress!' : 'Keep practicing!'}
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => setShowDetailedView(!showDetailedView)}
              variant="outline"
              size="sm"
            >
              {showDetailedView ? 'Hide Details' : 'Show Details'}
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="sm"
            >
              Print Report
            </Button>
          </div>
        </Card>

        {/* Detailed Metrics */}
        {showDetailedView && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(metrics).map(([metric, score]) => (
              <Card key={metric} className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 capitalize">
                  {metric}
                </h4>
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(score)}`}>
                  {score}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      score >= 80 ? 'bg-green-500' : 
                      score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pace Gauge */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary-600" />
              Speaking Pace
            </h3>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(metrics.pace)}`}>
                {pace.wordsPerMinute} WPM
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                pace.status === 'Good' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : pace.status === 'Too Fast'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}>
                {pace.status}
              </div>
              
              {/* Pace Visualization */}
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(pace.wordsPerMinute / 200) * 352} 352`}
                    className={`transition-all duration-1000 ${
                      pace.status === 'Good' ? 'text-green-500' : 
                      pace.status === 'Too Fast' ? 'text-red-500' : 'text-yellow-500'
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            </div>
          </Card>

          {/* Filler Words Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary-600" />
              Filler Words Analysis
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fillerWordsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="word" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Object.values(fillerWords).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Filler Words
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Performance Metrics */}
        <Card>
          <DetailedMetricsOverview metrics={metrics} />
        </Card>

        {/* Radar Chart - Traditional View */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Performance Radar View
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Interactive Transcript */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
            Interactive Transcript
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <p className="text-gray-900 dark:text-white leading-relaxed text-lg">
              {highlightFillerWords(currentTranscript)}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <p>Click on highlighted words to hear that part of your recording</p>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-800 rounded mr-2"></div>
                Filler Words
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-blue-200 dark:bg-blue-800 rounded mr-2"></div>
                Selected
              </span>
            </div>
          </div>
        </Card>

        {/* Recommendations and Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strengths */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30 border-2 border-emerald-200 dark:border-emerald-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="relative p-5">
              <div className="flex items-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <ThumbsUp className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    🎯 Strengths
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">You excel at</p>
                </div>
              </div>
              
              <div className="space-y-2.5">
                {strengths.map((strength, index) => (
                  <div
                    key={index}
                    className="group p-3 rounded-lg bg-white dark:bg-gray-800/80 border border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-2.5 text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                        {strength}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 border-2 border-amber-200 dark:border-amber-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="relative p-5">
              <div className="flex items-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    📈 Growth
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400">Areas to improve</p>
                </div>
              </div>
              
              <div className="space-y-2.5">
                {areasForImprovement.map((area, index) => (
                  <div
                    key={index}
                    className="group p-3 rounded-lg bg-white dark:bg-gray-800/80 border border-amber-200 dark:border-amber-800/50 hover:border-amber-400 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-2.5 text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                        {area}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="relative p-5">
              <div className="flex items-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    💡 Actions
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-400">Next steps</p>
                </div>
              </div>
              
              <div className="space-y-2.5">
                {recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="group p-3 rounded-lg bg-white dark:bg-gray-800/80 border border-blue-200 dark:border-blue-800/50 hover:border-blue-400 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start">
                      <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5">
                        <div className="absolute inset-0 bg-blue-400 rounded-lg blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
                        <span className="relative text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <p className="ml-2.5 text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                        {recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <Card className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Next Steps
          </h3>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => window.location.href = '/studio'}
              variant="primary"
              size="lg"
            >
              Record Another Speech
            </Button>
            <Button
              onClick={() => window.location.href = '/progress'}
              variant="outline"
              size="lg"
            >
              View Progress
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedAnalysisDashboard;
