import React, { useState, useEffect } from 'react';
import { Target, Zap, MessageCircle, Shield, Clock, HelpCircle, User, TrendingUp, Save, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { toast } from 'react-hot-toast';

const OnboardingSettings = () => {
  const { user, updateUser } = useAuthStore();
  const [userPurpose, setUserPurpose] = useState('');
  const [stressTrigger, setStressTrigger] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const purposeOptions = [
    {
      value: 'interviews_evaluations',
      label: 'I struggle in interviews or formal evaluations',
      icon: User,
      description: 'Job interviews, performance reviews, formal assessments'
    },
    {
      value: 'presentations_pitches',
      label: 'I need to sound convincing while presenting or pitching',
      icon: TrendingUp,
      description: 'Business pitches, investor presentations, public speaking'
    },
    {
      value: 'everyday_conversations',
      label: 'I want to communicate clearly in everyday or professional conversations',
      icon: MessageCircle,
      description: 'Team meetings, client calls, social interactions'
    },
    {
      value: 'confidence_pressure',
      label: 'I know what to say, but I freeze or hesitate under pressure',
      icon: Shield,
      description: 'High-stakes moments, unexpected situations, performance anxiety'
    }
  ];

  const triggerOptions = [
    {
      value: 'first_30_seconds',
      label: 'First 30 seconds',
      icon: Clock,
      description: 'Getting started is the hardest part'
    },
    {
      value: 'unexpected_questions',
      label: 'Unexpected questions',
      icon: HelpCircle,
      description: 'When I\'m caught off guard'
    },
    {
      value: 'being_judged',
      label: 'When I\'m being judged',
      icon: Target,
      description: 'Feeling evaluated or scrutinized'
    },
    {
      value: 'continuous_speaking',
      label: 'During continuous speaking',
      icon: Zap,
      description: 'Maintaining flow over time'
    }
  ];

  useEffect(() => {
    const loadCurrentPreferences = async () => {
      setLoading(true);
      try {
        const response = await api.get('/onboarding/status');
        const { user_purpose, stress_trigger } = response.data;
        
        setUserPurpose(user_purpose || '');
        setStressTrigger(stress_trigger || '');
      } catch (error) {
        console.error('Failed to load preferences:', error);
        // Fallback to user object
        if (user?.onboarding) {
          setUserPurpose(user.onboarding.user_purpose || '');
          setStressTrigger(user.onboarding.stress_trigger || '');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCurrentPreferences();
  }, [user]);

  const handleSave = async () => {
    if (!userPurpose || !stressTrigger) {
      toast.error('Please select both options');
      return;
    }

    setSaving(true);
    try {
      await api.put('/onboarding/update', {
        user_purpose: userPurpose,
        stress_trigger: stressTrigger
      });

      // Refresh user data
      const userResponse = await api.get('/auth/me');
      updateUser(userResponse.data.user);

      toast.success('✅ Communication preferences updated!');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1FB6A6]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Target className="w-6 h-6 text-[#1FB6A6]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Communication Preferences
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              SpeakWise personalizes feedback based on your speaking challenges. Update these preferences to refine your coaching experience.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Challenge */}
      <div className="card">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Where do you struggle most when you have to speak?
        </h4>

        <div className="space-y-3">
          {purposeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setUserPurpose(option.value)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  userPurpose === option.value
                    ? 'border-[#1FB6A6] bg-[#F8FAFF] dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    userPurpose === option.value
                      ? 'bg-[#1FB6A6] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${
                      userPurpose === option.value
                        ? 'text-primary-900 dark:text-primary-100'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stress Trigger */}
      <div className="card">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          When does this affect you the most?
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {triggerOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setStressTrigger(option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  stressTrigger === option.value
                    ? 'border-[#1FB6A6] bg-[#F8FAFF] dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    stressTrigger === option.value
                      ? 'bg-[#1FB6A6] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${
                      stressTrigger === option.value
                        ? 'text-primary-900 dark:text-primary-100'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="card">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Changes will apply to all future speech analyses
          </p>
          <button
            onClick={handleSave}
            disabled={saving || !userPurpose || !stressTrigger}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSettings;
