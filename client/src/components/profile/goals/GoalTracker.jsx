// client/src/components/profile/goals/GoalTracker.jsx
import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';

const GoalTracker = () => {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'sessions',
    targetValue: 10,
    targetDate: '',
    targetSkill: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data.goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    try {
      // Prepare goal data, exclude targetSkill if empty
      const goalData = { ...newGoal };
      if (!goalData.targetSkill || goalData.targetSkill.trim() === '') {
        delete goalData.targetSkill;
      }
      
      await api.post('/goals', goalData);
      toast.success('Goal created successfully!');
      setShowModal(false);
      setNewGoal({
        title: '',
        description: '',
        type: 'sessions',
        targetValue: 10,
        targetDate: '',
        targetSkill: '',
        priority: 'medium'
      });
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    }
  };

  const deleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await api.delete(`/goals/${goalId}`);
      toast.success('Goal deleted');
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const getGoalIcon = (type) => {
    const icons = {
      sessions: '📊',
      score: '⭐',
      streak: '🔥',
      skill_improvement: '📈',
      time_practiced: '⏱️',
      custom: '🎯'
    };
    return icons[type] || '🎯';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-[#EEF2FF] text-[#2A3A7A] dark:bg-blue-900 dark:text-blue-300',
      high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return <div className="text-center py-8">Loading goals...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Goals</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {activeGoals.length} active, {completedGoals.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A] transition-colors"
        >
          + New Goal
        </button>
      </div>

      {/* Active Goals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Goals</h3>
        {activeGoals.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-600 dark:text-gray-400">No active goals yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A]"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeGoals.map(goal => (
              <GoalCard key={goal._id} goal={goal} onDelete={deleteGoal} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Completed Goals ({completedGoals.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedGoals.map(goal => (
              <GoalCard key={goal._id} goal={goal} onDelete={deleteGoal} />
            ))}
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Goal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Complete 20 sessions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="sessions">Sessions</option>
                    <option value="score">Score</option>
                    <option value="streak">Streak</option>
                    <option value="skill_improvement">Skill Improvement</option>
                    <option value="time_practiced">Time Practiced</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Show Target Skill field only for skill_improvement type */}
              {newGoal.type === 'skill_improvement' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Skill
                  </label>
                  <select
                    value={newGoal.targetSkill}
                    onChange={(e) => setNewGoal({ ...newGoal, targetSkill: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a skill</option>
                    <option value="pronunciation">Pronunciation</option>
                    <option value="fluency">Fluency</option>
                    <option value="clarity">Clarity</option>
                    <option value="confidence">Confidence</option>
                    <option value="pace">Pace</option>
                    <option value="overall">Overall</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={createGoal}
                disabled={!newGoal.title || !newGoal.targetDate}
                className="flex-1 px-4 py-2 bg-[#1E2A5A] text-white rounded-lg hover:bg-[#2A3A7A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GoalCard = ({ goal, onDelete }) => {
  const progress = Math.round((goal.currentValue / goal.targetValue) * 100);
  const isCompleted = goal.status === 'completed';
  const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  const getGoalIcon = (type) => {
    const icons = {
      sessions: '📊',
      score: '⭐',
      streak: '🔥',
      skill_improvement: '📈',
      time_practiced: '⏱️',
      custom: '🎯'
    };
    return icons[type] || '🎯';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-[#EEF2FF] text-[#2A3A7A] dark:bg-blue-900 dark:text-blue-300',
      high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${isCompleted ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{getGoalIcon(goal.type)}</div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h4>
            {goal.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(goal._id)}
          className="text-gray-400 hover:text-red-500"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>{goal.currentValue} / {goal.targetValue}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              isCompleted ? 'bg-green-500' : 'bg-[#1E2A5A]'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <span className={`px-2 py-1 rounded ${getPriorityColor(goal.priority)}`}>
          {goal.priority}
        </span>
        {isCompleted ? (
          <span className="text-green-600 dark:text-green-400 font-medium">
            ✓ Completed
          </span>
        ) : (
          <span className="text-gray-600 dark:text-gray-400">
            {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
          </span>
        )}
      </div>
    </div>
  );
};

export default GoalTracker;
