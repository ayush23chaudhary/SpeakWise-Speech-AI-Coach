// server/models/Goal.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GoalSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['sessions', 'score', 'streak', 'skill_improvement', 'time_practiced', 'custom'],
    required: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    default: 0
  },
  targetDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'archived'],
    default: 'active'
  },
  completedAt: {
    type: Date
  },
  // For skill improvement goals (optional - only for skill_improvement type)
  targetSkill: {
    type: String,
    enum: {
      values: ['pronunciation', 'fluency', 'clarity', 'confidence', 'pace', 'overall'],
      message: '{VALUE} is not a valid target skill'
    },
    required: false,
    // Custom validator to allow undefined/null but not empty strings
    validate: {
      validator: function(v) {
        return v === undefined || v === null || (typeof v === 'string' && v.trim().length > 0);
      },
      message: 'targetSkill must be a valid skill or left empty'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, { timestamps: true });

// Auto-complete goal if target is reached
GoalSchema.pre('save', function(next) {
  if (this.status === 'active' && this.currentValue >= this.targetValue) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Goal', GoalSchema);
