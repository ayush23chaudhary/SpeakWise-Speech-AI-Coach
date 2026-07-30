// server/models/LeaderboardEntry.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * LeaderboardEntry — precomputed snapshot per user.
 * Refreshed by the LeaderboardService rather than computed on every request.
 * This acts as a materialized view / denormalized read model for fast ranking queries.
 */
const LeaderboardEntrySchema = new Schema({
  // ── Identity ─────────────────────────────────────────────────────────────
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: { type: String, required: true },
  avatar: { type: String, default: null },
  country: { type: String, default: null },

  // ── Scores ───────────────────────────────────────────────────────────────
  overallScore: { type: Number, default: 0, min: 0, max: 100 },   // Weighted composite (0–100)
  weeklyScore:  { type: Number, default: 0, min: 0, max: 100 },   // Last 7 days
  monthlyScore: { type: Number, default: 0, min: 0, max: 100 },   // Current calendar month
  improvementScore: { type: Number, default: 0 },                  // Raw improvement %

  // ── Score Components (stored for transparency / admin view) ──────────────
  scoreComponents: {
    communicationScore: { type: Number, default: 0 },  // avg clarity+fluency+pronunciation
    confidenceScore:    { type: Number, default: 0 },  // avg confidence metric
    consistencyScore:   { type: Number, default: 0 },  // sessions last 30 days, normalized
    improvementScore:   { type: Number, default: 0 },  // first5 vs last5 avg, normalized
    streakScore:        { type: Number, default: 0 },  // currentStreak, normalized
  },

  // ── Rankings ─────────────────────────────────────────────────────────────
  globalRank:    { type: Number, default: 0 },
  weeklyRank:    { type: Number, default: 0 },
  monthlyRank:   { type: Number, default: 0 },
  previousRank:  { type: Number, default: 0 },   // Stored before last refresh for trend
  rankChange:    { type: Number, default: 0 },   // Positive = improved, negative = dropped
  mostImprovedRank: { type: Number, default: 0 },
  streakRank:    { type: Number, default: 0 },

  // ── Gamification ─────────────────────────────────────────────────────────
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master', 'Elite'],
    default: 'Beginner'
  },
  totalPoints: { type: Number, default: 0 },   // Cumulative sum of all session overallScores

  badges: [{
    badgeId:     { type: String },
    name:        { type: String },
    description: { type: String },
    icon:        { type: String },
    earnedAt:    { type: Date }
  }],

  // ── Streak ───────────────────────────────────────────────────────────────
  currentStreak:     { type: Number, default: 0 },
  longestStreak:     { type: Number, default: 0 },
  lastPracticeDate:  { type: Date, default: null },
  totalPracticeDays: { type: Number, default: 0 },

  // ── Analytics ────────────────────────────────────────────────────────────
  totalSessions:   { type: Number, default: 0 },
  avgScore:        { type: Number, default: 0 },
  improvementPct:  { type: Number, default: 0 },   // % change first-5 → last-5

  // Trend direction: 'up' | 'down' | 'stable'
  trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },

  // ── Meta ─────────────────────────────────────────────────────────────────
  lastCalculatedAt: { type: Date, default: Date.now },
  isVisible: { type: Boolean, default: true }   // Respects user's leaderboardVisible flag

}, {
  timestamps: true
});

// ── Indexes for fast sorted queries ──────────────────────────────────────────
LeaderboardEntrySchema.index({ overallScore: -1 });
LeaderboardEntrySchema.index({ weeklyScore: -1 });
LeaderboardEntrySchema.index({ monthlyScore: -1 });
LeaderboardEntrySchema.index({ currentStreak: -1 });
LeaderboardEntrySchema.index({ improvementPct: -1 });
LeaderboardEntrySchema.index({ globalRank: 1 });
// Note: userId unique index is created by { unique: true } in the field definition above
LeaderboardEntrySchema.index({ name: 'text' });  // Text search support

module.exports = mongoose.model('LeaderboardEntry', LeaderboardEntrySchema);
