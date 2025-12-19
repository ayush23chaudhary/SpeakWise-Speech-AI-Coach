// server/models/Achievement.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AchievementSchema = new Schema({
  badgeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['milestone', 'streak', 'performance', 'practice', 'social'],
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['sessions_count', 'practice_days', 'streak_days', 'score_threshold', 'hours_practiced', 'improvement_rate'],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  points: {
    type: Number,
    default: 10
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
