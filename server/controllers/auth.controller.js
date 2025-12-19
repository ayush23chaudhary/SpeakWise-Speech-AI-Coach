const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { validationResult } = require("express-validator");

// @desc Register a User
// @route POST /api/auth/register
// @access Public

const handleRegister = async (req, res) => {
    try {
        console.log('Registration request received:', {
            body: req.body,
            headers: req.headers
        });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        const user = new User({ name, email, password });
        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error" });
    }

    // debug
    // res.status(200).json({ message: "Register route working" });
};

// @desc Login a User
// @route POST /api/auth/login
// @access Public

const handleLogin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }

    // debug
    // res.status(200).json({ message: "Login route working" });
};

// @desc Get Current User
// @route GET /api/auth/current
// @access private

const currentUser = async (req, res) => {
    console.log('👤 Current user request for:', req.user?.email);
    res.json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
            phone: req.user.phone,
            location: req.user.location,
            bio: req.user.bio,
            provider: req.user.provider,
            createdAt: req.user.createdAt,
            updatedAt: req.user.updatedAt
        },
    });
};

// @desc Update User Profile
// @route PUT /api/auth/profile
// @access private

const updateProfile = async (req, res) => {
    try {
        const { name, phone, location, bio, avatar } = req.body;
        const userId = req.user._id;

        console.log('📝 Updating profile for:', req.user.email);

        // Find user and update
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (location !== undefined) user.location = location;
        if (bio !== undefined) user.bio = bio;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        console.log('✅ Profile updated successfully for:', user.email);

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                phone: user.phone,
                location: user.location,
                bio: user.bio,
                provider: user.provider,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('❌ Profile update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get User Stats
// @route GET /api/auth/profile/stats
// @access private

const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const AnalysisReport = require('../models/AnalysisReport.model');

        // Get all analysis reports for user
        const reports = await AnalysisReport.find({ userId }).sort({ createdAt: -1 });

        // Calculate stats
        const totalSessions = reports.length;
        const averageScore = totalSessions > 0
            ? Math.round(reports.reduce((sum, report) => sum + (report.overallScore || 0), 0) / totalSessions)
            : 0;

        // Calculate improvement rate (compare last 5 vs first 5 sessions)
        let improvementRate = 0;
        if (totalSessions >= 10) {
            const recentAvg = reports.slice(0, 5).reduce((sum, r) => sum + (r.overallScore || 0), 0) / 5;
            const oldAvg = reports.slice(-5).reduce((sum, r) => sum + (r.overallScore || 0), 0) / 5;
            improvementRate = Math.round(((recentAvg - oldAvg) / oldAvg) * 100);
        }

        // Calculate total practice time (in minutes)
        const totalPracticeTime = Math.round(reports.reduce((sum, report) => {
            return sum + (report.duration || 0);
        }, 0) / 60);

        res.json({
            stats: {
                totalSessions,
                averageScore,
                improvementRate: improvementRate > 0 ? improvementRate : 0,
                totalPracticeTime
            }
        });
    } catch (error) {
        console.error('❌ Error fetching user stats:', error);
        res.json({
            stats: {
                totalSessions: 0,
                averageScore: 0,
                improvementRate: 0,
                totalPracticeTime: 0
            }
        });
    }
};

// @desc Get Enhanced User Stats with detailed analytics
// @route GET /api/auth/profile/enhanced-stats
// @access private
const getEnhancedStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const AnalysisReport = require('../models/AnalysisReport.model');
        const { startOfDay, subDays, format } = require('date-fns');
        const AchievementService = require('../services/achievement.service');
        const StreakService = require('../services/streak.service');

        const user = await User.findById(userId);
        const reports = await AnalysisReport.find({ user: userId }).sort({ createdAt: 1 });

        // Basic stats
        const totalSessions = reports.length;
        const averageScore = totalSessions > 0
            ? Math.round(reports.reduce((sum, r) => sum + (r.overallScore || 0), 0) / totalSessions)
            : 0;

        // Skill breakdown (average of each metric)
        const skillBreakdown = {
            pronunciation: 0,
            fluency: 0,
            clarity: 0,
            confidence: 0,
            pace: 0,
            vocabulary: 0,
            grammar: 0
        };

        if (totalSessions > 0) {
            reports.forEach(report => {
                if (report.metrics) {
                    skillBreakdown.pronunciation += report.metrics.pronunciation || 0;
                    skillBreakdown.fluency += report.metrics.fluency || 0;
                    skillBreakdown.clarity += report.metrics.clarity || 0;
                    skillBreakdown.confidence += report.metrics.confidence || 0;
                    skillBreakdown.pace += report.metrics.pace || 0;
                    skillBreakdown.vocabulary += report.metrics.vocabulary || 0;
                    skillBreakdown.grammar += report.metrics.grammar || 0;
                }
            });

            Object.keys(skillBreakdown).forEach(skill => {
                skillBreakdown[skill] = Math.round(skillBreakdown[skill] / totalSessions);
            });
        }

        // Progress timeline (last 30 days)
        const progressTimeline = reports.slice(-30).map(report => ({
            date: report.createdAt,
            score: report.overallScore,
            duration: report.duration
        }));

        // Practice heatmap (last 90 days)
        const practiceHeatmap = {};
        const last90Days = subDays(new Date(), 90);
        reports.filter(r => new Date(r.createdAt) >= last90Days).forEach(report => {
            const dateKey = format(new Date(report.createdAt), 'yyyy-MM-dd');
            practiceHeatmap[dateKey] = (practiceHeatmap[dateKey] || 0) + 1;
        });

        // Improvement trends
        let improvementRate = 0;
        if (totalSessions >= 10) {
            const recentAvg = reports.slice(-5).reduce((sum, r) => sum + r.overallScore, 0) / 5;
            const oldAvg = reports.slice(0, 5).reduce((sum, r) => sum + r.overallScore, 0) / 5;
            improvementRate = Math.round(((recentAvg - oldAvg) / oldAvg) * 100);
        }

        // Total practice time
        const totalPracticeTime = Math.round(reports.reduce((sum, r) => sum + (r.duration || 0), 0) / 60);

        // Peak practice times
        const hourCounts = {};
        reports.forEach(report => {
            const hour = new Date(report.createdAt).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        // Streak stats
        const streakStats = await StreakService.getStreakStats(userId);

        // Most improved areas
        const mostImprovedAreas = [];
        if (reports.length >= 5) {
            const oldReports = reports.slice(0, 5);
            const newReports = reports.slice(-5);
            
            Object.keys(skillBreakdown).forEach(skill => {
                const oldAvg = oldReports.reduce((sum, r) => sum + (r.metrics?.[skill] || 0), 0) / 5;
                const newAvg = newReports.reduce((sum, r) => sum + (r.metrics?.[skill] || 0), 0) / 5;
                const improvement = newAvg - oldAvg;
                if (improvement > 0) {
                    mostImprovedAreas.push({ skill, improvement: Math.round(improvement) });
                }
            });
            mostImprovedAreas.sort((a, b) => b.improvement - a.improvement);
        }

        res.json({
            basicStats: {
                totalSessions,
                averageScore,
                improvementRate,
                totalPracticeTime
            },
            skillBreakdown,
            progressTimeline,
            practiceHeatmap,
            streakStats,
            mostImprovedAreas: mostImprovedAreas.slice(0, 3),
            peakPracticeHours: Object.entries(hourCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        });
    } catch (error) {
        console.error('❌ Error fetching enhanced stats:', error);
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

// @desc Get user's session history
// @route GET /api/auth/profile/sessions
// @access private
const getSessionHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, search = '', sortBy = 'createdAt', order = 'desc' } = req.query;
        const AnalysisReport = require('../models/AnalysisReport.model');

        const query = { user: userId };
        
        // Add search filter if provided
        if (search) {
            query.transcript = { $regex: search, $options: 'i' };
        }

        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        const sessions = await AnalysisReport.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await AnalysisReport.countDocuments(query);

        res.json({
            sessions,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalSessions: count
        });
    } catch (error) {
        console.error('❌ Error fetching session history:', error);
        res.status(500).json({ message: 'Error fetching sessions', error: error.message });
    }
};

// @desc Get user's achievements
// @route GET /api/auth/profile/achievements
// @access private
const getUserAchievements = async (req, res) => {
    try {
        const userId = req.user._id;
        const AchievementService = require('../services/achievement.service');
        
        const achievements = await AchievementService.getUserAchievements(userId);
        
        res.json({ achievements });
    } catch (error) {
        console.error('❌ Error fetching achievements:', error);
        res.status(500).json({ message: 'Error fetching achievements', error: error.message });
    }
};

// @desc Update user preferences
// @route PUT /api/auth/profile/preferences
// @access private
const updatePreferences = async (req, res) => {
    try {
        const userId = req.user._id;
        const { preferences, privacySettings, socialLinks } = req.body;

        const updateData = {};
        if (preferences) updateData.preferences = preferences;
        if (privacySettings) updateData.privacySettings = privacySettings;
        if (socialLinks) updateData.socialLinks = socialLinks;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        res.json({ user });
    } catch (error) {
        console.error('❌ Error updating preferences:', error);
        res.status(500).json({ message: 'Error updating preferences', error: error.message });
    }
};

// @desc Retroactively award badges to current user
// @route POST /api/auth/profile/check-badges
// @access private
const checkAndAwardBadges = async (req, res) => {
    try {
        const userId = req.user._id;
        const AchievementService = require('../services/achievement.service');
        
        const newBadges = await AchievementService.checkAndAwardBadges(userId);
        
        res.json({ 
            message: newBadges.length > 0 ? 'New badges awarded!' : 'No new badges to award',
            newBadges,
            count: newBadges.length
        });
    } catch (error) {
        console.error('❌ Error checking badges:', error);
        res.status(500).json({ message: 'Error checking badges', error: error.message });
    }
};

module.exports = { 
    handleRegister, 
    handleLogin, 
    currentUser, 
    updateProfile, 
    getUserStats,
    getEnhancedStats,
    getSessionHistory,
    getUserAchievements,
    updatePreferences,
    checkAndAwardBadges
};
