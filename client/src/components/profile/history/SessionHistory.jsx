// client/src/components/profile/history/SessionHistory.jsx
import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [page, sortBy, order]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile/sessions', {
        params: { page, limit: 10, search, sortBy, order }
      });
      setSessions(response.data.sessions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load session history');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchSessions();
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-[#1E2A5A]';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-700';
    if (score >= 70) return 'bg-[#EEF2FF] text-[#2A3A7A]';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading && sessions.length === 0) {
    return <div className="text-center py-8">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="flex space-x-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search in transcripts..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A]"
              >
                Search
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="createdAt">Date</option>
              <option value="overallScore">Score</option>
              <option value="duration">Duration</option>
            </select>
            <button
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {order === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-6xl mb-4">📜</div>
          <p className="text-gray-600 dark:text-gray-400">No practice sessions found</p>
          <p className="text-sm text-gray-500 mt-2">Start practicing to see your history!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div
              key={session._id}
              onClick={() => setSelectedSession(session)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                {/* Session Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`text-2xl font-bold ${getScoreColor(session.overallScore)}`}>
                      {session.overallScore}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreBadge(session.overallScore)}`}>
                      Score
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(session.createdAt), 'MMM dd, yyyy - HH:mm')}
                    </span>
                  </div>

                  {/* Transcript Preview */}
                  <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                    "{session.transcript}"
                  </p>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-2">
                    {session.metrics && Object.entries(session.metrics).map(([key, value]) => (
                      value && (
                        <span key={key} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {key}: {value}
                        </span>
                      )
                    ))}
                    {session.pace?.wordsPerMinute && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {session.pace.wordsPerMinute} WPM
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};

const SessionDetailModal = ({ session, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Session Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Score and Date */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-[#1E2A5A]">{session.overallScore}</div>
              <div className="text-sm text-gray-500">Overall Score</div>
            </div>
            <div className="text-right text-sm text-gray-500">
              {format(new Date(session.createdAt), 'MMMM dd, yyyy')}
              <br />
              {format(new Date(session.createdAt), 'HH:mm:ss')}
            </div>
          </div>

          {/* Transcript */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Transcript</h4>
            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              "{session.transcript}"
            </p>
          </div>

          {/* Metrics */}
          {session.metrics && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(session.metrics).map(([key, value]) => (
                  value && (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-[#1E2A5A]">{value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Pace */}
          {session.pace && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Speaking Pace</h4>
              <div className="flex items-center space-x-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-[#1E2A5A]">{session.pace.wordsPerMinute}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Words/Min</div>
                </div>
                <div className={`px-3 py-1 rounded-lg ${
                  session.pace.status === 'Good' ? 'bg-green-100 text-green-700' :
                  session.pace.status === 'Too Fast' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {session.pace.status}
                </div>
              </div>
            </div>
          )}

          {/* Strengths */}
          {session.strengths && session.strengths.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Strengths 💪</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {session.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {session.areasForImprovement && session.areasForImprovement.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Areas for Improvement 📈</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {session.areasForImprovement.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {session.recommendations && session.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommendations 💡</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {session.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionHistory;
