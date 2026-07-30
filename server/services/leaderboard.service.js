// server/services/leaderboard.service.js
/**
 * LeaderboardService
 *
 * Handles all leaderboard computation, caching, and ranking logic.
 * 
 * Architecture note: Uses an in-memory Map-based cache with TTL.
 * The cache interface is designed for easy Redis drop-in replacement:
 *   - cacheGet(key)      → Promise<value | null>
 *   - cacheSet(key, val) → Promise<void>
 *   - cacheDel(key)      → Promise<void>
 *   - cacheFlush()       → Promise<void>
 * To switch to Redis, replace the in-memory implementation below with ioredis calls.
 */

const User             = require('../models/User.model');
const AnalysisReport   = require('../models/AnalysisReport.model');
const LeaderboardEntry = require('../models/LeaderboardEntry.model');
const { startOfDay, startOfWeek, startOfMonth, differenceInDays } = require('date-fns');

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURABLE SCORE WEIGHTS
// Modify these to change the ranking formula without touching logic.
// ─────────────────────────────────────────────────────────────────────────────
const SCORE_WEIGHTS = {
  communicationScore: 0.40,  // avg of clarity + fluency + pronunciation
  confidenceScore:    0.20,  // avg confidence metric
  consistencyScore:   0.15,  // sessions in last 30 days (normalized)
  improvementScore:   0.15,  // % improvement from first-5 to last-5 reports
  streakScore:        0.10,  // current streak (normalized)
};

// Level thresholds (based on cumulative totalPoints = sum of all session overallScores)
const LEVEL_THRESHOLDS = [
  { label: 'Beginner',     min: 0    },
  { label: 'Intermediate', min: 200  },
  { label: 'Advanced',     min: 500  },
  { label: 'Expert',       min: 1000 },
  { label: 'Master',       min: 2000 },
  { label: 'Elite',        min: 4000 },
];

// Cache TTL in milliseconds (default 5 minutes; override with LEADERBOARD_CACHE_TTL_MS env var)
const CACHE_TTL_MS = parseInt(process.env.LEADERBOARD_CACHE_TTL_MS || '300000', 10);

// ─────────────────────────────────────────────────────────────────────────────
// IN-MEMORY CACHE  (Redis-ready interface)
// ─────────────────────────────────────────────────────────────────────────────
const _memCache = new Map(); // key → { value, expiresAt }

const cache = {
  async get(key) {
    const entry = _memCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      _memCache.delete(key);
      return null;
    }
    return entry.value;
  },
  async set(key, value, ttlMs = CACHE_TTL_MS) {
    _memCache.set(key, { value, expiresAt: Date.now() + ttlMs });
  },
  async del(key) {
    _memCache.delete(key);
  },
  async flush() {
    _memCache.clear();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function computeLevel(totalPoints) {
  let level = 'Beginner';
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalPoints >= threshold.min) {
      level = threshold.label;
    }
  }
  return level;
}

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Compute improvement % between first 5 and last 5 sessions.
 * Returns 0 if insufficient data (<= 5 sessions).
 */
function computeImprovementPct(reports) {
  if (reports.length < 6) return 0;
  const sorted = [...reports].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const first5 = sorted.slice(0, 5);
  const last5  = sorted.slice(-5);
  const firstAvg = first5.reduce((s, r) => s + r.overallScore, 0) / 5;
  const lastAvg  = last5.reduce((s,  r) => s + r.overallScore, 0) / 5;
  if (firstAvg === 0) return 0;
  return ((lastAvg - firstAvg) / firstAvg) * 100;
}

/**
 * Average of metric values from reports, ignoring null/undefined entries.
 */
function avgMetric(reports, metricKey) {
  const vals = reports
    .map(r => r.metrics?.[metricKey])
    .filter(v => v != null && !isNaN(v));
  if (!vals.length) return 0;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE SCORE COMPUTATION
// ─────────────────────────────────────────────────────────────────────────────
class LeaderboardService {
  /**
   * Compute the weighted leaderboard score for a single user.
   * @param {string|ObjectId} userId
   * @returns {object} scoreResult with all components + final score
   */
  static async calculateUserScore(userId) {
    const user    = await User.findById(userId).select('-password');
    if (!user) throw new Error(`User ${userId} not found`);

    const allReports = await AnalysisReport.find({ user: userId })
      .select('overallScore metrics duration createdAt')
      .sort({ createdAt: 1 })
      .lean();

    // ── Date windows ─────────────────────────────────────────────────────────
    const now          = new Date();
    const weekStart    = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const monthStart   = startOfMonth(now);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyReports   = allReports.filter(r => new Date(r.createdAt) >= weekStart);
    const monthlyReports  = allReports.filter(r => new Date(r.createdAt) >= monthStart);
    const last30Reports   = allReports.filter(r => new Date(r.createdAt) >= thirtyDaysAgo);

    // ── Component 1: Communication Score (40%) ────────────────────────────────
    const clarityAvg       = avgMetric(allReports, 'clarity');
    const fluencyAvg       = avgMetric(allReports, 'fluency');
    const pronunciationAvg = avgMetric(allReports, 'pronunciation');
    // Use whichever metrics exist
    const metricCount = [clarityAvg, fluencyAvg, pronunciationAvg].filter(v => v > 0).length || 1;
    const communicationScore = clamp(
      (clarityAvg + fluencyAvg + pronunciationAvg) / metricCount
    );

    // ── Component 2: Confidence Score (20%) ──────────────────────────────────
    const confidenceScore = clamp(avgMetric(allReports, 'confidence'));

    // ── Component 3: Consistency Score (15%) — sessions last 30 days ─────────
    // 30 sessions in 30 days = perfect score; capped
    const consistencyRaw   = last30Reports.length;
    const consistencyScore = clamp((consistencyRaw / 30) * 100);

    // ── Component 4: Improvement Score (15%) ─────────────────────────────────
    const improvementPct   = computeImprovementPct(allReports);
    // Normalize: 50% improvement → 100 points
    const improvementScore = clamp((improvementPct / 50) * 100);

    // ── Component 5: Streak Score (10%) ──────────────────────────────────────
    // 30-day streak → 100 points; capped
    const streakScore = clamp(((user.currentStreak || 0) / 30) * 100);

    // ── Weighted Overall ─────────────────────────────────────────────────────
    const overallScore = clamp(
      communicationScore  * SCORE_WEIGHTS.communicationScore +
      confidenceScore     * SCORE_WEIGHTS.confidenceScore +
      consistencyScore    * SCORE_WEIGHTS.consistencyScore +
      improvementScore    * SCORE_WEIGHTS.improvementScore +
      streakScore         * SCORE_WEIGHTS.streakScore
    );

    // ── Weekly / Monthly scores ───────────────────────────────────────────────
    const weeklyAvg  = weeklyReports.length
      ? weeklyReports.reduce((s, r) => s + r.overallScore, 0) / weeklyReports.length
      : 0;
    const monthlyAvg = monthlyReports.length
      ? monthlyReports.reduce((s, r) => s + r.overallScore, 0) / monthlyReports.length
      : 0;

    // ── Totals ────────────────────────────────────────────────────────────────
    const totalPoints = allReports.reduce((s, r) => s + r.overallScore, 0);
    const avgScore    = allReports.length
      ? allReports.reduce((s, r) => s + r.overallScore, 0) / allReports.length
      : 0;

    return {
      userId,
      name:   user.name,
      avatar: user.avatar,
      country: user.country || null,
      overallScore:     Math.round(overallScore * 10) / 10,
      weeklyScore:      Math.round(weeklyAvg  * 10) / 10,
      monthlyScore:     Math.round(monthlyAvg * 10) / 10,
      improvementScore: Math.round(improvementScore * 10) / 10,
      scoreComponents: {
        communicationScore: Math.round(communicationScore * 10) / 10,
        confidenceScore:    Math.round(confidenceScore    * 10) / 10,
        consistencyScore:   Math.round(consistencyScore   * 10) / 10,
        improvementScore:   Math.round(improvementScore   * 10) / 10,
        streakScore:        Math.round(streakScore        * 10) / 10,
      },
      totalPoints:       Math.round(totalPoints),
      avgScore:          Math.round(avgScore * 10) / 10,
      improvementPct:    Math.round(improvementPct * 10) / 10,
      totalSessions:     allReports.length,
      level:             computeLevel(totalPoints),
      badges:            user.badges || [],
      currentStreak:     user.currentStreak  || 0,
      longestStreak:     user.longestStreak  || 0,
      lastPracticeDate:  user.lastPracticeDate || null,
      totalPracticeDays: user.totalPracticeDays || 0,
      isVisible:         user.leaderboardVisible !== false,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LEADERBOARD REFRESH
  // Recomputes ALL users and upserts into LeaderboardEntry collection.
  // Also assigns ranks after computing all scores.
  // ─────────────────────────────────────────────────────────────────────────
  static async refreshLeaderboard() {
    console.log('🔄 Refreshing leaderboard...');
    const users = await User.find({}).select('_id leaderboardVisible').lean();
    const results = [];

    for (const user of users) {
      try {
        const scoreData = await LeaderboardService.calculateUserScore(user._id);
        results.push(scoreData);
      } catch (err) {
        console.warn(`⚠️  Skipping user ${user._id}: ${err.message}`);
      }
    }

    // ── Compute ranks for each leaderboard type ───────────────────────────
    const sorted = {
      global:       [...results].sort((a, b) => b.overallScore - a.overallScore),
      weekly:       [...results].sort((a, b) => b.weeklyScore - a.weeklyScore),
      monthly:      [...results].sort((a, b) => b.monthlyScore - a.monthlyScore),
      mostImproved: [...results].sort((a, b) => b.improvementPct - a.improvementPct),
      streak:       [...results].sort((a, b) => b.currentStreak - a.currentStreak),
    };

    const rankMap = {};
    for (const entry of results) {
      const uid = entry.userId.toString();
      rankMap[uid] = {
        globalRank:       sorted.global.findIndex(e => e.userId.toString() === uid) + 1,
        weeklyRank:       sorted.weekly.findIndex(e => e.userId.toString() === uid) + 1,
        monthlyRank:      sorted.monthly.findIndex(e => e.userId.toString() === uid) + 1,
        mostImprovedRank: sorted.mostImproved.findIndex(e => e.userId.toString() === uid) + 1,
        streakRank:       sorted.streak.findIndex(e => e.userId.toString() === uid) + 1,
      };
    }

    // ── Upsert into DB ────────────────────────────────────────────────────
    const now = new Date();
    let updatedCount = 0;

    for (const entry of results) {
      const uid = entry.userId.toString();
      const ranks = rankMap[uid];

      // Fetch previous global rank to compute trend
      const existing = await LeaderboardEntry.findOne({ userId: entry.userId })
        .select('globalRank').lean();
      const previousRank = existing?.globalRank || ranks.globalRank;
      const rankChange   = previousRank - ranks.globalRank; // positive = moved up

      let trend = 'stable';
      if (rankChange > 0) trend = 'up';
      else if (rankChange < 0) trend = 'down';

      await LeaderboardEntry.findOneAndUpdate(
        { userId: entry.userId },
        {
          $set: {
            ...entry,
            ...ranks,
            previousRank,
            rankChange,
            trend,
            lastCalculatedAt: now,
          }
        },
        { upsert: true, new: true }
      );
      updatedCount++;
    }

    // ── Flush cache so next request gets fresh data ───────────────────────
    await cache.flush();

    console.log(`✅ Leaderboard refreshed: ${updatedCount} entries updated`);
    return { updatedCount, timestamp: now };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET TOP USERS — paginated, filtered, cached
  // type: 'global' | 'weekly' | 'monthly' | 'mostImproved' | 'longestStreak'
  // ─────────────────────────────────────────────────────────────────────────
  static async getTopUsers({ type = 'global', page = 1, limit = 20, filters = {} }) {
    const cacheKey = `top:${type}:${page}:${limit}:${JSON.stringify(filters)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    // Build sort criteria
    const sortMap = {
      global:       { globalRank: 1 },
      weekly:       { weeklyRank: 1 },
      monthly:      { monthlyRank: 1 },
      mostImproved: { mostImprovedRank: 1 },
      longestStreak: { streakRank: 1 },
    };
    const sort = sortMap[type] || sortMap.global;

    // Build filter query
    const query = { isVisible: true };
    if (filters.country) query.country = { $regex: new RegExp(`^${filters.country}$`, 'i') };
    if (filters.level)   query.level = filters.level;
    if (filters.badge)   query['badges.badgeId'] = filters.badge;

    const skip  = (page - 1) * limit;
    const total = await LeaderboardEntry.countDocuments(query);
    const entries = await LeaderboardEntry.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const result = {
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      type,
      cachedAt: new Date(),
    };

    await cache.set(cacheKey, result);
    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET USER RANK + NEARBY (±5 users)
  // ─────────────────────────────────────────────────────────────────────────
  static async getUserRank(userId, type = 'global') {
    const cacheKey = `rank:${userId}:${type}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const rankField = {
      global:       'globalRank',
      weekly:       'weeklyRank',
      monthly:      'monthlyRank',
      mostImproved: 'mostImprovedRank',
      longestStreak: 'streakRank',
    }[type] || 'globalRank';

    const sortMap = {
      globalRank:       { globalRank: 1 },
      weeklyRank:       { weeklyRank: 1 },
      monthlyRank:      { monthlyRank: 1 },
      mostImprovedRank: { mostImprovedRank: 1 },
      streakRank:       { streakRank: 1 },
    };
    const sort = sortMap[rankField];

    const userEntry = await LeaderboardEntry.findOne({ userId }).lean();
    if (!userEntry) {
      return { userEntry: null, nearby: [], message: 'User not on leaderboard yet' };
    }

    const userRank = userEntry[rankField] || 0;
    // Fetch 5 above and 5 below
    const aboveRank = Math.max(1, userRank - 5);
    const belowRank = userRank + 5;

    const nearby = await LeaderboardEntry.find({
      isVisible: true,
      [rankField]: { $gte: aboveRank, $lte: belowRank }
    }).sort(sort).lean();

    const result = { userEntry, nearby, type, rankField };
    await cache.set(cacheKey, result);
    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET USER STATS (detailed analytics)
  // ─────────────────────────────────────────────────────────────────────────
  static async getUserStats(userId) {
    const cacheKey = `stats:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const entry = await LeaderboardEntry.findOne({ userId }).lean();
    if (!entry) {
      // Try computing fresh
      const score = await LeaderboardService.calculateUserScore(userId);
      return { ...score, ranks: null };
    }

    const result = { ...entry };
    await cache.set(cacheKey, result);
    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SEARCH LEADERBOARD — partial, case-insensitive, paginated
  // ─────────────────────────────────────────────────────────────────────────
  static async searchLeaderboard({ query, page = 1, limit = 20, sortBy = 'overallScore', sortOrder = 'desc', filters = {} }) {
    if (!query || query.trim().length === 0) {
      return LeaderboardService.getTopUsers({ page, limit, filters });
    }

    const cacheKey = `search:${query}:${page}:${limit}:${sortBy}:${sortOrder}:${JSON.stringify(filters)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const searchQuery = {
      isVisible: true,
      name: { $regex: new RegExp(query.trim(), 'i') }
    };
    if (filters.country) searchQuery.country = { $regex: new RegExp(`^${filters.country}$`, 'i') };
    if (filters.level)   searchQuery.level = filters.level;
    if (filters.badge)   searchQuery['badges.badgeId'] = filters.badge;

    const allowedSortFields = ['overallScore', 'weeklyScore', 'monthlyScore', 'currentStreak', 'globalRank', 'improvementPct'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'overallScore';
    const sort = { [safeSortBy]: sortOrder === 'asc' ? 1 : -1 };

    const skip  = (page - 1) * limit;
    const total = await LeaderboardEntry.countDocuments(searchQuery);
    const entries = await LeaderboardEntry.find(searchQuery)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const result = {
      entries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total },
      query,
      cachedAt: new Date(),
    };

    await cache.set(cacheKey, result);
    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN — Remove user from leaderboard
  // ─────────────────────────────────────────────────────────────────────────
  static async removeUserFromLeaderboard(userId) {
    await LeaderboardEntry.findOneAndUpdate(
      { userId },
      { $set: { isVisible: false } }
    );
    await cache.flush();
    return { success: true, message: `User ${userId} hidden from leaderboard` };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Expose weights for admin transparency
  // ─────────────────────────────────────────────────────────────────────────
  static getScoreWeights() {
    return SCORE_WEIGHTS;
  }

  static getLevelThresholds() {
    return LEVEL_THRESHOLDS;
  }
}

module.exports = LeaderboardService;
