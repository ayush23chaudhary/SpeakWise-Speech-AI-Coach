import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Minus, Search, Filter,
  Crown, Flame, Star, Zap, Target, Diamond, ChevronDown,
  RefreshCw, Users, Award, Medal, X, ChevronUp, Globe
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

// ─── Constants ─────────────────────────────────────────────────────────────
const LEADERBOARD_TYPES = [
  { id: 'global',        label: 'Global',          icon: Globe,   color: 'from-violet-500 to-purple-600' },
  { id: 'weekly',        label: 'Weekly',          icon: Zap,     color: 'from-blue-500 to-cyan-500'    },
  { id: 'monthly',       label: 'Monthly',         icon: Star,    color: 'from-amber-500 to-orange-500' },
  { id: 'mostImproved',  label: 'Most Improved',   icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  { id: 'longestStreak', label: 'Streak',          icon: Flame,   color: 'from-red-500 to-rose-500'    },
];

const SCORE_FIELD = {
  global:        'overallScore',
  weekly:        'weeklyScore',
  monthly:       'monthlyScore',
  mostImproved:  'improvementPct',
  longestStreak: 'currentStreak',
};

const SCORE_LABEL = {
  global:        'Score',
  weekly:        'Weekly Score',
  monthly:       'Monthly Score',
  mostImproved:  'Improvement',
  longestStreak: 'Streak',
};

const SCORE_SUFFIX = {
  global:        '',
  weekly:        '',
  monthly:       '',
  mostImproved:  '%',
  longestStreak: ' days',
};

const LEVEL_COLORS = {
  Beginner:     'from-gray-400 to-gray-500',
  Intermediate: 'from-green-400 to-emerald-500',
  Advanced:     'from-blue-400 to-blue-600',
  Expert:       'from-violet-400 to-purple-600',
  Master:       'from-amber-400 to-orange-500',
  Elite:        'from-pink-500 to-rose-600',
};

const LEVEL_BG = {
  Beginner:     'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  Intermediate: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  Advanced:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  Expert:       'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  Master:       'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  Elite:        'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400',
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const getInitials = (name) =>
  (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const formatScore = (val, type) => {
  if (val == null) return '—';
  const num = Math.round(val * 10) / 10;
  return `${num}${SCORE_SUFFIX[type]}`;
};

const getRankIcon = (rank) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
  if (rank === 3) return <Award className="w-4 h-4 text-amber-600" />;
  return null;
};

// ─── Sub-components ────────────────────────────────────────────────────────

/** Skeleton loading row */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
    <div className="w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
    </div>
    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
  </div>
);

/** Trend indicator */
const TrendBadge = ({ change }) => {
  if (!change || change === 0)
    return <span className="text-gray-400 flex items-center gap-1 text-xs"><Minus className="w-3 h-3" /> —</span>;
  if (change > 0)
    return <span className="text-emerald-500 flex items-center gap-1 text-xs font-semibold"><TrendingUp className="w-3 h-3" /> +{change}</span>;
  return <span className="text-red-400 flex items-center gap-1 text-xs font-semibold"><TrendingDown className="w-3 h-3" /> {change}</span>;
};

/** Avatar component */
const Avatar = ({ user, size = 'md', ring = false }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' };
  return (
    <div className={`${sizes[size]} rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-bold
      ${ring ? 'ring-2 ring-white dark:ring-gray-800 shadow-lg' : ''}
      bg-gradient-to-br from-[#1FB6A6] to-[#1E2A5A] text-white`}>
      {user?.avatar
        ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        : <span>{getInitials(user?.name)}</span>
      }
    </div>
  );
};

/** Podium — top 3 animated display */
const Podium = ({ entries, type }) => {
  if (!entries || entries.length < 3) return null;
  const [first, second, third] = entries;
  const scoreField = SCORE_FIELD[type];

  const PodiumCard = ({ entry, rank, heightClass, delay }) => (
    <div className={`flex flex-col items-center gap-2 ${delay}`}
      style={{ animation: `fadeInUp 0.6s ease both ${delay}` }}>
      {/* Avatar */}
      <div className="relative">
        <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center font-bold text-white text-xl
          ring-4 shadow-2xl
          ${rank === 1 ? 'ring-yellow-400 w-20 h-20 text-2xl' : rank === 2 ? 'ring-gray-300' : 'ring-amber-600'}
          bg-gradient-to-br from-[#1FB6A6] to-[#1E2A5A]`}>
          {entry.avatar
            ? <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
            : <span>{getInitials(entry.name)}</span>
          }
        </div>
        {/* Crown for #1 */}
        {rank === 1 && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <Crown className="w-7 h-7 text-yellow-400 drop-shadow-lg" />
          </div>
        )}
        {/* Rank badge */}
        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow
          ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-600'}`}>
          {rank}
        </div>
      </div>

      {/* Name + score */}
      <div className="text-center mt-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[100px]">{entry.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{entry.level}</p>
        <p className={`mt-1 font-bold text-lg ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : 'text-amber-600'}`}>
          {formatScore(entry[scoreField], type)}
        </p>
      </div>

      {/* Podium block */}
      <div className={`${heightClass} w-28 rounded-t-xl flex flex-col items-center justify-end pb-3 relative
        ${rank === 1 ? 'bg-gradient-to-b from-yellow-400/30 to-yellow-500/10 border border-yellow-400/30' :
          rank === 2 ? 'bg-gradient-to-b from-gray-400/20 to-gray-500/10 border border-gray-400/30' :
          'bg-gradient-to-b from-amber-600/20 to-amber-700/10 border border-amber-600/30'}
        dark:border-opacity-20 backdrop-blur-sm`}>
        <div className={`text-2xl font-black ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : 'text-amber-600'}`}>
          {rank}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 py-8 px-4">
      <PodiumCard entry={second} rank={2} heightClass="h-24" delay="0.1s" />
      <PodiumCard entry={first}  rank={1} heightClass="h-32" delay="0s" />
      <PodiumCard entry={third}  rank={3} heightClass="h-16" delay="0.2s" />
    </div>
  );
};

/** Single leaderboard row */
const LeaderboardRow = ({ entry, rank, type, isCurrentUser, isHighlighted }) => {
  const scoreField = SCORE_FIELD[type];

  return (
    <div className={`
      flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 transition-all duration-300 group
      ${isCurrentUser
        ? 'bg-gradient-to-r from-[#1FB6A6]/10 to-[#1E2A5A]/5 border-l-4 border-[#1FB6A6] dark:from-[#1FB6A6]/20 dark:to-transparent'
        : isHighlighted
        ? 'bg-yellow-50/80 dark:bg-yellow-900/10'
        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
      border-b border-gray-100 dark:border-gray-700/50 last:border-0
    `}>
      {/* Rank */}
      <div className="w-8 sm:w-10 flex-shrink-0 flex flex-col items-center">
        <span className={`font-bold text-sm sm:text-base ${rank <= 3 ? 'text-[#1FB6A6]' : 'text-gray-500 dark:text-gray-400'}`}>
          {rank <= 3 ? getRankIcon(rank) || `#${rank}` : `#${rank}`}
        </span>
        <TrendBadge change={entry.rankChange} />
      </div>

      {/* Avatar */}
      <Avatar user={entry} size="md" />

      {/* Name + level + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm sm:text-base truncate ${isCurrentUser ? 'text-[#1FB6A6]' : 'text-gray-900 dark:text-white'}`}>
            {entry.name}
            {isCurrentUser && <span className="ml-1 text-xs text-[#1FB6A6]">(You)</span>}
          </span>
          {entry.country && <span className="text-xs text-gray-400">{entry.country}</span>}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_BG[entry.level] || LEVEL_BG.Beginner}`}>
            {entry.level}
          </span>
          {/* Badges (max 3 visible) */}
          {(entry.badges || []).slice(0, 3).map((b, i) => (
            <span key={i} className="text-sm" title={b.name}>{b.icon}</span>
          ))}
          {(entry.badges || []).length > 3 && (
            <span className="text-xs text-gray-400">+{entry.badges.length - 3}</span>
          )}
        </div>
      </div>

      {/* Streak */}
      <div className="hidden sm:flex flex-col items-center flex-shrink-0 w-16">
        <div className="flex items-center gap-1">
          <Flame className={`w-3.5 h-3.5 ${entry.currentStreak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{entry.currentStreak || 0}</span>
        </div>
        <span className="text-[10px] text-gray-400">streak</span>
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-right w-20 sm:w-24">
        <div className={`text-base sm:text-lg font-bold ${rank === 1 ? 'text-yellow-500' : rank <= 3 ? 'text-[#1FB6A6]' : 'text-gray-800 dark:text-gray-200'}`}>
          {formatScore(entry[scoreField], type)}
        </div>
        <div className="text-[10px] text-gray-400">{SCORE_LABEL[type]}</div>
      </div>
    </div>
  );
};

/** My rank bar — pinned at the bottom */
const MyRankBar = ({ entry, type }) => {
  if (!entry) return null;
  const scoreField = SCORE_FIELD[type];
  const rankField  = { global: 'globalRank', weekly: 'weeklyRank', monthly: 'monthlyRank', mostImproved: 'mostImprovedRank', longestStreak: 'streakRank' }[type] || 'globalRank';

  return (
    <div className="sticky bottom-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-t-2 border-[#1FB6A6] px-4 sm:px-6 py-3 flex items-center gap-3">
      <span className="text-[#1FB6A6] font-bold text-sm">Your Rank</span>
      <span className="text-gray-500 text-sm">#{entry[rankField] || '—'}</span>
      <Avatar user={entry} size="sm" />
      <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">{entry.name}</span>
      <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${LEVEL_BG[entry.level] || LEVEL_BG.Beginner}`}>{entry.level}</span>
      <div className="flex items-center gap-1">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{entry.currentStreak}</span>
      </div>
      <span className="font-bold text-[#1FB6A6]">{formatScore(entry[scoreField], type)}</span>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Leaderboard = () => {
  const { user } = useAuthStore();

  // State
  const [activeType, setActiveType]         = useState('global');
  const [entries, setEntries]               = useState([]);
  const [myEntry, setMyEntry]               = useState(null);
  const [myEntryOnPage, setMyEntryOnPage]   = useState(false);
  const [loading, setLoading]               = useState(true);
  const [loadingMore, setLoadingMore]       = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters]       = useState(false);
  const [filters, setFilters]               = useState({ country: '', level: '', badge: '' });
  const [pagination, setPagination]         = useState({ page: 1, hasMore: false, total: 0 });
  const [refreshing, setRefreshing]         = useState(false);
  const [error, setError]                   = useState(null);

  const debounceRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  // Fetch leaderboard entries
  const fetchEntries = useCallback(async (reset = true) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const page  = reset ? 1 : pagination.page + 1;
      const params = new URLSearchParams({
        type:  activeType,
        page,
        limit: 20,
        ...(debouncedQuery ? { q: debouncedQuery } : {}),
        ...(filters.country ? { country: filters.country } : {}),
        ...(filters.level   ? { level:   filters.level   } : {}),
        ...(filters.badge   ? { badge:   filters.badge   } : {}),
      });

      const endpoint = debouncedQuery ? `/leaderboard/search?${params}` : `/leaderboard/top?${params}`;
      const { data }  = await api.get(endpoint);

      if (data.success) {
        const newEntries = data.data.entries || [];
        setEntries(prev => reset ? newEntries : [...prev, ...newEntries]);
        setPagination({ page, hasMore: data.data.pagination?.hasMore || false, total: data.data.pagination?.total || 0 });
        // Check if current user is in this page
        const myId = user?._id?.toString();
        setMyEntryOnPage(newEntries.some(e => e.userId?.toString() === myId));
      }
      setError(null);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeType, debouncedQuery, filters, pagination.page, user]);

  // Fetch current user's entry
  const fetchMyEntry = useCallback(async () => {
    try {
      const { data } = await api.get(`/leaderboard/rank/me?type=${activeType}`);
      if (data.success) setMyEntry(data.data.userEntry || null);
    } catch {
      setMyEntry(null);
    }
  }, [activeType]);

  // On type / filter / search change → reset + refetch
  useEffect(() => {
    fetchEntries(true);
    fetchMyEntry();
  }, [activeType, debouncedQuery, filters]); // eslint-disable-line

  // Admin refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/leaderboard/admin/refresh');
      await fetchEntries(true);
      await fetchMyEntry();
    } catch {
      // Silently fail — non-admin will get 403
    } finally {
      setRefreshing(false);
    }
  };

  const currentUserId = user?._id?.toString();

  const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master', 'Elite'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1E2A5A] via-[#1a3a6a] to-[#0f2040] text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#1FB6A6]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#1FB6A6] flex items-center justify-center shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Leaderboard</h1>
              </div>
              <p className="text-sm text-blue-200">
                Compete with {pagination.total > 0 ? pagination.total.toLocaleString() : ''} speakers globally · Improve · Rise
              </p>
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-white transition-all"
              title="Refresh rankings (Admin)"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* ── Type tabs ─────────────────────────────────────────────────── */}
          <div className="mt-6 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {LEADERBOARD_TYPES.map(tab => {
              const Icon    = tab.icon;
              const isActive = activeType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveType(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
                    ${isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                      : 'bg-white/10 text-blue-100 hover:bg-white/20'}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Podium ─────────────────────────────────────────────────────────── */}
      {!loading && entries.length >= 3 && !debouncedQuery && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mt-6">
            <div className="px-6 pt-4 pb-0 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                🏆 Top 3 Leaders
              </h2>
            </div>
            <Podium entries={entries} type={activeType} />
          </div>
        </div>
      )}

      {/* ── Search + Filters ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4">
        <div className="flex gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search speakers by name…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FB6A6]
                transition-all text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
              ${showFilters || Object.values(filters).some(Boolean)
                ? 'border-[#1FB6A6] text-[#1FB6A6] bg-[#1FB6A6]/5'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800'}`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {Object.values(filters).some(Boolean) && (
              <span className="w-2 h-2 rounded-full bg-[#1FB6A6]" />
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Country */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Country</label>
                <input
                  type="text"
                  placeholder="e.g. India, US"
                  value={filters.country}
                  onChange={e => setFilters(p => ({ ...p, country: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700
                    text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1FB6A6]"
                />
              </div>

              {/* Level */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Level</label>
                <select
                  value={filters.level}
                  onChange={e => setFilters(p => ({ ...p, level: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700
                    text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1FB6A6]"
                >
                  <option value="">All Levels</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Clear */}
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ country: '', level: '', badge: '' })}
                  className="px-4 py-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Leaderboard Table ─────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <span className="w-8 sm:w-10 text-xs font-semibold text-gray-400 uppercase">Rank</span>
            <span className="w-10 h-10 opacity-0" /> {/* Avatar spacer */}
            <span className="flex-1 text-xs font-semibold text-gray-400 uppercase">Speaker</span>
            <span className="hidden sm:block w-16 text-xs font-semibold text-gray-400 uppercase text-center">Streak</span>
            <span className="w-20 sm:w-24 text-xs font-semibold text-gray-400 uppercase text-right">{SCORE_LABEL[activeType]}</span>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
              <button onClick={() => fetchEntries(true)} className="px-4 py-2 rounded-lg bg-[#1FB6A6] text-white text-sm font-medium hover:bg-[#17A293]">
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && entries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1FB6A6]/20 to-[#1E2A5A]/10 flex items-center justify-center">
                <Users className="w-10 h-10 text-[#1FB6A6]" />
              </div>
              <h3 className="text-gray-700 dark:text-gray-300 font-semibold">No speakers found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-xs">
                {debouncedQuery
                  ? `No results for "${debouncedQuery}". Try a different name.`
                  : 'No speakers on this leaderboard yet. Complete a practice session to appear here!'}
              </p>
              {debouncedQuery && (
                <button onClick={() => setSearchQuery('')} className="text-sm text-[#1FB6A6] hover:underline">
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Entries */}
          {!loading && !error && entries.length > 0 && (
            <div>
              {entries.map((entry, idx) => {
                const rank = (pagination.page > 1 && idx === 0) ? idx + 1 : idx + 1;
                const isCurrentUser = entry.userId?.toString() === currentUserId;
                const isTop3 = idx < 3 && !debouncedQuery;
                return (
                  <LeaderboardRow
                    key={entry.userId}
                    entry={entry}
                    rank={rank}
                    type={activeType}
                    isCurrentUser={isCurrentUser}
                    isHighlighted={isTop3 && !isCurrentUser}
                  />
                );
              })}

              {/* Load More */}
              {pagination.hasMore && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={() => fetchEntries(false)}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1FB6A6] to-[#17A293]
                      text-white text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-60"
                  >
                    {loadingMore ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Loading…</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> Load More</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Score Legend ────────────────────────────────────────────────── */}
        {!loading && entries.length > 0 && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              🧮 Score Formula
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: 'Communication', pct: '40%', color: 'bg-[#1FB6A6]' },
                { label: 'Confidence',    pct: '20%', color: 'bg-blue-500' },
                { label: 'Consistency',   pct: '15%', color: 'bg-green-500' },
                { label: 'Improvement',   pct: '15%', color: 'bg-violet-500' },
                { label: 'Streak',        pct: '10%', color: 'bg-orange-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.color}`} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">{item.pct}</span> {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Level Guide ──────────────────────────────────────────────────── */}
        {!loading && entries.length > 0 && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              🎮 Level Guide
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Beginner',     pts: '0–199 pts' },
                { label: 'Intermediate', pts: '200–499 pts' },
                { label: 'Advanced',     pts: '500–999 pts' },
                { label: 'Expert',       pts: '1K–1.9K pts' },
                { label: 'Master',       pts: '2K–3.9K pts' },
                { label: 'Elite',        pts: '4K+ pts' },
              ].map(l => (
                <div key={l.label} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${LEVEL_BG[l.label]}`}>
                  {l.label}
                  <span className="opacity-60">{l.pts}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── My Rank Bar (sticky bottom) ────────────────────────────────────── */}
      {myEntry && !myEntryOnPage && <MyRankBar entry={myEntry} type={activeType} />}
    </div>
  );
};

export default Leaderboard;
