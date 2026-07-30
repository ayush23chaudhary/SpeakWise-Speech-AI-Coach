// server/controllers/leaderboard.controller.js
/**
 * LeaderboardController
 *
 * All rankings are computed server-side. Client values are never trusted for score input.
 * Admin endpoints are guarded by a lightweight check (ADMIN_SECRET header or isAdmin flag).
 */

const LeaderboardService = require('../services/leaderboard.service');
const LeaderboardEntry   = require('../models/LeaderboardEntry.model');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const isAdminRequest = (req) => {
  // Option A: ADMIN_SECRET header (for scripts / simple admin panel)
  if (process.env.ADMIN_SECRET &&
      req.headers['x-admin-secret'] === process.env.ADMIN_SECRET) return true;
  // Option B: User has isAdmin flag (future-proof for role system)
  if (req.user?.isAdmin === true) return true;
  return false;
};

const paginate = (req) => ({
  page:  Math.max(1, parseInt(req.query.page  || '1', 10)),
  limit: Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10))),
});

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — GET TOP USERS
// GET /api/leaderboard/top?type=global&page=1&limit=20&country=IN&level=Expert
// ─────────────────────────────────────────────────────────────────────────────
exports.getTopUsers = async (req, res) => {
  try {
    const { type = 'global', country, level, badge, scoreType } = req.query;
    const { page, limit } = paginate(req);

    const validTypes = ['global', 'weekly', 'monthly', 'mostImproved', 'longestStreak'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    const filters = {};
    if (country) filters.country = country;
    if (level)   filters.level   = level;
    if (badge)   filters.badge   = badge;

    const result = await LeaderboardService.getTopUsers({ type, page, limit, filters });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('❌ getTopUsers error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — GET CURRENT USER'S RANK
// GET /api/leaderboard/rank/me?type=global
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyRank = async (req, res) => {
  try {
    const userId = req.user._id;
    const type   = req.query.type || 'global';

    const result = await LeaderboardService.getUserRank(userId, type);

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ getMyRank error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch rank' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — GET ANY USER'S RANK + NEARBY
// GET /api/leaderboard/rank/:userId?type=global
// ─────────────────────────────────────────────────────────────────────────────
exports.getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;
    const type       = req.query.type || 'global';

    const result = await LeaderboardService.getUserRank(userId, type);

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ getUserRank error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user rank' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — GET USER STATISTICS
// GET /api/leaderboard/stats/:userId
// GET /api/leaderboard/stats/me  (current user)
// ─────────────────────────────────────────────────────────────────────────────
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;

    const result = await LeaderboardService.getUserStats(userId);

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ getUserStats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user stats' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — SEARCH
// GET /api/leaderboard/search?q=john&page=1&limit=20&sortBy=overallScore&sortOrder=desc
// ─────────────────────────────────────────────────────────────────────────────
exports.searchLeaderboard = async (req, res) => {
  try {
    const { q = '', sortBy = 'overallScore', sortOrder = 'desc', country, level, badge } = req.query;
    const { page, limit } = paginate(req);

    const filters = {};
    if (country) filters.country = country;
    if (level)   filters.level   = level;
    if (badge)   filters.badge   = badge;

    const result = await LeaderboardService.searchLeaderboard({
      query: q, page, limit, sortBy, sortOrder, filters
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ searchLeaderboard error:', err);
    return res.status(500).json({ success: false, message: 'Search failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — GET SCORE WEIGHTS & LEVELS (for transparency / admin view)
// GET /api/leaderboard/config
// ─────────────────────────────────────────────────────────────────────────────
exports.getConfig = async (req, res) => {
  return res.json({
    success: true,
    data: {
      scoreWeights:    LeaderboardService.getScoreWeights(),
      levelThresholds: LeaderboardService.getLevelThresholds(),
    }
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — REFRESH LEADERBOARD
// POST /api/leaderboard/admin/refresh
// ─────────────────────────────────────────────────────────────────────────────
exports.adminRefresh = async (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  try {
    const result = await LeaderboardService.refreshLeaderboard();
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ adminRefresh error:', err);
    return res.status(500).json({ success: false, message: 'Refresh failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — REMOVE FRAUDULENT USER
// DELETE /api/leaderboard/admin/user/:userId
// ─────────────────────────────────────────────────────────────────────────────
exports.adminRemoveUser = async (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  try {
    const { userId } = req.params;
    const result = await LeaderboardService.removeUserFromLeaderboard(userId);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ adminRemoveUser error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove user' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — VIEW ALL RANKING CALCULATIONS (for audit/transparency)
// GET /api/leaderboard/admin/calculations?userId=xxx
// ─────────────────────────────────────────────────────────────────────────────
exports.adminViewCalculations = async (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId query param required' });
    }

    // Compute fresh (not cached) for transparency
    const scoreData = await LeaderboardService.calculateUserScore(userId);
    const entry     = await LeaderboardEntry.findOne({ userId }).lean();

    return res.json({
      success: true,
      data: {
        liveCalculation: scoreData,
        storedEntry: entry,
        weights: LeaderboardService.getScoreWeights(),
      }
    });
  } catch (err) {
    console.error('❌ adminViewCalculations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch calculations' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — RESET SEASONAL LEADERBOARD (hide all, set ranks to 0)
// POST /api/leaderboard/admin/reset-seasonal
// ─────────────────────────────────────────────────────────────────────────────
exports.adminResetSeasonal = async (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  try {
    await LeaderboardEntry.updateMany({}, {
      $set: {
        weeklyScore:  0,
        monthlyScore: 0,
        weeklyRank:   0,
        monthlyRank:  0,
      }
    });

    return res.json({ success: true, message: 'Seasonal leaderboard reset. Run /refresh to recompute.' });
  } catch (err) {
    console.error('❌ adminResetSeasonal error:', err);
    return res.status(500).json({ success: false, message: 'Reset failed' });
  }
};
