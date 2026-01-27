const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Password required only for traditional auth (not OAuth)
      return !this.googleId && !this.githubId;
    },
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  // OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  avatar: {
    type: String, // Profile picture URL or base64 from OAuth provider or uploaded
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null,
    maxlength: 500
  },
  coverPhoto: {
    type: String, // Cover banner image URL or base64
    default: null
  },
  // Streaks & Practice Tracking
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastPracticeDate: {
    type: Date,
    default: null
  },
  totalPracticeDays: {
    type: Number,
    default: 0
  },
  // Achievements & Badges
  badges: [{
    badgeId: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: Date
  }],
  // Learning Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    accentPreference: {
      type: String,
      enum: ['american', 'british', 'australian', 'neutral'],
      default: 'neutral'
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    focusAreas: [{
      type: String,
      enum: ['pronunciation', 'fluency', 'vocabulary', 'grammar', 'confidence', 'business', 'casual', 'presentations']
    }],
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: String, // Time in HH:MM format
      default: '09:00'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  // Privacy Settings
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'public'
    },
    showStats: {
      type: Boolean,
      default: true
    },
    showBadges: {
      type: Boolean,
      default: true
    }
  },
  // Social Links
  socialLinks: {
    linkedin: String,
    twitter: String,
    website: String
  },
  // Onboarding & Personalization
  onboarding: {
    completed: {
      type: Boolean,
      default: false
    },
    user_purpose: {
      type: String,
      enum: [
        'interviews_evaluations',
        'presentations_pitches', 
        'everyday_conversations',
        'confidence_pressure'
      ],
      default: null
    },
    stress_trigger: {
      type: String,
      enum: [
        'first_30_seconds',
        'unexpected_questions',
        'being_judged',
        'continuous_speaking'
      ],
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  // Journey Mode Progress
  journeyProgress: {
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    },
    completedTasks: [{
      taskId: String,
      taskTitle: String,
      taskType: String,
      completedAt: Date,
      score: Number,
      reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnalysisReport'
      }
    }],
    skillProgress: {
      pronunciation: { type: Boolean, default: false },
      pace: { type: Boolean, default: false },
      sentences: { type: Boolean, default: false },
      fillers: { type: Boolean, default: false },
      flow: { type: Boolean, default: false },
      pauses: { type: Boolean, default: false },
      storytelling: { type: Boolean, default: false },
      organization: { type: Boolean, default: false },
      confidence: { type: Boolean, default: false },
      goal_specific: { type: Boolean, default: false },
      advanced: { type: Boolean, default: false },
      real_world: { type: Boolean, default: false }
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
