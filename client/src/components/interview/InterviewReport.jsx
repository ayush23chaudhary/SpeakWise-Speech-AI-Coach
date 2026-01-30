import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Download,
  Share2,
  ArrowLeft,
  Target,
  BookOpen,
  Lightbulb,
  Zap,
  Brain,
  Clock,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import api from '../../utils/api';

const InterviewReport = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  // Poll for report if it's being generated
  useEffect(() => {
    if (generating && pollCount < 30) {
      const pollTimer = setTimeout(() => {
        console.log('⏳ Polling for report... Attempt:', pollCount + 1);
        fetchReport();
        setPollCount(prev => prev + 1);
      }, 2000); // Poll every 2 seconds
      
      return () => clearTimeout(pollTimer);
    } else if (pollCount >= 30 && generating) {
      setError('Report generation is taking longer than expected. Please refresh the page.');
      setGenerating(false);
    }
  }, [generating, pollCount]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/interview/session/${sessionId}/report`);
      
      if (response.data.generating) {
        // Report is still being generated
        console.log('📊 Report is being generated...');
        setGenerating(true);
        setSession(response.data.session);
        setLoading(false);
      } else {
        // Report is ready
        console.log('✅ Report loaded successfully');
        setSession(response.data.session);
        setReport(response.data.report);
        setGenerating(false);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.message || 'Failed to load interview report. Please try again.');
      setLoading(false);
      setGenerating(false);
    }
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getRecommendationColor = (recommendation) => {
    const colors = {
      'strong_yes': 'bg-green-100 text-green-800 border-green-300',
      'yes': 'bg-[#EEF2FF] text-blue-800 border-blue-300',
      'maybe': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'no': 'bg-orange-100 text-orange-800 border-orange-300',
      'strong_no': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[recommendation] || colors.maybe;
  };

  const getRecommendationText = (recommendation) => {
    const text = {
      'strong_yes': 'Strong Yes - Ready to Hire',
      'yes': 'Yes - Good Candidate',
      'maybe': 'Maybe - Mixed Performance',
      'no': 'No - Below Expectations',
      'strong_no': 'Strong No - Not Qualified'
    };
    return text[recommendation] || 'Pending Review';
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 75) return 'text-[#1E2A5A]';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 45) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Report link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#EEF2FF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1E2A5A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your interview report...</p>
        </div>
      </div>
    );
  }

  // Show generating state while AI creates comprehensive report
  if (generating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#EEF2FF] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1E2A5A] mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Generating Your Report</h2>
          <p className="text-gray-600 mb-4">
            Our AI is analyzing your complete interview performance and creating a comprehensive report with actionable feedback...
          </p>
          <div className="bg-[#F8FAFF] rounded-lg p-4 text-left text-sm text-gray-700">
            <p className="mb-2">✨ Analyzing all {session?.totalQuestions || 'your'} answers</p>
            <p className="mb-2">📊 Evaluating content quality and delivery</p>
            <p className="mb-2">💡 Creating "Say This Instead" suggestions</p>
            <p>🎯 Preparing actionable improvement plan</p>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            This usually takes 10-20 seconds ({pollCount * 2}s elapsed)
          </p>
        </div>
      </div>
    );
  }

  if (error || !session || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#EEF2FF] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Not Available</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to load your interview report.'}</p>
          <button
            onClick={() => navigate('/dashboard/interview/history')}
            className="px-6 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A] transition-colors"
          >
            View All Interviews
          </button>
        </div>
      </div>
    );
  }

  const overallScore = session.overallPerformance?.overallScore || session.overallPerformance?.averageScore || 0;
  
  // Calculate speech and content scores from questions
  const calculateScores = () => {
    const answeredQuestions = session.questions.filter(q => q.answered && q.userAnswer);
    
    if (answeredQuestions.length === 0) {
      return { speechScore: 0, contentScore: 0 };
    }
    
    let totalSpeech = 0;
    let totalContent = 0;
    
    answeredQuestions.forEach(q => {
      if (q.userAnswer.speechAnalysis) {
        const speech = (
          (q.userAnswer.speechAnalysis.confidenceScore || 0) +
          (q.userAnswer.speechAnalysis.clarityScore || 0) +
          (q.userAnswer.speechAnalysis.pacingScore || 0) +
          (q.userAnswer.speechAnalysis.energyLevel || 0)
        ) / 4;
        totalSpeech += speech;
      }
      
      if (q.userAnswer.contentAnalysis) {
        const content = (
          (q.userAnswer.contentAnalysis.relevanceScore || 0) +
          (q.userAnswer.contentAnalysis.depthScore || 0) +
          (q.userAnswer.contentAnalysis.structureScore || 0)
        ) / 3;
        totalContent += content;
      }
    });
    
    return {
      speechScore: Math.round(totalSpeech / answeredQuestions.length),
      contentScore: Math.round(totalContent / answeredQuestions.length)
    };
  };
  
  const { speechScore, contentScore } = calculateScores();

  // Convert string-based strengths/weaknesses to array format if needed
  const getStrengthsArray = () => {
    if (report.keyStrengths && Array.isArray(report.keyStrengths)) {
      return report.keyStrengths;
    }
    if (report.strengthsAnalysis && typeof report.strengthsAnalysis === 'string') {
      return report.strengthsAnalysis
        .split('\n')
        .filter(s => s.trim().startsWith('•'))
        .map(s => s.replace(/^•\s*/, '').trim());
    }
    return [];
  };

  const getWeaknessesArray = () => {
    if (report.areasForImprovement && Array.isArray(report.areasForImprovement)) {
      return report.areasForImprovement;
    }
    if (report.weaknessesAnalysis && typeof report.weaknessesAnalysis === 'string') {
      return report.weaknessesAnalysis
        .split('\n')
        .filter(s => s.trim().startsWith('•'))
        .map(s => s.replace(/^•\s*/, '').trim());
    }
    return [];
  };

  const strengths = getStrengthsArray();
  const weaknesses = getWeaknessesArray();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#EEF2FF] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard/interview/history')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to History
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Interview Performance Report</h1>
            <p className="text-gray-600">
              {session.jobTitle} at {session.company || 'Company'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(session.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Overall Score */}
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className={`text-6xl font-bold ${getScoreColor(overallScore)} mb-2`}>
                {overallScore.toFixed(0)}
              </div>
              <p className="text-gray-600 font-medium mb-1">Overall Score</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    overallScore >= 80 ? 'bg-green-600' : 
                    overallScore >= 60 ? 'bg-[#1E2A5A]' : 
                    'bg-amber-500'
                  }`}
                  style={{ width: `${overallScore}%` }}
                ></div>
              </div>
            </div>

            {/* Speech Score */}
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageSquare className="w-6 h-6 text-gray-600" />
                <div className="text-4xl font-bold text-gray-800">
                  {speechScore}
                </div>
              </div>
              <p className="text-gray-600 font-medium mb-1">Speech Delivery</p>
              <p className="text-xs text-gray-500 mb-2">Confidence, Clarity, Pacing</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gray-700 transition-all duration-500"
                  style={{ width: `${speechScore}%` }}
                ></div>
              </div>
            </div>

            {/* Content Score */}
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brain className="w-6 h-6 text-gray-600" />
                <div className="text-4xl font-bold text-gray-800">
                  {contentScore}
                </div>
              </div>
              <p className="text-gray-600 font-medium mb-1">Content Quality</p>
              <p className="text-xs text-gray-500 mb-2">Relevance, Depth, Structure</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gray-700 transition-all duration-500"
                  style={{ width: `${contentScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Hiring Recommendation */}
          <div className="flex justify-center">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 ${getRecommendationColor(session.overallPerformance?.hiringRecommendation)}`}>
              <Award className="w-5 h-5" />
              <span className="font-semibold text-lg">
                {getRecommendationText(session.overallPerformance?.hiringRecommendation)}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary - Personal and Professional */}
        {report.executiveSummary && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6 text-gray-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Summary of Your Performance</h2>
                <div className="bg-gray-50 rounded-lg p-4 leading-relaxed">
                  <p className="text-gray-700 whitespace-pre-line">{report.executiveSummary}</p>
                </div>
                <div className="mt-4 p-3 bg-[#F8FAFF] rounded-lg border-l-4 border-[#1E2A5A]">
                  <p className="text-sm text-gray-700">
                    <strong>My assessment:</strong>{' '}
                    {overallScore >= 80 ? "You demonstrated strong capabilities. With this level of preparation, you're ready for your target interviews." : 
                     overallScore >= 60 ? "You showed solid fundamentals. Focus on the specific areas below, and you'll see significant improvement in your next practice session." :
                     "I see potential, but let's work on building stronger foundations. The action plan below is designed specifically for your current skill level."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses - Professional and Personal */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">What Worked Well</h2>
              </div>
              <div className="space-y-3">
                {strengths.slice(0, 5).map((strength, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 text-sm flex-1">{strength}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-700">
                  <strong>Keep doing this:</strong> These strengths set you apart. In your next interview, emphasize these points early to establish credibility.
                </p>
              </div>
            </div>
          )}

          {/* Areas for Improvement */}
          {weaknesses.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-500">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-semibold text-gray-800">Areas to Develop</h2>
              </div>
              <div className="space-y-3">
                {weaknesses.slice(0, 5).map((area, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-white">{index + 1}</span>
                      </div>
                      <span className="text-gray-700 text-sm flex-1">{area}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-gray-700">
                  <strong>Start here:</strong> I recommend prioritizing the first item on this list. It will have the most immediate impact on your performance.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Plan - Personal with Examples */}
        {report.actionableSteps && report.actionableSteps.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-gray-700" />
              <h2 className="text-2xl font-semibold text-gray-800">Your Personalized Action Plan</h2>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 mb-6">Based on your performance, I've created a specific roadmap for you. Each step includes an example to make it actionable.</p>
              
              <div className="space-y-4">
                {report.actionableSteps.slice(0, 4).map((step, index) => {
                  const timeframes = ['This Week', 'Next 2 Weeks', 'This Month', 'Ongoing'];
                  const icons = [Clock, Target, BookOpen, BarChart3];
                  const Icon = icons[index] || Target;
                  
                  // Extract priority and clean text
                  const cleanStep = step.replace(/^(\d+\.\s*)?(IMMEDIATE|SHORT-TERM|MID-TERM|ONGOING):\s*/i, '');
                  
                  // Try to extract example if present in format "...e.g., 'example'"
                  const exampleMatch = cleanStep.match(/e\.g\.,\s*['"](.*?)['"]/);
                  const mainText = exampleMatch ? cleanStep.split(/e\.g\.,/)[0].trim() : cleanStep;
                  const example = exampleMatch ? exampleMatch[1] : null;
                  
                  return (
                    <div key={index} className="border-l-4 border-gray-300 pl-4 hover:border-[#1E2A5A] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg mt-1">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              {timeframes[index]}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">Step {index + 1}</span>
                          </div>
                          <p className="text-gray-800 font-medium mb-2 leading-relaxed">
                            {mainText}
                          </p>
                          {example && (
                            <div className="bg-[#F8FAFF] rounded-lg p-3 mt-2 border-l-2 border-blue-400">
                              <p className="text-xs text-gray-600 mb-1 font-semibold">Example:</p>
                              <p className="text-sm text-gray-700 italic">"{example}"</p>
                            </div>
                          )}
                          {!example && index === 0 && (
                            <div className="bg-[#F8FAFF] rounded-lg p-3 mt-2 border-l-2 border-blue-400">
                              <p className="text-xs text-gray-600 mb-1 font-semibold">How to do this:</p>
                              <p className="text-sm text-gray-700">Set aside 30 minutes today. Focus on one specific area from your weaknesses. Practice answering related questions out loud and record yourself.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>My advice:</strong> Don't try to do everything at once. Master Step 1 this week, then move to Step 2. Small, consistent progress beats overwhelming yourself.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Question-by-Question Breakdown */}
        {session.questions && session.questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Question Analysis</h2>
            <div className="space-y-4">
              {session.questions.map((q, index) => {
                const questionScore = q.userAnswer?.overallScore || 0;
                const speechAnalysis = q.userAnswer?.speechAnalysis || {};
                const contentAnalysis = q.userAnswer?.contentAnalysis || {};
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleQuestion(index)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-semibold text-white text-lg shadow-sm ${
                          questionScore >= 80 ? 'bg-green-600' :
                          questionScore >= 60 ? 'bg-[#1E2A5A]' :
                          questionScore >= 40 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`}>
                          {questionScore.toFixed(0)}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800 flex items-center gap-2">
                            Question {index + 1}
                            {questionScore >= 80 && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                            {questionScore < 60 && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                          </p>
                          <p className="text-sm text-gray-500">{q.category}</p>
                        </div>
                      </div>
                      {expandedQuestions[index] ? 
                        <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                    
                    {expandedQuestions[index] && (
                      <div className="px-6 py-4 space-y-4 bg-white">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Question</p>
                          <p className="text-gray-700 bg-[#F8FAFF] p-3 rounded-lg">{q.question}</p>
                        </div>
                        
                        {q.userAnswer?.transcript && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Response</p>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed italic">"{q.userAnswer.transcript}"</p>
                          </div>
                        )}
                        
                        {/* Metrics with Progress Bars */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <MessageSquare className="w-4 h-4 text-gray-600" />
                              <p className="text-sm font-semibold text-gray-700">Speech Delivery</p>
                            </div>
                            <div className="space-y-2.5">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-600">Confidence</span>
                                  <span className="font-medium text-gray-700">{speechAnalysis.confidenceScore || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-gray-700 transition-all"
                                    style={{ width: `${speechAnalysis.confidenceScore || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-600">Clarity</span>
                                  <span className="font-medium text-gray-700">{speechAnalysis.clarityScore || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-gray-700 transition-all"
                                    style={{ width: `${speechAnalysis.clarityScore || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-600">Pacing</span>
                                  <span className="font-medium text-gray-700">{speechAnalysis.pacingScore || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-gray-700 transition-all"
                                    style={{ width: `${speechAnalysis.pacingScore || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <Brain className="w-4 h-4 text-gray-600" />
                              <p className="text-sm font-semibold text-gray-700">Content Quality</p>
                            </div>
                            <div className="space-y-2.5">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-600">Relevance</span>
                                  <span className="font-medium text-gray-700">{contentAnalysis.relevanceScore || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-gray-700 transition-all"
                                    style={{ width: `${contentAnalysis.relevanceScore || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-600">Depth</span>
                                  <span className="font-medium text-gray-700">{contentAnalysis.depthScore || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-gray-700 transition-all"
                                    style={{ width: `${contentAnalysis.depthScore || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-600">Structure</span>
                                  <span className="font-medium text-gray-700">{contentAnalysis.structureScore || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="h-1.5 rounded-full bg-gray-700 transition-all"
                                    style={{ width: `${contentAnalysis.structureScore || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {q.userAnswer?.feedback && (
                          <div className="bg-[#F8FAFF] rounded-lg p-4 border-l-2 border-blue-500">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">My Feedback</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{q.userAnswer.feedback}</p>
                          </div>
                        )}
                        
                        {q.userAnswer?.improvementTips && q.userAnswer.improvementTips.length > 0 && (
                          <div className="bg-amber-50 rounded-lg p-4 border-l-2 border-amber-500">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">How to Improve</p>
                            <ul className="space-y-1.5">
                              {q.userAnswer.improvementTips.map((tip, i) => (
                                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-amber-600 mt-0.5">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resources & Practice Areas - Clean and Professional */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {report.recommendedResources && report.recommendedResources.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-800">Recommended Resources</h2>
              </div>
              <div className="space-y-2">
                {report.recommendedResources.slice(0, 5).map((resource, index) => {
                  const cleanResource = resource.replace(/^(Book|Course|Practice|Tool|Website):\s*/i, '');
                  
                  return (
                    <div 
                      key={index} 
                      className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors border border-gray-100"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium text-sm mt-0.5">{index + 1}.</span>
                        <span className="text-gray-700 text-sm flex-1 leading-relaxed">
                          {cleanResource}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-[#F8FAFF] rounded-lg">
                <p className="text-xs text-gray-700">
                  <strong>Where to start:</strong> I recommend beginning with resource #1, as it directly addresses your primary development area.
                </p>
              </div>
            </div>
          )}
          
          {report.practiceAreas && report.practiceAreas.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-800">Focus Areas for Practice</h2>
              </div>
              <div className="space-y-2">
                {report.practiceAreas.slice(0, 5).map((area, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-gray-700">{index + 1}</span>
                      </div>
                      <span className="text-gray-700 text-sm flex-1 leading-relaxed">
                        {area.replace(/^•\s*/, '')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-gray-700">
                  <strong>Daily practice tip:</strong> Dedicate 20 minutes each day to one specific area. Consistency beats intensity.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Link
            to="/dashboard/interview"
            className="px-8 py-3 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A] transition-colors font-medium"
          >
            Start New Interview
          </Link>
          <Link
            to="/dashboard/interview/history"
            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            View All Interviews
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewReport;
