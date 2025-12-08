const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['pronunciation', 'fluency', 'pacing', 'confidence', 'vocabulary', 'filler-words', 'tone', 'articulation'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    instructions: [{
        step: Number,
        text: String
    }],
    practiceText: String, // Optional text for reading exercises
    targetMetrics: {
        minClarity: Number,
        maxFillerWords: Number,
        targetPace: { 
            min: Number, 
            max: Number 
        }
    },
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Exercise', exerciseSchema);
