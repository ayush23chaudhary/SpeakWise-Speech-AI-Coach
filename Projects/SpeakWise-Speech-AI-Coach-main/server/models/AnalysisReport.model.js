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
  },
  pace: {
    wordsPerMinute: { type: Number },
    status: { type: String },
  },
  fillerWords: { type: Map, of: Number },
  strengths: [String],
  areasForImprovement: [String],
  recommendations: [String],
}, { timestamps: true });

module.exports = mongoose.model('AnalysisReport', AnalysisReportSchema);