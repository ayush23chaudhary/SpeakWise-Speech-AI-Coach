const express = require("express");
const { body } = require("express-validator");
const passport = require('passport');
const jwt = require('jsonwebtoken');
// const { body, validationResult } = require("express-validator");
const {
    handleRegister,
    handleLogin,
    currentUser,
    updateProfile,
    getUserStats,
    getEnhancedStats,
    getSessionHistory,
    getUserAchievements,
    updatePreferences,
    checkAndAwardBadges,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

// initialize router
const router = express.Router();

// Base URL: api/auth
router.get("/", (req, res) => {
    res.status(200).json({ message: "Auth routes are working" });
});



// Register
router.post(
    "/register",
    [
        body("name")
            .trim()
            .isLength({ min: 2 })
            .withMessage("Name must be at least 2 characters"),
        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Please provide a valid email"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
    ],
    handleRegister
);

// Login
router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Please provide a valid email"),
        body("password").exists().withMessage("Password is required"),
    ],
    handleLogin
);

// Get current user
router.get("/me", auth, currentUser);

// Update user profile
router.put("/profile", auth, updateProfile);

// Get user statistics
router.get("/profile/stats", auth, getUserStats);

// Get enhanced statistics with analytics
router.get("/profile/enhanced-stats", auth, getEnhancedStats);

// Get session history
router.get("/profile/sessions", auth, getSessionHistory);

// Get user achievements
router.get("/profile/achievements", auth, getUserAchievements);

// Update user preferences
router.put("/profile/preferences", auth, updatePreferences);

// ============================================
// OAUTH 2.0 ROUTES (Google & GitHub SSO)
// ============================================

/**
 * Google OAuth Routes
 */

// Initiate Google OAuth
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

// Google OAuth Callback
router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3001'}/auth?error=google_auth_failed`
    }),
    (req, res) => {
        try {
            // Generate JWT token for authenticated user
            const token = jwt.sign(
                { userId: req.user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Redirect to frontend with token
            const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/auth/callback?token=${token}&provider=google`;
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('❌ Google callback error:', error);
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}/auth?error=token_generation_failed`);
        }
    }
);

/**
 * GitHub OAuth Routes
 */

// Initiate GitHub OAuth
router.get(
    '/github',
    passport.authenticate('github', {
        scope: ['user:email'],
        session: false
    })
);

// GitHub OAuth Callback
router.get(
    '/github/callback',
    passport.authenticate('github', {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3001'}/auth?error=github_auth_failed`
    }),
    (req, res) => {
        try {
            // Generate JWT token for authenticated user
            const token = jwt.sign(
                { userId: req.user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Redirect to frontend with token
            const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/auth/callback?token=${token}&provider=github`;
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('❌ GitHub callback error:', error);
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}/auth?error=token_generation_failed`);
        }
    }
);

// Check and award badges retroactively
router.post('/profile/check-badges', auth, checkAndAwardBadges);

module.exports = router;
