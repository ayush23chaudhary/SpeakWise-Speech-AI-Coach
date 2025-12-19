// server/models/AnalysisReport.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalysisReportSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transcript: { type: String, required: true },
  overallScore: { type: Number, required: true },
  metrics: {
    clarity: { type: Number },
    confidence: { type: Number },
    fluency: { type: Number },
    pace: { type: Number },
    tone: { type: Number },
    pronunciation: { type: Number }, // Added for skill breakdown
    vocabulary: { type: Number }, // Added for skill breakdown
    grammar: { type: Number }, // Added for skill breakdown
  },
  pace: {
    wordsPerMinute: { type: Number },
    status: { type: String },
  },
  fillerWords: { type: Map, of: Number },
  strengths: [String],
  areasForImprovement: [String],
  recommendations: [String],
  // Additional tracking fields
  duration: { type: Number }, // Duration in seconds
  wordCount: { type: Number }, // Total words spoken
  exerciseType: { 
    type: String,
    enum: ['conversation', 'presentation', 'interview', 'reading', 'freestyle'],
    default: 'freestyle'
  },
  audioUrl: { type: String }, // Store audio recording if needed
}, { timestamps: true });

module.exports = mongoose.model('AnalysisReport', AnalysisReportSchema);