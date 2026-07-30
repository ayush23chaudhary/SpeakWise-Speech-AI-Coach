import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Minus, Search, Filter,
  Crown, Flame, Star, Zap, Target, Globe, ChevronDown,
  RefreshCw, Users, Award, Medal, X, BarChart2
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

// ─── Country → ISO2 code map (for flag emoji) ─────────────────────────────
const COUNTRY_CODE = {
  'india': 'IN', 'united states': 'US', 'united kingdom': 'GB',
  'australia': 'AU', 'canada': 'CA', 'germany': 'DE', 'france': 'FR',
  'italy': 'IT', 'spain': 'ES', 'portugal': 'PT', 'brazil': 'BR',
  'mexico': 'MX', 'argentina': 'AR', 'colombia': 'CO', 'chile': 'CL',
  'peru': 'PE', 'netherlands': 'NL', 'belgium': 'BE', 'switzerland': 'CH',
  'austria': 'AT', 'sweden': 'SE', 'norway': 'NO', 'denmark': 'DK',
  'finland': 'FI', 'poland': 'PL', 'russia': 'RU', 'ukraine': 'UA',
  'turkey': 'TR', 'israel': 'IL', 'greece': 'GR', 'romania': 'RO',
  'hungary': 'HU', 'czech republic': 'CZ', 'slovakia': 'SK', 'croatia': 'HR',
  'bulgaria': 'BG', 'china': 'CN', 'japan': 'JP', 'south korea': 'KR',
  'taiwan': 'TW', 'hong kong': 'HK', 'singapore': 'SG', 'malaysia': 'MY',
  'indonesia': 'ID', 'philippines': 'PH', 'thailand': 'TH', 'vietnam': 'VN',
  'saudi arabia': 'SA', 'uae': 'AE', 'egypt': 'EG', 'nigeria': 'NG',
  'ghana': 'GH', 'kenya': 'KE', 'south africa': 'ZA', 'new zealand': 'NZ',
  'ireland': 'IE', 'pakistan': 'PK', 'bangladesh': 'BD', 'sri lanka': 'LK',
};

const countryFlag = (countryName) => {
  if (!countryName) return null;
  const code = COUNTRY_CODE[countryName.toLowerCase()];
  if (!code) return null;
  return code.toUpperCase().replace(/./g, ch =>
    String.fromCodePoint(0x1F1E6 - 65 + ch.charCodeAt(0))
  );
};

// ─── Constants ─────────────────────────────────────────────────────────────
const TYPES = [
  { id: 'global',        label: 'Global',       icon: Globe,      gradient: 'from-violet-500 to-purple-600',  glow: 'shadow-violet-500/30' },
  { id: 'weekly',        label: 'Weekly',        icon: Zap,        gradient: 'from-sky-500 to-blue-600',       glow: 'shadow-sky-500/30'    },
  { id: 'monthly',       label: 'Monthly',       icon: Star,       gradient: 'from-amber-400 to-orange-500',   glow: 'shadow-amber-400/30'  },
  { id: 'mostImproved',  label: 'Most Improved', icon: TrendingUp, gradient: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/30'},
  { id: 'longestStreak', label: 'Streaks',       icon: Flame,      gradient: 'from-rose-500 to-red-600',      glow: 'shadow-rose-500/30'   },
];

const SCORE_FIELD = {
  global: 'overallScore', weekly: 'weeklyScore', monthly: 'monthlyScore',
  mostImproved: 'improvementPct', longestStreak: 'currentStreak',
};
const SCORE_SUFFIX  = { global:'', weekly:'', monthly:'', mostImproved:'%', longestStreak:'d' };
const SCORE_LABEL   = { global:'Score', weekly:'Weekly', monthly:'Monthly', mostImproved:'Improved', longestStreak:'Streak' };

const LEVEL_META = {
  Beginner:     { bg:'bg-slate-100 dark:bg-slate-800',   text:'text-slate-600 dark:text-slate-400',  dot:'bg-slate-400' },
  Intermediate: { bg:'bg-emerald-50 dark:bg-emerald-950',text:'text-emerald-700 dark:text-emerald-400', dot:'bg-emerald-500' },
  Advanced:     { bg:'bg-blue-50 dark:bg-blue-950',      text:'text-blue-700 dark:text-blue-400',    dot:'bg-blue-500' },
  Expert:       { bg:'bg-violet-50 dark:bg-violet-950',  text:'text-violet-700 dark:text-violet-400',dot:'bg-violet-500' },
  Master:       { bg:'bg-amber-50 dark:bg-amber-950',    text:'text-amber-700 dark:text-amber-400',  dot:'bg-amber-500' },
  Elite:        { bg:'bg-pink-50 dark:bg-pink-950',      text:'text-pink-700 dark:text-pink-400',    dot:'bg-pink-500' },
};

const PODIUM_CONFIG = [
  { rank:2, heightClass:'h-28', ringColor:'ring-slate-400',  medalColor:'from-slate-300 to-slate-500',   scoreTxt:'text-slate-400', scale:'scale-95' },
  { rank:1, heightClass:'h-40', ringColor:'ring-yellow-400', medalColor:'from-yellow-300 to-yellow-500', scoreTxt:'text-yellow-400', scale:'scale-100' },
  { rank:3, heightClass:'h-20', ringColor:'ring-amber-600',  medalColor:'from-amber-500 to-amber-700',   scoreTxt:'text-amber-600', scale:'scale-90' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
const getInitials = n => (n||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
const fmtScore = (v, type) => {
  if (v == null) return '—';
  const n = Math.round(v * 10) / 10;
  return `${n}${SCORE_SUFFIX[type]}`;
};

// ─── Shimmer skeleton ──────────────────────────────────────────────────────
const Shimmer = () => (
  <div className="animate-pulse flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
    <div className="w-9 h-4 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 rounded bg-gray-200 dark:bg-gray-700 w-36" />
      <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-24" />
    </div>
    <div className="w-14 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
  </div>
);

// ─── Avatar ────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 'md', ringClass = '' }) => {
  const sz = { sm:'w-8 h-8 text-xs', md:'w-11 h-11 text-sm', lg:'w-16 h-16 text-lg', xl:'w-20 h-20 text-xl' }[size];
  return (
    <div className={`${sz} rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-bold
      bg-gradient-to-br from-[#1FB6A6] to-[#1E2A5A] text-white
      ring-2 ${ringClass || 'ring-white/30 dark:ring-gray-700'} shadow-md`}>
      {user?.avatar
        ? <img src={user.avatar} alt={user.name||''} className="w-full h-full object-cover" />
        : <span>{getInitials(user?.name)}</span>}
    </div>
  );
};

// ─── Trend pill ────────────────────────────────────────────────────────────
const TrendPill = ({ change }) => {
  if (!change || change === 0) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
      <Minus className="w-2.5 h-2.5" />—
    </span>
  );
  const up = change > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full
      ${up ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400'
           : 'text-rose-500 bg-rose-50 dark:bg-rose-950 dark:text-rose-400'}`}>
      {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {up ? '+' : ''}{change}
    </span>
  );
};

// ─── Level badge ───────────────────────────────────────────────────────────
const LevelBadge = ({ level }) => {
  const m = LEVEL_META[level] || LEVEL_META.Beginner;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {level}
    </span>
  );
};

// ─── Score bar ─────────────────────────────────────────────────────────────
const ScoreBar = ({ value, type, rank }) => {
  const max    = type === 'longestStreak' ? 100 : 100;
  const pct    = Math.min(100, Math.max(0, (value || 0) / max * 100));
  const colors = [
    'from-yellow-400 to-amber-500',
    'from-slate-400 to-slate-500',
    'from-amber-600 to-amber-700',
  ];
  const barColor = rank <= 3 ? colors[rank - 1] : 'from-[#1FB6A6] to-[#17A293]';
  return (
    <div className="h-0.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
      <div className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700`}
        style={{ width: `${pct}%` }} />
    </div>
  );
};

// ─── Podium ────────────────────────────────────────────────────────────────
const Podium = ({ entries, type }) => {
  if (!entries || entries.length < 3) return null;
  // Reorder: 2nd | 1st | 3rd
  const ordered = [entries[1], entries[0], entries[2]];
  const scoreField = SCORE_FIELD[type];

  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex justify-center items-end pointer-events-none">
        <div className="w-64 h-32 bg-[#1FB6A6]/10 blur-3xl rounded-full" />
      </div>

      <div className="flex items-end justify-center gap-3 sm:gap-6 pt-10 pb-0 px-4 relative z-10">
        {ordered.map((entry, i) => {
          const cfg = PODIUM_CONFIG[i];
          const flag = countryFlag(entry.country);
          return (
            <div key={entry.userId} className={`flex flex-col items-center ${cfg.scale} transition-transform duration-300`}
              style={{ animation: `fadeInUp 0.5s ease both ${i * 0.12}s` }}>

              {/* Crown for #1 */}
              {cfg.rank === 1 && (
                <div className="mb-1 animate-bounce">
                  <Crown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                </div>
              )}

              {/* Avatar */}
              <div className="relative mb-3">
                <div className={`rounded-full overflow-hidden flex items-center justify-center font-bold text-white
                  ring-3 shadow-2xl bg-gradient-to-br from-[#1FB6A6] to-[#1E2A5A]
                  ${cfg.rank === 1 ? 'w-20 h-20 text-2xl ring-yellow-400 shadow-yellow-400/40' :
                    cfg.rank === 2 ? 'w-16 h-16 text-lg ring-slate-400' : 'w-14 h-14 text-base ring-amber-600'}`}>
                  {entry.avatar
                    ? <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
                    : <span>{getInitials(entry.name)}</span>}
                </div>

                {/* Rank medal */}
                <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full
                  bg-gradient-to-br ${cfg.medalColor} flex items-center justify-center shadow-md
                  text-[10px] font-black text-white border-2 border-white dark:border-gray-900`}>
                  {cfg.rank}
                </div>
              </div>

              {/* Name + flag + score */}
              <div className="text-center mb-3">
                <p className={`font-bold text-gray-900 dark:text-white truncate max-w-[90px]
                  ${cfg.rank === 1 ? 'text-base' : 'text-sm'}`}>{entry.name}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  {flag && <span className="text-base leading-none">{flag}</span>}
                  <LevelBadge level={entry.level} />
                </div>
                <p className={`mt-1.5 font-extrabold ${cfg.scoreTxt}
                  ${cfg.rank === 1 ? 'text-2xl' : 'text-lg'}`}>
                  {fmtScore(entry[scoreField], type)}
                </p>
              </div>

              {/* Platform block */}
              <div className={`${cfg.heightClass} w-24 sm:w-28 rounded-t-2xl flex items-end justify-center pb-2
                relative overflow-hidden border border-white/10
                ${cfg.rank === 1
                  ? 'bg-gradient-to-b from-yellow-400/20 via-yellow-500/10 to-transparent'
                  : cfg.rank === 2
                  ? 'bg-gradient-to-b from-slate-400/15 to-transparent'
                  : 'bg-gradient-to-b from-amber-600/15 to-transparent'}`}>
                <span className={`text-3xl font-black opacity-20 ${cfg.scoreTxt}`}>{cfg.rank}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Leaderboard row ───────────────────────────────────────────────────────
const Row = ({ entry, index, type, isMe }) => {
  const rank       = index + 1;
  const scoreField = SCORE_FIELD[type];
  const flag       = countryFlag(entry.country);
  const isTop3     = rank <= 3;

  return (
    <div className={`
      group flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 transition-all duration-200
      border-b border-gray-50 dark:border-gray-800/60 last:border-0
      ${isMe
        ? 'bg-gradient-to-r from-[#1FB6A6]/8 to-transparent border-l-[3px] border-l-[#1FB6A6] dark:from-[#1FB6A6]/15'
        : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/40'}
    `}>

      {/* Rank */}
      <div className="w-9 flex-shrink-0 flex flex-col items-center gap-0.5">
        {isTop3 ? (
          <span className={`text-lg font-black leading-none
            ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-400' : 'text-amber-600'}`}>
            {rank === 1 ? <Crown className="w-5 h-5" /> : rank === 2 ? <Medal className="w-4 h-4" /> : <Award className="w-4 h-4" />}
          </span>
        ) : (
          <span className="text-sm font-bold text-gray-400 dark:text-gray-500">#{rank}</span>
        )}
        <TrendPill change={entry.rankChange} />
      </div>

      {/* Avatar */}
      <Avatar user={entry} size="md" ringClass={isMe ? 'ring-[#1FB6A6]' : ''} />

      {/* Name block */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {flag && <span className="text-base leading-none" title={entry.country}>{flag}</span>}
          <span className={`font-semibold text-sm sm:text-[15px] leading-tight truncate
            ${isMe ? 'text-[#1FB6A6]' : 'text-gray-900 dark:text-white'}`}>
            {entry.name}
            {isMe && <span className="ml-1.5 text-[10px] font-medium text-[#1FB6A6] bg-[#1FB6A6]/10 px-1.5 py-0.5 rounded-full">you</span>}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <LevelBadge level={entry.level} />
          {(entry.badges || []).slice(0, 4).map((b, i) => (
            <span key={i} className="text-sm leading-none" title={b.name}>{b.icon}</span>
          ))}
          {(entry.badges || []).length > 4 && (
            <span className="text-[10px] text-gray-400">+{entry.badges.length - 4}</span>
          )}
        </div>
        <ScoreBar value={entry[scoreField]} type={type} rank={rank} />
      </div>

      {/* Streak */}
      <div className="hidden sm:flex flex-col items-center flex-shrink-0 w-12">
        <div className="flex items-center gap-0.5">
          <Flame className={`w-3.5 h-3.5 ${entry.currentStreak > 0 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}`} />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{entry.currentStreak || 0}</span>
        </div>
        <span className="text-[9px] text-gray-400">streak</span>
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-right min-w-[60px]">
        <div className={`font-extrabold tabular-nums
          ${rank === 1 ? 'text-xl text-yellow-400' : rank <= 3 ? 'text-lg text-[#1FB6A6]' : 'text-base text-gray-800 dark:text-gray-200'}`}>
          {fmtScore(entry[scoreField], type)}
        </div>
        <div className="text-[9px] text-gray-400 uppercase tracking-wide">{SCORE_LABEL[type]}</div>
      </div>
    </div>
  );
};

// ─── My Rank sticky bar ────────────────────────────────────────────────────
const MyRankBar = ({ entry, type }) => {
  if (!entry) return null;
  const rankFieldMap = { global:'globalRank', weekly:'weeklyRank', monthly:'monthlyRank', mostImproved:'mostImprovedRank', longestStreak:'streakRank' };
  const rankField = rankFieldMap[type] || 'globalRank';
  const scoreField = SCORE_FIELD[type];
  const flag = countryFlag(entry.country);
  return (
    <div className="sticky bottom-0 z-30 backdrop-blur-md bg-white/90 dark:bg-gray-900/90
      border-t-2 border-[#1FB6A6] shadow-[0_-4px_20px_rgba(31,182,166,0.15)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <span className="text-[10px] font-semibold text-[#1FB6A6] uppercase tracking-widest flex-shrink-0">Your Rank</span>
        <div className="flex items-center gap-1 bg-[#1FB6A6]/10 px-2 py-0.5 rounded-full flex-shrink-0">
          <Target className="w-3 h-3 text-[#1FB6A6]" />
          <span className="text-sm font-black text-[#1FB6A6]">#{entry[rankField] || '—'}</span>
        </div>
        <Avatar user={entry} size="sm" ringClass="ring-[#1FB6A6]" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {flag && <span className="text-sm leading-none">{flag}</span>}
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{entry.name}</span>
          </div>
        </div>
        <LevelBadge level={entry.level} />
        <div className="flex items-center gap-1 flex-shrink-0">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{entry.currentStreak}</span>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-base font-extrabold text-[#1FB6A6]">{fmtScore(entry[scoreField], type)}</div>
          <div className="text-[9px] text-gray-400 uppercase">{SCORE_LABEL[type]}</div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Leaderboard ──────────────────────────────────────────────────────
export default function Leaderboard() {
  const { user } = useAuthStore();
  const currentUserId = user?._id?.toString();

  const [activeType, setActiveType]         = useState('global');
  const [entries, setEntries]               = useState([]);
  const [myEntry, setMyEntry]               = useState(null);
  const [myOnPage, setMyOnPage]             = useState(false);
  const [loading, setLoading]               = useState(true);
  const [loadingMore, setLoadingMore]       = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [debouncedQ, setDebouncedQ]         = useState('');
  const [showFilters, setShowFilters]       = useState(false);
  const [filters, setFilters]               = useState({ level: '' });
  const [pagination, setPagination]         = useState({ page:1, hasMore:false, total:0 });
  const [refreshing, setRefreshing]         = useState(false);
  const [error, setError]                   = useState(null);
  const [myStats, setMyStats]               = useState(null);
  const debRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDebouncedQ(searchQuery), 350);
    return () => clearTimeout(debRef.current);
  }, [searchQuery]);

  const fetchEntries = useCallback(async (reset = true) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);
      const page = reset ? 1 : pagination.page + 1;
      const qs = new URLSearchParams({
        type: activeType, page, limit: 20,
        ...(debouncedQ ? { q: debouncedQ } : {}),
        ...(filters.level ? { level: filters.level } : {}),
      });
      const endpoint = debouncedQ ? `/leaderboard/search?${qs}` : `/leaderboard/top?${qs}`;
      const { data } = await api.get(endpoint);
      if (data.success) {
        const fresh = data.data.entries || [];
        setEntries(prev => reset ? fresh : [...prev, ...fresh]);
        setPagination({ page, hasMore: data.data.pagination?.hasMore || false, total: data.data.pagination?.total || 0 });
        setMyOnPage(fresh.some(e => e.userId?.toString() === currentUserId));
      }
      setError(null);
    } catch {
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeType, debouncedQ, filters, pagination.page, currentUserId]);

  const fetchMyEntry = useCallback(async () => {
    try {
      const { data } = await api.get(`/leaderboard/rank/me?type=${activeType}`);
      if (data.success) setMyEntry(data.data.userEntry || null);
    } catch { setMyEntry(null); }
  }, [activeType]);

  const fetchMyStats = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const { data } = await api.get(`/leaderboard/stats/me`);
      if (data.success) setMyStats(data.data);
    } catch { /* non-critical */ }
  }, [currentUserId]);

  useEffect(() => { fetchEntries(true); fetchMyEntry(); }, [activeType, debouncedQ, filters]); // eslint-disable-line
  useEffect(() => { fetchMyStats(); }, [fetchMyStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await api.post('/leaderboard/admin/refresh'); await fetchEntries(true); await fetchMyEntry(); }
    catch { /* non-admin gets 403, silently ignore */ }
    finally { setRefreshing(false); }
  };

  const activeTypeMeta = TYPES.find(t => t.id === activeType);
  const LEVELS = ['Beginner','Intermediate','Advanced','Expert','Master','Elite'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f1a] pb-24">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f1a3a] via-[#12224d] to-[#0a0f24]">
        {/* Grid texture overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize:'28px 28px' }} />
        {/* Glow orbs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#1FB6A6]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/3 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-2">

          {/* Title row */}
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1FB6A6] to-[#0d8a7d] flex items-center justify-center shadow-lg shadow-[#1FB6A6]/40">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">Leaderboard</h1>
                  <p className="text-xs text-blue-300/70 mt-0.5">Global Speaker Rankings</p>
                </div>
              </div>
              {pagination.total > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Users className="w-3.5 h-3.5 text-blue-300/60" />
                  <span className="text-xs text-blue-200/60">{pagination.total.toLocaleString()} speakers competing</span>
                </div>
              )}
            </div>

            {/* My quick stats */}
            {myStats && (
              <div className="hidden sm:flex gap-3">
                {[
                  { label:'Avg Score', val: `${myStats.avgScore || 0}` },
                  { label:'Sessions',  val: myStats.totalSessions || 0 },
                  { label:'Streak',    val: `${myStats.currentStreak || 0}d` },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center backdrop-blur-sm">
                    <div className="text-base font-black text-white">{s.val}</div>
                    <div className="text-[10px] text-blue-200/60 uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleRefresh} disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/8 hover:bg-white/15 border border-white/10
                text-xs text-blue-200 transition-all backdrop-blur-sm flex-shrink-0">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* ── Type tabs ──────────────────────────────────────────────── */}
          <div className="mt-6 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {TYPES.map(tab => {
              const Icon    = tab.icon;
              const isActive = activeType === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveType(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap
                    transition-all duration-300 flex-shrink-0 border
                    ${isActive
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg ${tab.glow} border-transparent`
                      : 'bg-white/5 text-blue-200/70 hover:bg-white/10 border-white/10'}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Podium ────────────────────────────────────────────────────── */}
      {!loading && !debouncedQ && entries.length >= 3 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800
            shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden">
            <div className="px-6 pt-4 pb-0 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">🏆 Top 3</span>
              <span className="text-xs text-gray-400">{activeTypeMeta?.label} Leaders</span>
            </div>
            <Podium entries={entries} type={activeType} />
          </div>
        </div>
      )}

      {/* ── Search + Filters ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Search speakers…"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FB6A6]/50 focus:border-[#1FB6A6]
                shadow-sm transition-all" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm
              ${showFilters || filters.level
                ? 'border-[#1FB6A6] text-[#1FB6A6] bg-[#1FB6A6]/5 dark:bg-[#1FB6A6]/10'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400'}`}>
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {filters.level && <span className="w-1.5 h-1.5 rounded-full bg-[#1FB6A6]" />}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-2 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Communication Level</label>
                <select value={filters.level} onChange={e => setFilters(p => ({ ...p, level: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm
                    bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1FB6A6]/50">
                  <option value="">All Levels</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button onClick={() => setFilters({ level: '' })}
                className="text-sm text-rose-500 hover:text-rose-700 font-medium pt-4">Clear</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Main table ────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800
          shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">

          {/* Table header */}
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 bg-gray-50/80 dark:bg-gray-800/50
            border-b border-gray-100 dark:border-gray-800">
            <span className="w-9 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rank</span>
            <span className="w-11 opacity-0 flex-shrink-0">·</span>
            <span className="flex-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Speaker</span>
            <span className="hidden sm:block w-12 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Streak</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right min-w-[60px]">{SCORE_LABEL[activeType]}</span>
          </div>

          {/* Loading */}
          {loading && Array.from({ length: 10 }).map((_, i) => <Shimmer key={i} />)}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center">
                <X className="w-8 h-8 text-rose-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
              <button onClick={() => fetchEntries(true)}
                className="px-4 py-2 rounded-lg bg-[#1FB6A6] text-white text-sm font-medium">Retry</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && entries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1FB6A6]/10 to-[#1E2A5A]/5 flex items-center justify-center">
                <Users className="w-10 h-10 text-[#1FB6A6]" />
              </div>
              <h3 className="text-gray-700 dark:text-gray-300 font-semibold">No speakers found</h3>
              <p className="text-sm text-gray-400 text-center max-w-xs">
                {debouncedQ ? `No results for "${debouncedQ}".` : 'Complete a practice session to appear here!'}
              </p>
              {debouncedQ && <button onClick={() => setSearchQuery('')} className="text-sm text-[#1FB6A6] hover:underline">Clear search</button>}
            </div>
          )}

          {/* Rows */}
          {!loading && !error && entries.map((entry, i) => (
            <Row key={entry.userId} entry={entry} index={i} type={activeType}
              isMe={entry.userId?.toString() === currentUserId} />
          ))}

          {/* Load more */}
          {!loading && pagination.hasMore && (
            <div className="flex justify-center py-4 border-t border-gray-50 dark:border-gray-800">
              <button onClick={() => fetchEntries(false)} disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl
                  bg-gradient-to-r from-[#1FB6A6] to-[#17A293] text-white text-sm font-semibold
                  hover:shadow-lg hover:shadow-[#1FB6A6]/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-60">
                {loadingMore
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Loading…</>
                  : <><ChevronDown className="w-4 h-4" /> Load More</>}
              </button>
            </div>
          )}
        </div>

        {/* ── Info panels ─────────────────────────────────────────────── */}
        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 mb-6">
            {/* Score formula */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-[#1FB6A6]" />
                <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Score Formula</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label:'Communication', pct:40, color:'bg-[#1FB6A6]' },
                  { label:'Confidence',    pct:20, color:'bg-blue-500' },
                  { label:'Consistency',   pct:15, color:'bg-violet-500' },
                  { label:'Improvement',   pct:15, color:'bg-amber-500' },
                  { label:'Streak',        pct:10, color:'bg-orange-500' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-28">{item.label}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width:`${item.pct * 2.5}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-7 text-right">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Level guide */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-[#1FB6A6]" />
                <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Level Guide</h3>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { level:'Beginner',     pts:'0–199' },
                  { level:'Intermediate', pts:'200–499' },
                  { level:'Advanced',     pts:'500–999' },
                  { level:'Expert',       pts:'1K–1.9K' },
                  { level:'Master',       pts:'2K–3.9K' },
                  { level:'Elite',        pts:'4K+' },
                ].map(({ level, pts }) => {
                  const m = LEVEL_META[level];
                  return (
                    <div key={level} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${m.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.dot} flex-shrink-0`} />
                      <span className={`text-[10px] font-semibold ${m.text} leading-tight`}>{level}</span>
                      <span className="text-[10px] text-gray-400 ml-auto">{pts}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky my-rank bar ───────────────────────────────────────── */}
      {myEntry && !myOnPage && <MyRankBar entry={myEntry} type={activeType} />}
    </div>
  );
}
