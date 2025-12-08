const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    completedExercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.Mixed, // Changed from ObjectId to Mixed to support both ObjectId and string IDs
            // Can be either an ObjectId (for real exercises) or a string (for daily challenges, AI activities)
        },
        analysisReportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AnalysisReport'
        },
        completedAt: Date,
        performance: {
            clarity: Number,
            fluency: Number,
            pace: Number,
            fillerWords: Number
        },
        feedback: String
    }],
    dailyStreak: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastPracticeDate: Date
    },
    weakAreas: [{
        category: String,
        severity: { type: String, enum: ['low', 'medium', 'high'] },
        identifiedAt: Date
    }],
    achievements: [{
        title: String,
        description: String,
        earnedAt: Date,
        icon: String
    }],
    skillLevels: {
        pronunciation: { type: Number, default: 0, max: 100 },
        fluency: { type: Number, default: 0, max: 100 },
        pacing: { type: Number, default: 0, max: 100 },
        confidence: { type: Number, default: 0, max: 100 },
        vocabulary: { type: Number, default: 0, max: 100 }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserProgress', userProgressSchema);
