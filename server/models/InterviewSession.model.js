const mongoose = require('mongoose');

const InterviewQuestionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'behavioral', 'situational', 'company_specific', 'role_specific'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  expectedKeyPoints: [String], // AI-generated key points to look for in answer
  timeLimit: {
    type: Number,
    default: 180 // 3 minutes default
  },
  // User's response
  userAnswer: {
    audioUrl: String,
    transcript: String,
    duration: Number,
    recordedAt: Date,
    
    // Speech Analysis
    speechAnalysis: {
      confidenceScore: Number,
      clarityScore: Number,
      pacingScore: Number,
      fillerWordsCount: Number,
      hesitations: Number,
      energyLevel: Number,
      professionalismScore: Number
    },
    
    // Content Analysis
    contentAnalysis: {
      relevanceScore: Number, // How relevant to the question
      depthScore: Number, // How deep/detailed the answer
      structureScore: Number, // STAR method, logical flow
      keyPointsCovered: [String], // Which expected points were mentioned
      missingPoints: [String], // What they should have mentioned
      strengths: [String],
      weaknesses: [String],
      technicalAccuracy: Number // For technical questions
    },
    
    // Combined Feedback
    overallScore: Number,
    feedback: String,
    improvementTips: [String]
  },
  
  answered: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const InterviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Interview Configuration
  interviewType: {
    type: String,
    enum: [
      'technical_coding',
      'technical_system_design',
      'behavioral',
      'case_study',
      'product_management',
      'data_science',
      'marketing',
      'sales',
      'general',
      'mixed'
    ],
    required: true
  },
  
  jobTitle: {
    type: String,
    required: true
  },
  
  company: String,
  
  jobDescription: {
    type: String,
    required: true
  },
  
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  
  // Interview Settings
  numberOfQuestions: {
    type: Number,
    default: 5,
    min: 3,
    max: 15
  },
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'medium'
  },
  
  includeFollowUps: {
    type: Boolean,
    default: true
  },
  
  // Generated Questions
  questions: [InterviewQuestionSchema],
  
  // Session State
  status: {
    type: String,
    enum: ['setup', 'generating', 'ready', 'in_progress', 'paused', 'completed', 'abandoned'],
    default: 'setup'
  },
  
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  
  // Session Timing
  startedAt: Date,
  completedAt: Date,
  totalDuration: Number, // in seconds
  
  // Overall Performance
  overallPerformance: {
    // Speech Metrics
    averageConfidence: Number,
    averageClarity: Number,
    averagePacing: Number,
    totalFillerWords: Number,
    totalHesitations: Number,
    averageEnergy: Number,
    
    // Content Metrics
    averageRelevance: Number,
    averageDepth: Number,
    averageStructure: Number,
    technicalAccuracyAverage: Number,
    
    // Combined
    overallScore: Number,
    strengths: [String],
    weaknesses: [String],
    topImprovementAreas: [String],
    
    // Categorized Performance
    technicalPerformance: Number,
    behavioralPerformance: Number,
    communicationPerformance: Number,
    
    // Interviewer Impression
    hiringRecommendation: {
      type: String,
      enum: ['strong_yes', 'yes', 'maybe', 'no', 'strong_no']
    },
    hiringRecommendationReason: String
  },
  
  // Final Report
  detailedReport: {
    executiveSummary: String,
    strengthsAnalysis: String,
    weaknessesAnalysis: String,
    comparisonToExpectations: String,
    actionableSteps: [String],
    resourceRecommendations: [String],
    practiceAreas: [String]
  }
}, {
  timestamps: true
});

// Index for efficient queries
InterviewSessionSchema.index({ user: 1, createdAt: -1 });
InterviewSessionSchema.index({ status: 1 });

// Calculate overall performance before saving
InterviewSessionSchema.pre('save', function(next) {
  if (this.status === 'completed' && this.questions.length > 0) {
    const answeredQuestions = this.questions.filter(q => q.answered);
    
    if (answeredQuestions.length > 0) {
      // Calculate averages
      const speechMetrics = answeredQuestions.map(q => q.userAnswer.speechAnalysis);
      const contentMetrics = answeredQuestions.map(q => q.userAnswer.contentAnalysis);
      
      this.overallPerformance = this.overallPerformance || {};
      
      // Speech averages
      this.overallPerformance.averageConfidence = 
        speechMetrics.reduce((sum, m) => sum + (m.confidenceScore || 0), 0) / speechMetrics.length;
      
      this.overallPerformance.averageClarity = 
        speechMetrics.reduce((sum, m) => sum + (m.clarityScore || 0), 0) / speechMetrics.length;
      
      this.overallPerformance.averagePacing = 
        speechMetrics.reduce((sum, m) => sum + (m.pacingScore || 0), 0) / speechMetrics.length;
      
      this.overallPerformance.totalFillerWords = 
        speechMetrics.reduce((sum, m) => sum + (m.fillerWordsCount || 0), 0);
      
      this.overallPerformance.totalHesitations = 
        speechMetrics.reduce((sum, m) => sum + (m.hesitations || 0), 0);
      
      this.overallPerformance.averageEnergy = 
        speechMetrics.reduce((sum, m) => sum + (m.energyLevel || 0), 0) / speechMetrics.length;
      
      // Content averages
      this.overallPerformance.averageRelevance = 
        contentMetrics.reduce((sum, m) => sum + (m.relevanceScore || 0), 0) / contentMetrics.length;
      
      this.overallPerformance.averageDepth = 
        contentMetrics.reduce((sum, m) => sum + (m.depthScore || 0), 0) / contentMetrics.length;
      
      this.overallPerformance.averageStructure = 
        contentMetrics.reduce((sum, m) => sum + (m.structureScore || 0), 0) / contentMetrics.length;
      
      // Overall score (weighted: 40% speech + 60% content)
      const speechScore = (
        this.overallPerformance.averageConfidence +
        this.overallPerformance.averageClarity +
        this.overallPerformance.averagePacing +
        this.overallPerformance.averageEnergy
      ) / 4;
      
      const contentScore = (
        this.overallPerformance.averageRelevance +
        this.overallPerformance.averageDepth +
        this.overallPerformance.averageStructure
      ) / 3;
      
      this.overallPerformance.overallScore = (speechScore * 0.4) + (contentScore * 0.6);
      
      // Hiring recommendation based on overall score
      if (this.overallPerformance.overallScore >= 85) {
        this.overallPerformance.hiringRecommendation = 'strong_yes';
      } else if (this.overallPerformance.overallScore >= 75) {
        this.overallPerformance.hiringRecommendation = 'yes';
      } else if (this.overallPerformance.overallScore >= 60) {
        this.overallPerformance.hiringRecommendation = 'maybe';
      } else if (this.overallPerformance.overallScore >= 45) {
        this.overallPerformance.hiringRecommendation = 'no';
      } else {
        this.overallPerformance.hiringRecommendation = 'strong_no';
      }
    }
  }
  next();
});

module.exports = mongoose.model('InterviewSession', InterviewSessionSchema);
