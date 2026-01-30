import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Briefcase, 
  TrendingUp, 
  Filter,
  Search,
  Trash2,
  Eye,
  Award,
  ChevronDown,
  PlusCircle,
  ArrowLeft
} from 'lucide-react';
import api from '../../utils/api';

const InterviewHistory = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    completed: 0
  });

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    filterAndSortInterviews();
  }, [interviews, searchTerm, filterType, sortBy]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/interview/history');
      const sessions = response.data.sessions || [];
      setInterviews(sessions);
      calculateStats(sessions);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sessions) => {
    const completed = sessions.filter(s => s.status === 'completed');
    const avgScore = completed.length > 0
      ? completed.reduce((sum, s) => sum + (s.overallPerformance?.averageScore || 0), 0) / completed.length
      : 0;
    
    setStats({
      total: sessions.length,
      avgScore: avgScore.toFixed(1),
      completed: completed.length
    });
  };

  const filterAndSortInterviews = () => {
    let filtered = [...interviews];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(interview => 
        interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (interview.company && interview.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(interview => interview.interviewType === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'score_desc':
          return (b.overallPerformance?.averageScore || 0) - (a.overallPerformance?.averageScore || 0);
        case 'score_asc':
          return (a.overallPerformance?.averageScore || 0) - (b.overallPerformance?.averageScore || 0);
        default:
          return 0;
      }
    });

    setFilteredInterviews(filtered);
  };

  const handleDelete = async (sessionId) => {
    // Validate sessionId before attempting delete
    if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
      console.error('❌ Invalid sessionId for delete:', sessionId);
      alert('Cannot delete: Invalid session ID. Please refresh the page and try again.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this interview session?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting session:', sessionId);
      await api.delete(`/interview/session/${sessionId}`);
      setInterviews(prev => prev.filter(i => i._id !== sessionId));
    } catch (error) {
      console.error('Error deleting interview:', error);
      alert('Failed to delete interview. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-[#EEF2FF] text-blue-800',
      'generating': 'bg-yellow-100 text-yellow-800',
      'paused': 'bg-orange-100 text-orange-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-[#1E2A5A] bg-[#F8FAFF]';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 45) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const formatInterviewType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#EEF2FF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1E2A5A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your interview history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#EEF2FF] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800">Interview History</h1>
            <button
              onClick={() => navigate('/dashboard/interview')}
              className="flex items-center gap-2 px-4 py-2 bg-[#1FB6A6] hover:bg-primary-700 text-white rounded-lg transition-colors shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Interview</span>
            </button>
          </div>
          <p className="text-gray-600">Track your progress and review past interviews</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FileText className="w-12 h-12 text-[#1FB6A6] opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Average Score</p>
                <p className="text-3xl font-bold text-gray-800">{stats.avgScore}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
              </div>
              <Award className="w-12 h-12 text-[#EEF2FF]0 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Types</option>
                <option value="technical_coding">Technical Coding</option>
                <option value="technical_system_design">System Design</option>
                <option value="behavioral">Behavioral</option>
                <option value="product_management">Product Management</option>
                <option value="data_science">Data Science</option>
                <option value="sales">Sales</option>
                <option value="mixed">Mixed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="score_desc">Highest Score</option>
                <option value="score_asc">Lowest Score</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Interview List */}
        {filteredInterviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Interviews Found</h3>
            <p className="text-gray-600 mb-6">
              {interviews.length === 0 
                ? "Start your first AI interview to begin practicing!" 
                : "Try adjusting your filters or search terms."}
            </p>
            <Link
              to="/dashboard/interview"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A] transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Start New Interview
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredInterviews.map((interview) => (
              <div key={interview._id || interview.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{interview.jobTitle}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(interview.status)}`}>
                          {interview.status.replace('_', ' ')}
                        </span>
                      </div>
                      {interview.company && (
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Briefcase className="w-4 h-4" />
                          <span>{interview.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span>•</span>
                        <span>{formatInterviewType(interview.interviewType)}</span>
                        <span>•</span>
                        <span>{interview.questions?.length || 0} questions</span>
                      </div>
                    </div>

                    {interview.status === 'completed' && (
                      <div className={`ml-4 w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl ${getScoreColor(
                        interview.overallScore || 
                        interview.overallPerformance?.overallScore || 
                        interview.overallPerformance?.averageScore || 
                        0
                      )}`}>
                        {(interview.overallScore || 
                          interview.overallPerformance?.overallScore || 
                          interview.overallPerformance?.averageScore || 
                          0).toFixed(0)}
                      </div>
                    )}
                  </div>

                  {/* Metrics Bar */}
                  {interview.status === 'completed' && (
                    <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Speech</p>
                        <p className="text-lg font-bold text-[#6C63FF]">
                          {(interview.overallPerformance?.averageSpeechScore || 0).toFixed(0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Content</p>
                        <p className="text-lg font-bold text-[#1E2A5A]">
                          {(interview.overallPerformance?.averageContentScore || 0).toFixed(0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Answered</p>
                        <p className="text-lg font-bold text-[#1E2A5A]">
                          {interview.answeredQuestions || 0}/{interview.totalQuestions || interview.questions?.length || 0}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {interview.status === 'completed' ? (
                      <Link
                        to={`/dashboard/interview/${interview._id}/report`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Report
                      </Link>
                    ) : interview.status === 'in_progress' || interview.status === 'paused' ? (
                      <Link
                        to={`/dashboard/interview/${interview._id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Continue Interview
                      </Link>
                    ) : (
                      <Link
                        to={`/dashboard/interview/${interview._id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        if (interview._id) {
                          handleDelete(interview._id);
                        } else {
                          console.error('❌ Interview missing _id:', interview);
                          alert('Cannot delete: Interview ID is missing. Please refresh the page.');
                        }
                      }}
                      disabled={!interview._id}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        interview._id 
                          ? 'border-red-300 text-red-600 hover:bg-red-50' 
                          : 'border-gray-300 text-gray-400 cursor-not-allowed'
                      }`}
                      title={interview._id ? 'Delete interview' : 'Invalid interview ID'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Start New Interview Button */}
        <div className="mt-8 text-center">
          <Link
            to="/dashboard/interview"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A] transition-colors font-medium"
          >
            <PlusCircle className="w-5 h-5" />
            Start New Interview
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewHistory;
