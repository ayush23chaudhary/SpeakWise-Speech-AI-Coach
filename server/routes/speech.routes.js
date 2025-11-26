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

module.exports = router;
