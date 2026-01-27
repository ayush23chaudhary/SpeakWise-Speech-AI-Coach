import React, { useState } from 'react';
import { Target, Zap, MessageCircle, Shield, Clock, HelpCircle, User, TrendingUp } from 'lucide-react';
import api from '../../utils/api';

const OnboardingFlow = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [userPurpose, setUserPurpose] = useState('');
  const [stressTrigger, setStressTrigger] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async () => {
    if (!userPurpose || !stressTrigger) {
      setError('Please select an option');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/onboarding/complete', {
        user_purpose: userPurpose,
        stress_trigger: stressTrigger
      });

      console.log('✅ Onboarding completed');
      onComplete();
    } catch (err) {
      console.error('❌ Onboarding error:', err);
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!userPurpose) {
      setError('Please select an option');
      return;
    }
    setError(null);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-primary-600 rounded-full mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Let's Personalize Your Experience
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Help us understand your speaking goals so we can provide targeted feedback
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Purpose Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Where do you struggle most when you have to speak?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Select the scenario that best describes your main challenge
              </p>

              <div className="space-y-3">
                {purposeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setUserPurpose(option.value);
                        setError(null);
                      }}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        userPurpose === option.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 p-2 rounded-lg ${
                          userPurpose === option.value
                            ? 'bg-primary-600 text-white'
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

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="mt-6 flex justify-between items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  💡 You can change this later in settings
                </p>
                <button
                  onClick={handleNext}
                  disabled={!userPurpose}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Stress Trigger Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                When does this affect you the most?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Understanding your stress trigger helps us provide better real-time guidance
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {triggerOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStressTrigger(option.value);
                        setError(null);
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        stressTrigger === option.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 p-2 rounded-lg ${
                          stressTrigger === option.value
                            ? 'bg-primary-600 text-white'
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

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!stressTrigger || loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    'Complete Setup'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🔒 Your responses help personalize feedback—no demographic data collected
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
