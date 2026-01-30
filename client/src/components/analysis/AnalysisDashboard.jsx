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
  Cell
} from 'recharts';
import { Play, Pause, Volume2, TrendingUp, Target, Zap } from 'lucide-react';
import DetailedMetricsOverview from './DetailedMetricsOverview';

const AnalysisDashboard = ({ analysisData }) => {
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  useEffect(() => {
    if (analysisData) {
      setCurrentTranscript(analysisData.transcript || '');
    }
  }, [analysisData]);

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="card text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Analysis Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Record a speech in the Performance Studio to see your analysis results here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { overallScore, metrics, fillerWords, pace, recommendations, strengths, areasForImprovement } = analysisData;

  // Prepare data for charts
  const fillerWordsData = Object.entries(fillerWords).map(([word, count]) => ({
    word: word.charAt(0).toUpperCase() + word.slice(1),
    count
  }));

  const radarData = [
    { metric: 'Clarity', score: metrics.clarity, fullMark: 100 },
    { metric: 'Confidence', score: metrics.confidence, fullMark: 100 },
    { metric: 'Fluency', score: metrics.fluency, fullMark: 100 },
    { metric: 'Pace', score: metrics.pace, fullMark: 100 },
    { metric: 'Tone', score: metrics.tone, fullMark: 100 }
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
          className={`cursor-pointer transition-colors duration-200 ${
            isFillerWord 
              ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-1 rounded' 
              : 'text-gray-900 dark:text-white'
          } ${currentWordIndex === index ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Evaluation Summary
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your latest evaluator perception analysis
          </p>
        </div>

        {/* Overall Score */}
        <div className="card text-center">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-40 h-40 rounded-full flex items-center justify-center ${getScoreBgColor(overallScore)} border-4 ${
              overallScore >= 75 ? 'border-green-400' : overallScore >= 60 ? 'border-yellow-400' : 'border-red-400'
            }`}>
              <div className="text-center">
                {/* Primary: Risk-Based Status */}
                <div className={`text-2xl font-bold ${getScoreColor(overallScore)} mb-2`}>
                  {overallScore >= 75 ? 'Stable' : overallScore >= 60 ? 'Moderate Risk' : 'High Risk'}
                </div>
                {/* Secondary: Numeric Index */}
                <div className="text-sm text-gray-500 dark:text-gray-500">Index: {overallScore}/100</div>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Evaluator Confidence Assessment
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {overallScore >= 75 ? 'Evaluator confidence maintained' : overallScore >= 60 ? 'Some evaluator concern detected' : 'Evaluator trust likely compromised'}
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pace Gauge */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-[#1FB6A6]" />
              Speaking Pace
            </h3>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(metrics.pace)}`}>
                {pace.wordsPerMinute} WPM
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                pace.status === 'Good' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : pace.status === 'Too Fast'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}>
                {pace.status}
              </div>
            </div>
          </div>

          {/* Filler Words Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-[#1FB6A6]" />
              Filler Words
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fillerWordsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="word" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Performance Metrics */}
        <div className="card">
          <DetailedMetricsOverview metrics={metrics} />
        </div>

        {/* Radar Chart - Traditional View */}
        <div className="card">
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
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Interactive Transcript */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Volume2 className="w-5 h-5 mr-2 text-[#1FB6A6]" />
            Interactive Transcript
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-gray-900 dark:text-white leading-relaxed">
              {highlightFillerWords(currentTranscript)}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Click on highlighted words to hear that part of your recording
          </p>
        </div>

        {/* Recommendations and Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30 border-2 border-emerald-200 dark:border-emerald-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Decorative background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-400/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
            
            <div className="relative p-6">
              <div className="flex items-center mb-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    🎯 Your Strengths
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    What you're doing great
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {strengths.map((strength, index) => (
                  <div
                    key={index}
                    className="group relative p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-transform duration-200">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                          {strength}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 border-2 border-amber-200 dark:border-amber-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Decorative background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
            
            <div className="relative p-6">
              <div className="flex items-center mb-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    📈 Growth Areas
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    Opportunities to improve
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {areasForImprovement.map((area, index) => (
                  <div
                    key={index}
                    className="group relative p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-amber-200 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-transform duration-200">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                          {area}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F8FAFF] via-[#EEF2FF] to-[#EEF2FF] dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-[#EEF2FF] dark:border-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Decorative background pattern */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#6C63FF]/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
          
          <div className="relative p-6">
            <div className="flex items-center mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#F8FAFF]0 to-[#1E2A5A] flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  💡 Action Steps
                </h3>
                <p className="text-xs text-[#2A3A7A] dark:text-blue-400 font-medium">
                  Practical ways to improve
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="group relative p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-[#EEF2FF] dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-[#1E2A5A] hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className="absolute inset-0 bg-blue-400 rounded-lg blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#F8FAFF]0 to-[#1E2A5A] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-transform duration-200">
                        <span className="text-sm font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                        {recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
