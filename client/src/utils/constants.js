// Constants for SpeakWise application

export const APP_CONFIG = {
  name: 'SpeakWise',
  version: '2.0.0',
  tagline: 'AI-Powered Evaluator Perception Coach',
  description: 'Simulate how human evaluators judge your communication under pressure',
  author: 'SpeakWise Team'
};

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me'
  },
  speech: {
    analyze: '/speech/analyze',
    history: '/speech/history',
    report: (id) => `/speech/report/${id}`
  }
};

export const RECORDING_CONFIG = {
  maxDuration: 300, // 5 minutes in seconds
  minDuration: 5, // 5 seconds minimum
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  defaultFormat: 'audio/webm'
};

// ====================================================
// EVALUATOR PERCEPTION FRAMEWORK
// SpeakWise simulates how human evaluators judge speech
// under high-stakes scenarios (interviews, pitches, vivas)
// ====================================================

export const EVALUATION_MODES = {
  INTERVIEW: {
    id: 'interview',
    label: 'Interview Answer',
    icon: 'Briefcase',
    description: 'Simulates interviewer perception under time pressure',
    riskFocus: 'Pauses & hesitation highly penalized',
    weights: {
      pauseRisk: 0.35,
      hesitationSeverity: 0.30,
      confidenceStability: 0.25,
      engagementRisk: 0.10
    },
    thresholds: {
      maxPauseDuration: 2.0, // seconds - HIGH risk after 2s
      maxFillerDensity: 0.03, // fillers per word
      minPitchVariation: 20, // Hz
      maxSpeakingRateSpike: 1.4 // multiplier from average
    },
    benchmarks: {
      maxTolerablePauses: 2,
      maxPauseDuration: 2.5,
      message: 'Most interviewers disengage after two long pauses'
    }
  },
  PRESENTATION: {
    id: 'presentation',
    label: 'Pitch / Presentation',
    icon: 'TrendingUp',
    description: 'Models investor/audience engagement tracking',
    riskFocus: 'Monotone delivery & low energy flagged',
    weights: {
      engagementRisk: 0.35,
      confidenceStability: 0.30,
      pauseRisk: 0.20,
      hesitationSeverity: 0.15
    },
    thresholds: {
      maxPauseDuration: 3.5,
      maxFillerDensity: 0.025,
      minPitchVariation: 40,
      maxSpeakingRateSpike: 1.3
    },
    benchmarks: {
      maxMonotoneDuration: 15,
      message: 'Investors lose interest without vocal energy variation'
    }
  },
  VIVA: {
    id: 'viva',
    label: 'Viva / Oral Exam',
    icon: 'GraduationCap',
    description: 'Evaluates academic/technical confidence signals',
    riskFocus: 'Confidence breaks & uncertainty patterns',
    weights: {
      confidenceStability: 0.40,
      hesitationSeverity: 0.30,
      pauseRisk: 0.20,
      engagementRisk: 0.10
    },
    thresholds: {
      maxPauseDuration: 3.0,
      maxFillerDensity: 0.04,
      minPitchVariation: 15,
      maxSpeakingRateSpike: 1.5
    },
    benchmarks: {
      maxFillerWords: 5,
      message: 'Examiners tolerate fewer than 5 filler words in a 2-minute response'
    }
  }
};

export const PERCEPTION_RISK_LEVELS = {
  HIGH_RISK: {
    threshold: 0,
    max: 60,
    label: '⚠️ High Risk',
    badge: 'High Risk',
    color: 'red',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    textColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-600'
  },
  MODERATE_RISK: {
    threshold: 60,
    max: 75,
    label: '⚠️ Moderate Risk',
    badge: 'Moderate Risk',
    color: 'yellow',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    borderColor: 'border-yellow-600'
  },
  STABLE: {
    threshold: 75,
    max: 100,
    label: '✅ Stable',
    badge: 'Stable',
    color: 'green',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    textColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-600'
  }
};

// Maps internal numeric scores to risk levels
export const getPerceptionRiskLevel = (score) => {
  if (score < 60) return PERCEPTION_RISK_LEVELS.HIGH_RISK;
  if (score < 75) return PERCEPTION_RISK_LEVELS.MODERATE_RISK;
  return PERCEPTION_RISK_LEVELS.STABLE;
};

// Legacy support for existing code during migration
export const ANALYSIS_METRICS = {
  overallScore: {
    min: 0,
    max: 100,
    thresholds: {
      excellent: 75, // Aligned with STABLE
      good: 60, // Aligned with MODERATE_RISK
      needsImprovement: 40
    }
  },
  individualMetrics: {
    clarity: { min: 0, max: 100 },
    confidence: { min: 0, max: 100 },
    fluency: { min: 0, max: 100 },
    pace: { min: 0, max: 100 },
    tone: { min: 0, max: 100 }
  },
  pace: {
    wordsPerMinute: {
      tooSlow: 120,
      good: { min: 140, max: 180 },
      tooFast: 200
    }
  }
};

export const FILLER_WORDS = [
  'um', 'uh', 'ah', 'er', 'like', 'you know', 'so', 'well', 'actually',
  'basically', 'literally', 'obviously', 'clearly', 'definitely',
  'probably', 'maybe', 'perhaps', 'sort of', 'kind of'
];

export const THEME_CONFIG = {
  light: {
    name: 'Light',
    class: 'light'
  },
  dark: {
    name: 'Dark',
    class: 'dark'
  }
};

export const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gray: '#6b7280'
};

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500
};

export const TOAST_DURATIONS = {
  short: 3000,
  normal: 5000,
  long: 8000
};

export const LOCAL_STORAGE_KEYS = {
  auth: 'auth-storage',
  theme: 'theme-storage',
  settings: 'speakwise-settings'
};

export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  unauthorized: 'Session expired. Please log in again.',
  forbidden: 'You do not have permission to perform this action.',
  notFound: 'The requested resource was not found.',
  serverError: 'Server error. Please try again later.',
  validation: 'Please check your input and try again.',
  microphone: 'Microphone access denied. Please allow microphone permissions.',
  audio: 'Audio recording failed. Please try again.',
  analysis: 'Analysis failed. Please try again.'
};

export const SUCCESS_MESSAGES = {
  login: 'Successfully logged in!',
  register: 'Account created successfully!',
  logout: 'Successfully logged out!',
  recording: 'Recording captured successfully!',
  analysis: 'Evaluator perception analysis complete!',
  settings: 'Settings saved successfully!'
};

// Critical Moment Types for Timeline Visualization
export const CRITICAL_MOMENT_TYPES = {
  CONFIDENCE_BREAK: {
    type: 'confidence_break',
    label: 'Confidence break',
    severity: 'high',
    color: 'red',
    icon: 'AlertTriangle'
  },
  TRUST_DROP: {
    type: 'listener_trust_drop',
    label: 'Listener trust drop',
    severity: 'critical',
    color: 'red',
    icon: 'TrendingDown'
  },
  ENGAGEMENT_LOSS: {
    type: 'engagement_loss',
    label: 'Engagement loss',
    severity: 'moderate',
    color: 'orange',
    icon: 'AlertCircle'
  },
  HESITATION_CLUSTER: {
    type: 'hesitation_cluster',
    label: 'Hesitation cluster',
    severity: 'high',
    color: 'yellow',
    icon: 'Pause'
  }
};

// UI Terminology Map (for migration reference)
export const PRODUCT_TERMINOLOGY = {
  // OLD → NEW
  'Speech Analysis': 'Evaluator Perception',
  'Analysis Dashboard': 'Evaluation Summary',
  'Overall Score': 'Evaluator Confidence Index',
  'Metrics': 'Perception Signals',
  'Performance': 'Evaluator Response',
  'History': 'Communication Trajectory',
  'Practice Hub': 'Scenario Training',
  'Confidence Score': 'Confidence Stability',
  'Improvements': 'Risk Reduction',
  'Strengths': 'Perception Advantages',
  'Weaknesses': 'Risk Factors'
};

export const RECORDING_TIPS = [
  'Find a quiet environment with minimal background noise',
  'Speak as if addressing your actual evaluator',
  'Maintain a consistent distance from your microphone',
  'Record 15-20 seconds for rapid feedback (optimized for efficiency)',
  'Practice 30-60 seconds for comprehensive evaluator perception analysis',
  'Take deep breaths and relax before recording',
  'Respond naturally without over-rehearsing',
  'Focus on evaluator engagement, not perfection',
  'Simulate the actual high-stakes scenario'
];

export const PERCEPTION_SIGNAL_RECOMMENDATIONS = {
  pauseRisk: [
    'Practice responding without extended silent pauses',
    'Use brief thinking pauses (under 2 seconds) strategically',
    'Rehearse transitions between ideas to reduce hesitation'
  ],
  hesitationSeverity: [
    'Replace filler words with intentional pauses',
    'Practice speaking with conviction on familiar topics',
    'Record yourself to identify and eliminate hesitation patterns'
  ],
  confidenceStability: [
    'Maintain consistent vocal energy throughout responses',
    'Practice speaking with authority on your subject matter',
    'Avoid apologetic or tentative language patterns'
  ],
  engagementRisk: [
    'Vary your vocal pitch to maintain listener attention',
    'Use appropriate emotional expression for your message',
    'Practice emphasizing key points with vocal energy'
  ]
};
