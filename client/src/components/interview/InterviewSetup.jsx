import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Building2, FileText, Target, TrendingUp, 
  Code, Users, BarChart3, ShoppingCart, Lightbulb, Database,
  ChevronRight, Sparkles, Clock, AlertCircle, History, Home
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    interviewType: '',
    jobTitle: '',
    company: '',
    jobDescription: '',
    experienceLevel: 'mid',
    numberOfQuestions: 5,
    difficulty: 'medium',
    includeFollowUps: true
  });

  const interviewTypes = [
    { 
      value: 'technical_coding', 
      label: 'Technical Coding', 
      icon: Code,
      description: 'Algorithms, data structures, problem-solving'
    },
    { 
      value: 'technical_system_design', 
      label: 'System Design', 
      icon: Database,
      description: 'Architecture, scalability, tradeoffs'
    },
    { 
      value: 'behavioral', 
      label: 'Behavioral', 
      icon: Users,
      description: 'Past experiences, teamwork, leadership'
    },
    { 
      value: 'product_management', 
      label: 'Product Management', 
      icon: Lightbulb,
      description: 'Strategy, prioritization, user focus'
    },
    { 
      value: 'data_science', 
      label: 'Data Science', 
      icon: BarChart3,
      description: 'ML, statistics, data pipelines'
    },
    { 
      value: 'sales', 
      label: 'Sales', 
      icon: ShoppingCart,
      description: 'Objection handling, pipeline management'
    },
    { 
      value: 'mixed', 
      label: 'Mixed Interview', 
      icon: Target,
      description: 'Combination of technical and behavioral'
    }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior (6-10 years)' },
    { value: 'lead', label: 'Lead (10+ years)' },
    { value: 'executive', label: 'Executive' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', description: 'Warm-up questions, basics' },
    { value: 'medium', label: 'Medium', description: 'Standard interview difficulty' },
    { value: 'hard', label: 'Hard', description: 'Challenging, deep dive questions' },
    { value: 'mixed', label: 'Mixed', description: 'Varied difficulty levels' }
  ];

  const handleCreateSession = async () => {
    // Validation
    if (!formData.interviewType) {
      toast.error('Please select an interview type');
      return;
    }
    if (!formData.jobTitle.trim()) {
      toast.error('Please enter a job title');
      return;
    }
    if (!formData.jobDescription.trim() || formData.jobDescription.length < 50) {
      toast.error('Please provide a detailed job description (minimum 50 characters)');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/interview/create', formData);
      
      toast.success('🎯 Generating your interview questions...');
      
      // Navigate to interview page
      navigate(`/dashboard/interview/${response.data.sessionId}`);
      
    } catch (error) {
      console.error('Error creating interview:', error);
      toast.error(error.response?.data?.message || 'Failed to create interview session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
              <Briefcase className="w-8 h-8 text-primary-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Interview Practice
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Realistic 1-on-1 interview with personalized questions and comprehensive analysis
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/interview/history')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">View History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
              step >= s 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-1 ${
                step > s ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Interview Type */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Select Interview Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviewTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setFormData({ ...formData, interviewType: type.value })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.interviewType === type.value
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      formData.interviewType === type.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {type.label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!formData.interviewType}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Job Details */}
      {step === 2 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Job Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              Job Title *
            </label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              placeholder="e.g., Senior Frontend Developer"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Company (optional)
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g., Google, Microsoft, or leave blank"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Job Description * (Paste the full job description)
            </label>
            <textarea
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              placeholder="Paste the complete job description here. Include required skills, responsibilities, and qualifications. The more detail, the better the questions!"
              rows={10}
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {formData.jobDescription.length} characters 
              {formData.jobDescription.length < 50 && ' (minimum 50 required)'}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(1)}
              className="btn-secondary"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!formData.jobTitle.trim() || formData.jobDescription.length < 50}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Interview Settings */}
      {step === 3 && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Interview Settings
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Experience Level
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setFormData({ ...formData, experienceLevel: level.value })}
                  className={`p-3 rounded-lg border-2 text-sm transition-all ${
                    formData.experienceLevel === level.value
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Difficulty Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {difficulties.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => setFormData({ ...formData, difficulty: diff.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.difficulty === diff.value
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {diff.label}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {diff.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Clock className="w-4 h-4 inline mr-2" />
              Number of Questions
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.numberOfQuestions}
                onChange={(e) => setFormData({ ...formData, numberOfQuestions: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-2xl font-bold text-primary-600 w-16 text-center">
                {formData.numberOfQuestions}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Estimated time: {formData.numberOfQuestions * 3}-{formData.numberOfQuestions * 5} minutes
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  AI-Powered Analysis
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Each answer will be analyzed for both <strong>content quality</strong> (relevance, depth, structure) 
                  and <strong>speech delivery</strong> (confidence, clarity, pacing). You'll receive instant feedback 
                  plus a comprehensive final report.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(2)}
              className="btn-secondary"
            >
              Back
            </button>
            <button
              onClick={handleCreateSession}
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Creating Interview...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start AI Interview
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSetup;
