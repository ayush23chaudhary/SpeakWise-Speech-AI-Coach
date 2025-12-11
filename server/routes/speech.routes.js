const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const AnalysisReport = require("../models/AnalysisReport.model");
const User = require("../models/User.model");
const auth = require("../middleware/auth");
const { analyzeSpeech } = require("../controllers/speech.controller");

const router = express.Router();

// Azure Speech Service Route
router.get("/speech-token", auth, async (req, res) => {
    try {
        const speechKey = process.env.AZURE_SPEECH_KEY;
        const speechRegion = process.env.AZURE_SPEECH_REGION;
        
        if (!speechKey || !speechRegion) {
            return res.status(400).json({ 
                error: 'Azure Speech Service credentials not configured' 
            });
        }

        res.json({ 
            token: speechKey,
            region: speechRegion
        });
    } catch (error) {
        console.error('Error getting speech token:', error);
        res.status(500).json({ error: 'Failed to get speech token' });
    }
});


// Configure Multer for file uploads - Use memoryStorage for Google Speech API
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /webm|wav|mp3|ogg|flac/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed!"));
    }
  },
});

// Mock AI analysis function
const generateMockAnalysis = () => {
    const fillerWords = ["um", "ah", "uh", "like", "you know", "so", "well"];
    const transcript =
        "Hello, this is a sample speech analysis. Um, I think that speaking clearly is important. Ah, it helps with communication. You know, when we speak with confidence, people listen better. So, practice makes perfect.";

    // Generate random filler word counts
    const fillerWordCounts = {};
    fillerWords.forEach((word) => {
        fillerWordCounts[word] = Math.floor(Math.random() * 8);
    });

    const totalFillerWords = Object.values(fillerWordCounts).reduce(
        (sum, count) => sum + count,
        0
    );

    // Generate scores
    const clarityScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const confidenceScore = Math.floor(Math.random() * 25) + 75; // 75-100
    const fluencyScore = Math.floor(Math.random() * 20) + 80; // 80-100
    const paceScore = Math.floor(Math.random() * 35) + 65; // 65-100
    const toneScore = Math.floor(Math.random() * 25) + 75; // 75-100

    const overallScore = Math.round(
        (clarityScore +
            confidenceScore +
            fluencyScore +
            paceScore +
            toneScore) /
            5
    );

    return {
        overallScore,
        transcript,
        metrics: {
            clarity: clarityScore,
            confidence: confidenceScore,
            fluency: fluencyScore,
            pace: paceScore,
            tone: toneScore,
        },
        fillerWords: fillerWordCounts,
        totalFillerWords,
        pace: {
            wordsPerMinute: Math.floor(Math.random() * 40) + 140, // 140-180 WPM
            status:
                Math.random() > 0.5
                    ? "Good"
                    : Math.random() > 0.5
                    ? "Too Fast"
                    : "Too Slow",
        },
        recommendations: [
            "Try to reduce filler words like 'um' and 'ah'",
            "Practice speaking at a steady pace",
            "Work on projecting confidence in your voice",
            "Consider pausing instead of using filler words",
        ],
        strengths: [
            "Good vocal clarity",
            "Appropriate volume level",
            "Clear pronunciation",
        ],
        areasForImprovement: [
            "Reduce filler word usage",
            "Maintain consistent pace",
            "Build more confidence in delivery",
        ],
    };
};

// Base URL: api/speech
router.get("/", (req, res) => {
    res.status(200).json({ message: "Speech routes are working" });
});

// Analyze speech - Uses Google Speech-to-Text API
router.post("/analyze", upload.single("audio"), analyzeSpeech);

// Get analysis history
router.get("/history", auth, async (req, res) => {
    try {
        console.log('📋 Fetching history for user:', req.user._id);
        
        const reports = await AnalysisReport.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        console.log('   - Found reports:', reports.length);
        
        res.json({ reports });
    } catch (error) {
        console.error("History fetch error:", error);
        res.status(500).json({ message: "Failed to fetch history" });
    }
});

// Get specific analysis report
router.get("/report/:id", auth, async (req, res) => {
    try {
        console.log('📄 Fetching report:', req.params.id);
        
        const report = await AnalysisReport.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        console.log('   - Report found:', report._id);

        res.json({
            report: {
                id: report._id,
                transcript: report.transcript,
                overallScore: report.overallScore,
                metrics: report.metrics,
                pace: report.pace,
                fillerWords: report.fillerWords,
                strengths: report.strengths,
                areasForImprovement: report.areasForImprovement,
                recommendations: report.recommendations,
                createdAt: report.createdAt,
            },
        });
    } catch (error) {
        console.error("Report fetch error:", error);
        res.status(500).json({ message: "Failed to fetch report" });
    }
});

// ============================================
// GUEST FEEDBACK ROUTES (Admin/Analytics)
// ============================================

const GuestFeedback = require("../models/GuestFeedback.model");

/**
 * GET /api/speech/guest-feedback/analytics
 * Get guest feedback analytics for the past N days
 * Query params: days (default: 30)
 * Auth: Admin only (you can add admin middleware)
 */
router.get("/guest-feedback/analytics", auth, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        
        // Get analytics from static method
        const analytics = await GuestFeedback.getAnalytics(days);
        
        // Get recent guest feedback count
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const totalGuests = await GuestFeedback.countDocuments({
            createdAt: { $gte: startDate }
        });
        
        // Get score distribution
        const scoreDistribution = await GuestFeedback.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $bucket: {
                    groupBy: "$overallScore",
                    boundaries: [0, 50, 60, 70, 80, 90, 100],
                    default: "Other",
                    output: {
                        count: { $sum: 1 },
                        avgScore: { $avg: "$overallScore" }
                    }
                }
            }
        ]);
        
        res.json({
            success: true,
            data: {
                period: `${days} days`,
                totalGuestRecordings: totalGuests,
                analytics: analytics[0] || {},
                scoreDistribution
            }
        });
    } catch (error) {
        console.error("Guest analytics error:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch guest analytics" 
        });
    }
});

/**
 * GET /api/speech/guest-feedback/recent
 * Get recent guest feedback entries
 * Query params: limit (default: 50), page (default: 1)
 * Auth: Admin only
 */
router.get("/guest-feedback/recent", auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        
        const feedbacks = await GuestFeedback.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .select('-ipAddress -userAgent') // Exclude sensitive data
            .lean();
        
        const total = await GuestFeedback.countDocuments();
        
        res.json({
            success: true,
            data: {
                feedbacks,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Guest feedback fetch error:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch guest feedback" 
        });
    }
});

/**
 * GET /api/speech/guest-feedback/:id
 * Get specific guest feedback by ID
 * Auth: Admin only
 */
router.get("/guest-feedback/:id", auth, async (req, res) => {
    try {
        const feedback = await GuestFeedback.findById(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({ 
                success: false,
                message: "Guest feedback not found" 
            });
        }
        
        res.json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error("Guest feedback fetch error:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch guest feedback" 
        });
    }
});

/**
 * DELETE /api/speech/guest-feedback/cleanup
 * Anonymize expired guest data (GDPR compliance)
 * Auth: Admin only
 */
router.delete("/guest-feedback/cleanup", auth, async (req, res) => {
    try {
        const result = await GuestFeedback.anonymizeExpiredData();
        
        res.json({
            success: true,
            message: `Anonymized ${result.modifiedCount} expired guest records`,
            data: result
        });
    } catch (error) {
        console.error("Guest cleanup error:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to cleanup guest data" 
        });
    }
});

module.exports = router;
