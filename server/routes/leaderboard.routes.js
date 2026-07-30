// server/routes/leaderboard.routes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/leaderboard.controller');

// ── Public (read) endpoints — require auth to identify current user ──────────

// Get top users for any leaderboard type
// GET /api/leaderboard/top?type=global|weekly|monthly|mostImproved|longestStreak
router.get('/top', auth, ctrl.getTopUsers);

// Search the leaderboard
// GET /api/leaderboard/search?q=john&sortBy=overallScore&sortOrder=desc
router.get('/search', auth, ctrl.searchLeaderboard);

// Get current user's rank + nearby users
// GET /api/leaderboard/rank/me?type=global
router.get('/rank/me', auth, ctrl.getMyRank);

// Get any user's rank + nearby users
// GET /api/leaderboard/rank/:userId?type=global
router.get('/rank/:userId', auth, ctrl.getUserRank);

// Get current user's stats or any user's stats
// GET /api/leaderboard/stats/me
// GET /api/leaderboard/stats/:userId
router.get('/stats/:userId', auth, ctrl.getUserStats);

// Get scoring config (weights + levels) — public transparency
// GET /api/leaderboard/config
router.get('/config', ctrl.getConfig);

// ── Admin endpoints ───────────────────────────────────────────────────────────

// Refresh all scores + ranks
// POST /api/leaderboard/admin/refresh
router.post('/admin/refresh', auth, ctrl.adminRefresh);

// View rank calculation breakdown for a specific user
// GET /api/leaderboard/admin/calculations?userId=xxx
router.get('/admin/calculations', auth, ctrl.adminViewCalculations);

// Remove / hide a user from leaderboard
// DELETE /api/leaderboard/admin/user/:userId
router.delete('/admin/user/:userId', auth, ctrl.adminRemoveUser);

// Reset seasonal (weekly/monthly) scores
// POST /api/leaderboard/admin/reset-seasonal
router.post('/admin/reset-seasonal', auth, ctrl.adminResetSeasonal);

module.exports = router;
