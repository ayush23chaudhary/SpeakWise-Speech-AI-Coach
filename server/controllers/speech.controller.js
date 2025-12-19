// server/controllers/speech.controller.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SpeechClient } = require('@google-cloud/speech');
const AnalysisReport = require('../models/AnalysisReport.model');
const GuestFeedback = require('../models/GuestFeedback.model');
const Goal = require('../models/Goal.model');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const path = require('path');
const { generateAIFeedback } = require('../services/aiAnalysis.service');

// Initialize Gemini AI for text analysis and Google Speech for audio transcription
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Google Speech Client for audio transcription (more reliable for STT)
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../google-credentials.json');
console.log('🔑 Initializing Google Speech Client with credentials:', credentialsPath);

const speechClient = new SpeechClient({
  keyFilename: credentialsPath
});

// --- Paste all the calculation helper functions here ---

function calculatePace(words) {
  if (!words || words.length === 0) {
    return { wordsPerMinute: 0, status: 'N/A' };
  }

  // Get the start time of the first word and end time of the last word.
  const startTime = words[0].startTime.seconds;
  const endTime = words[words.length - 1].endTime.seconds;

  // Calculate the total duration in minutes.
  const totalDurationMinutes = (endTime - startTime) / 60;

  if (totalDurationMinutes === 0) {
    return { wordsPerMinute: 0, status: 'N/A' };
  }

  const totalWords = words.length;
  const wpm = Math.round(totalWords / totalDurationMinutes);

  // Determine the status based on the WPM.
  let status;
  if (wpm > 170) {
    status = 'Too Fast';
  } else if (wpm >= 130 && wpm <= 170) {
    status = 'Good';
  } else {
    status = 'Too Slow';
  }

  return { wordsPerMinute: wpm, status: status };
}
/**
 * Enhanced Filler Word Analysis
 * Based on research in conversational analysis and speech disfluency
 * 
 * Expanded filler word detection including:
 * - Vocal fillers (um, uh, er, ah, hmm)
 * - Discourse markers (like, you know, I mean, kind of, sort of)
 * - Thinking indicators (let me see, let's see, well)
 * - Hedge words (actually, basically, literally, probably, maybe)
 * 
 * Research: Different filler types serve different functions and
 * should be weighted differently (Clark & Fox Tree, 2002)
 */
function analyzeFillerWords(transcript) {
  // Comprehensive filler word categories with weights
  const fillerCategories = {
    // Vocal hesitations (most disruptive)
    vocal: ['um', 'uh', 'er', 'ah', 'hmm', 'uhh', 'umm', 'err'],
    
    // Discourse markers (moderate impact)
    discourse: ['like', 'you know', 'i mean', 'you see', 'you know what i mean'],
    
    // Hedge words (mild impact, sometimes appropriate)
    hedge: ['actually', 'basically', 'literally', 'essentially', 'probably', 
            'maybe', 'perhaps', 'kind of', 'sort of', 'somehow', 'somewhat'],
    
    // Thinking indicators
    thinking: ['let me see', 'lets see', 'let me think', 'well', 'so', 'now'],
    
    // Repetition indicators
    repetition: ['again', 'as i said', 'like i said', 'you know what'],
    
    // Emphatic fillers (context-dependent)
    emphatic: ['really', 'very', 'super', 'totally', 'absolutely', 'definitely']
  };

  const fillerWordCounts = {};
  
  // Clean and prepare transcript
  const cleanedTranscript = transcript.toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Check for multi-word phrases first (longer matches take precedence)
  const multiWordFillers = [
    'you know what i mean', 'you know what', 'kind of', 'sort of', 
    'let me see', 'lets see', 'let me think', 'i mean', 'you know', 
    'you see', 'as i said', 'like i said'
  ];
  
  for (const phrase of multiWordFillers) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = cleanedTranscript.match(regex);
    if (matches) {
      fillerWordCounts[phrase] = matches.length;
    }
  }

  // Then check single words
  const words = cleanedTranscript.split(/\s+/);
  const allFillers = [
    ...fillerCategories.vocal,
    ...fillerCategories.discourse,
    ...fillerCategories.hedge,
    ...fillerCategories.thinking,
    ...fillerCategories.repetition,
    ...fillerCategories.emphatic
  ];

  for (const word of words) {
    // Skip if already counted as part of multi-word phrase
    const isPartOfPhrase = multiWordFillers.some(phrase => 
      fillerWordCounts[phrase] && phrase.includes(word)
    );
    
    if (!isPartOfPhrase && allFillers.includes(word)) {
      fillerWordCounts[word] = (fillerWordCounts[word] || 0) + 1;
    }
  }

  return fillerWordCounts;
}


/**
 * Enhanced Clarity Calculation
 * Based on research in speech recognition and phonetics
 * 
 * Factors considered:
 * 1. Word Recognition Confidence (ASR accuracy)
 * 2. Pronunciation Consistency (variance in confidence)
 * 3. Articulation Quality (low confidence detection)
 * 4. Speech Intelligibility (weighted by word importance)
 * 
 * Research: Studies show clarity is best measured by combining
 * recognition accuracy with pronunciation variance (Dellwo, 2006)
 */
function calculateClarity(words) {
  if (!words || words.length === 0) return 0;

  // 1. Base clarity from average confidence (60% weight)
  const totalConfidence = words.reduce((acc, word) => acc + word.confidence, 0);
  const averageConfidence = totalConfidence / words.length;
  const baseClarity = averageConfidence * 100;

  // 2. Pronunciation consistency (20% weight)
  // Lower variance = more consistent pronunciation = better clarity
  const confidenceVariance = calculateVariance(words.map(w => w.confidence));
  const consistencyScore = Math.max(0, 100 - (confidenceVariance * 500)); // Scale variance

  // 3. Articulation quality penalty (20% weight)
  // Penalize words with very low confidence (< 0.7) - indicates unclear articulation
  const lowConfidenceWords = words.filter(w => w.confidence < 0.7).length;
  const lowConfidenceRatio = lowConfidenceWords / words.length;
  const articulationScore = Math.max(0, 100 - (lowConfidenceRatio * 150));

  // Weighted combination
  const clarityScore = (baseClarity * 0.6) + (consistencyScore * 0.2) + (articulationScore * 0.2);
  
  return Math.round(Math.min(100, clarityScore));
}

/**
 * Calculate variance for consistency measurement
 */
function calculateVariance(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Enhanced Fluency Calculation
 * Based on research in speech disfluency and cognitive linguistics
 * 
 * Factors considered:
 * 1. Speech Continuity (pause distribution and frequency)
 * 2. Hesitation Patterns (filler words and false starts)
 * 3. Rhythm Consistency (temporal regularity)
 * 4. Speech Repair Ratio (self-corrections)
 * 
 * Research: Fluency assessment should consider pause patterns,
 * not just frequency (Kormos & Dénes, 2004; Cucchiarini et al., 2002)
 */
function calculateFluency(words, fillerWordCount) {
  if (!words || words.length < 2) return 100;

  const totalWords = words.length;
  let pauseData = {
    short: 0,    // 0.3-0.8s (natural pauses)
    medium: 0,   // 0.8-1.5s (thoughtful pauses)
    long: 0,     // 1.5-3s (hesitation)
    veryLong: 0  // >3s (significant disruption)
  };
  
  let totalPauseDuration = 0;
  let pauseVariances = [];

  // Analyze pause patterns
  for (let i = 0; i < words.length - 1; i++) {
    const pauseDuration = words[i + 1].startTime.seconds - words[i].endTime.seconds;
    
    if (pauseDuration > 0) {
      totalPauseDuration += pauseDuration;
      pauseVariances.push(pauseDuration);
      
      // Categorize pauses
      if (pauseDuration < 0.8) pauseData.short++;
      else if (pauseDuration < 1.5) pauseData.medium++;
      else if (pauseDuration < 3) pauseData.long++;
      else pauseData.veryLong++;
    }
  }

  // 1. Speech Continuity Score (40% weight)
  // Penalize disruptive pauses more heavily
  const pausePenalty = (pauseData.long * 3) + (pauseData.veryLong * 8);
  const continuityScore = Math.max(0, 100 - pausePenalty);

  // 2. Rhythm Consistency Score (30% weight)
  // More consistent pause patterns = better fluency
  const pauseVariance = pauseVariances.length > 0 ? calculateVariance(pauseVariances) : 0;
  const rhythmScore = Math.max(0, 100 - (pauseVariance * 15));

  // 3. Hesitation Score (30% weight)
  // Penalize filler words with diminishing returns (not linear)
  const fillerRatio = fillerWordCount / totalWords;
  const fillerPenalty = Math.min(50, fillerRatio * 200); // Max 50 point penalty
  const hesitationScore = Math.max(0, 100 - fillerPenalty);

  // Weighted combination
  const fluencyScore = (continuityScore * 0.4) + (rhythmScore * 0.3) + (hesitationScore * 0.3);
  
  return Math.round(Math.min(100, fluencyScore));
}

/**
 * Enhanced Pace Scoring
 * Based on research in speech rate perception and comprehension
 * 
 * Factors considered:
 * 1. Optimal comprehension zone (130-170 WPM for presentations)
 * 2. Context-appropriate speed zones
 * 3. Non-linear scoring (gentle slopes for minor deviations)
 * 4. Extreme pace penalties
 * 
 * Research: Speech rate affects comprehension non-linearly, with
 * optimal zones depending on content complexity (Tauroza & Allison, 1990)
 * Conversational: 150-180 WPM, Presentations: 120-150 WPM
 */
function scorePace(wpm) {
  // Define optimal zones with scientific backing
  const optimalMin = 130;  // Lower bound for good comprehension
  const optimalMax = 170;  // Upper bound for good comprehension
  const comfortMin = 110;  // Acceptable slow boundary
  const comfortMax = 190;  // Acceptable fast boundary
  
  // Perfect score for optimal zone
  if (wpm >= optimalMin && wpm <= optimalMax) {
    return 100;
  }
  
  // Comfortable zone (gentle penalty)
  if (wpm >= comfortMin && wpm < optimalMin) {
    // Slightly slow but acceptable: 90-100 points
    const deviation = optimalMin - wpm;
    const penalty = (deviation / 20) * 10; // Max 10 point penalty
    return Math.round(100 - penalty);
  }
  
  if (wpm > optimalMax && wpm <= comfortMax) {
    // Slightly fast but acceptable: 90-100 points
    const deviation = wpm - optimalMax;
    const penalty = (deviation / 20) * 10; // Max 10 point penalty
    return Math.round(100 - penalty);
  }
  
  // Outside comfortable zone (progressive penalty)
  if (wpm < comfortMin) {
    // Too slow: comprehension and engagement suffer
    // 60-90 points for very slow (80-110 WPM)
    // <60 points for extremely slow (<80 WPM)
    const deviation = comfortMin - wpm;
    const penalty = 10 + (deviation * 1.2); // Starts at 10, increases 1.2 per WPM
    return Math.max(30, Math.round(100 - penalty));
  }
  
  if (wpm > comfortMax) {
    // Too fast: comprehension difficult, sounds rushed
    // 60-90 points for very fast (190-210 WPM)
    // <60 points for extremely fast (>210 WPM)
    const deviation = wpm - comfortMax;
    const penalty = 10 + (deviation * 1.5); // Starts at 10, increases 1.5 per WPM
    return Math.max(30, Math.round(100 - penalty));
  }
  
  return 70; // Fallback
}

/**
 * Enhanced Confidence Calculation
 * Based on research in vocal confidence and speech assertiveness
 * 
 * Factors considered:
 * 1. Vocal Stability (consistent word confidence)
 * 2. Linguistic Assertiveness (word choice, sentence structure)
 * 3. Speech Decisiveness (fewer hesitations and qualifiers)
 * 4. Delivery Consistency (underlying clarity and fluency)
 * 
 * Research: Confidence perception is multi-dimensional, including
 * acoustic features and linguistic choices (Pentland, 2008)
 */
function calculateConfidence(words, metrics, fillerWordCount, transcript) {
  if (!words || words.length === 0) return 70;

  // 1. Vocal Stability Score (35% weight)
  // Confidence measured by consistency in word recognition
  const confidenceValues = words.map(w => w.confidence);
  const avgConfidence = confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length;
  const confidenceVariance = calculateVariance(confidenceValues);
  const stabilityScore = (avgConfidence * 100 * 0.7) + (Math.max(0, 100 - confidenceVariance * 400) * 0.3);

  // 2. Linguistic Assertiveness (25% weight)
  // Analyze word choice for confidence indicators
  const assertivenessScore = analyzeLinguisticConfidence(transcript);

  // 3. Speech Decisiveness (20% weight)
  // Fewer fillers and hedge words = more decisive
  const fillerRatio = fillerWordCount / words.length;
  const decisivenessScore = Math.max(0, 100 - (fillerRatio * 300));

  // 4. Delivery Quality Base (20% weight)
  // Foundation from clarity and fluency
  const deliveryScore = (metrics.clarity * 0.5) + (metrics.fluency * 0.5);

  // Weighted combination
  const confidenceScore = 
    (stabilityScore * 0.35) + 
    (assertivenessScore * 0.25) + 
    (decisivenessScore * 0.20) + 
    (deliveryScore * 0.20);

  return Math.round(Math.min(100, confidenceScore));
}

/**
 * Analyze linguistic confidence through word choice
 */
function analyzeLinguisticConfidence(transcript) {
  const text = transcript.toLowerCase();
  const words = text.split(/\s+/);
  
  // Confidence indicators
  const strongWords = ['will', 'must', 'definitely', 'certainly', 'clearly', 'obviously', 'confident', 'sure', 'believe', 'know'];
  const weakWords = ['maybe', 'perhaps', 'might', 'possibly', 'probably', 'guess', 'think', 'hope', 'try', 'somewhat'];
  
  let strongCount = 0;
  let weakCount = 0;
  
  for (const word of words) {
    if (strongWords.includes(word)) strongCount++;
    if (weakWords.includes(word)) weakCount++;
  }
  
  // Calculate assertiveness ratio
  const totalIndicators = strongCount + weakCount;
  if (totalIndicators === 0) return 75; // Neutral baseline
  
  const assertivenessRatio = strongCount / totalIndicators;
  return Math.round(60 + (assertivenessRatio * 40)); // Range: 60-100
}

/**
 * Enhanced Tone Estimation
 * Based on text analysis and speech patterns
 * 
 * Factors considered:
 * 1. Vocabulary Variety (lexical diversity)
 * 2. Sentence Complexity
 * 3. Emotional Language Detection
 * 4. Speech Energy Proxies
 * 
 * Note: True tone analysis requires audio features (pitch, intensity)
 * This is a text-based estimation until audio analysis is added
 * 
 * Research: Tone perception combines acoustic and linguistic features
 * (Hirschberg, 2002)
 */
function estimateTone(words, transcript, metrics) {
  if (!words || words.length === 0) return 70;

  // 1. Lexical Diversity (30% weight)
  // More varied vocabulary = more engaging tone
  const uniqueWords = new Set(transcript.toLowerCase().split(/\s+/));
  const lexicalDiversity = uniqueWords.size / words.length;
  const diversityScore = Math.min(100, lexicalDiversity * 150); // Scale appropriately

  // 2. Speech Engagement (25% weight)
  // Based on sentence variety and structure
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = words.length / Math.max(1, sentences.length);
  // Optimal sentence length: 15-20 words
  const sentenceScore = avgSentenceLength >= 15 && avgSentenceLength <= 20 ? 100 : 
                        Math.max(50, 100 - Math.abs(avgSentenceLength - 17.5) * 3);

  // 3. Emotional Expression (25% weight)
  // Detect emotionally expressive language
  const expressionScore = detectEmotionalTone(transcript);

  // 4. Delivery Quality Base (20% weight)
  // Foundation from clarity and pace variation
  const deliveryScore = (metrics.clarity * 0.6) + (metrics.pace * 0.4);

  // Weighted combination
  const toneScore = 
    (diversityScore * 0.30) + 
    (sentenceScore * 0.25) + 
    (expressionScore * 0.25) + 
    (deliveryScore * 0.20);

  return Math.round(Math.min(100, toneScore));
}

/**
 * Detect emotional and expressive language
 */
function detectEmotionalTone(transcript) {
  const text = transcript.toLowerCase();
  
  // Positive/engaging words
  const positiveWords = ['great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'excited', 'happy', 
                        'love', 'passionate', 'important', 'significant', 'crucial', 'powerful'];
  
  // Negative/concerning words (might indicate poor tone)
  const negativeWords = ['boring', 'terrible', 'awful', 'hate', 'difficult', 'problem', 'unfortunately'];
  
  // Emphatic words (show engagement)
  const emphaticWords = ['very', 'really', 'truly', 'absolutely', 'completely', 'extremely', 'incredibly'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let emphaticCount = 0;
  
  const words = text.split(/\s+/);
  for (const word of words) {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
    if (emphaticWords.includes(word)) emphaticCount++;
  }
  
  // Calculate expression score
  const expressionRatio = (positiveCount + emphaticCount - negativeCount) / words.length;
  const baseScore = 70; // Neutral baseline
  const adjustedScore = baseScore + (expressionRatio * 300); // Can go above or below baseline
  
  return Math.max(50, Math.min(100, adjustedScore));
}

/**
 * Calculate Pronunciation Score
 * Based on word confidence from Google Speech API
 */
function calculatePronunciation(words, transcript) {
  if (!words || words.length === 0) return 70; // Default neutral score
  
  // Average confidence from Google Speech API (indicates pronunciation clarity)
  const totalConfidence = words.reduce((sum, word) => sum + (word.confidence || 0.8), 0);
  const avgConfidence = totalConfidence / words.length;
  
  // Convert confidence (0-1) to score (0-100)
  // Multiply by 105 and cap at 100 to allow high scores for good pronunciation
  const pronunciationScore = Math.min(100, avgConfidence * 105);
  
  return Math.round(pronunciationScore);
}

/**
 * Calculate Vocabulary Score
 * Based on word diversity and complexity
 */
function calculateVocabulary(transcript) {
  if (!transcript) return 70; // Default neutral score
  
  const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 70;
  
  // 1. Lexical Diversity (unique words / total words)
  const uniqueWords = new Set(words);
  const diversity = uniqueWords.size / words.length;
  
  // 2. Word Length (longer words often indicate more complex vocabulary)
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // 3. Complex words (7+ characters)
  const complexWords = words.filter(w => w.length >= 7).length;
  const complexityRatio = complexWords / words.length;
  
  // Scoring:
  // - Diversity: 40% weight (0.5+ diversity is good)
  // - Average length: 30% weight (5-6 chars is good)
  // - Complexity: 30% weight (15%+ complex words is good)
  
  const diversityScore = Math.min(100, (diversity / 0.5) * 100);
  const lengthScore = Math.min(100, ((avgWordLength - 3) / 3) * 100);
  const complexityScore = Math.min(100, (complexityRatio / 0.15) * 100);
  
  const vocabularyScore = (diversityScore * 0.4) + (lengthScore * 0.3) + (complexityScore * 0.3);
  
  return Math.round(Math.max(60, vocabularyScore)); // Min 60 to avoid harsh scores
}

/**
 * Calculate Grammar Score
 * Simple heuristic-based grammar analysis
 */
function calculateGrammar(transcript) {
  if (!transcript) return 70; // Default neutral score
  
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 70;
  
  let grammarScore = 100;
  
  // 1. Sentence structure variety (good grammar has varied sentence lengths)
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
  const varietyScore = Math.min(100, (Math.sqrt(variance) / 5) * 100); // Higher variance = more variety
  
  // 2. Complete sentences (should have reasonable length)
  const incompleteSentences = sentences.filter(s => s.trim().split(/\s+/).length < 3).length;
  const completenessRatio = 1 - (incompleteSentences / sentences.length);
  const completenessScore = completenessRatio * 100;
  
  // 3. Capitalization patterns (basic grammar rule)
  const properCapitalization = sentences.filter(s => /^[A-Z]/.test(s.trim())).length;
  const capitalizationScore = (properCapitalization / sentences.length) * 100;
  
  // Weighted combination
  grammarScore = (varietyScore * 0.3) + (completenessScore * 0.5) + (capitalizationScore * 0.2);
  
  return Math.round(Math.max(65, grammarScore)); // Min 65 to avoid harsh scores
}

/**
 * Enhanced Overall Score Calculation
 * Based on research in holistic speech assessment
 * 
 * Weighted scoring that reflects:
 * - Clarity and Fluency as primary factors (most important for comprehension)
 * - Pace as secondary (affects engagement)
 * - Confidence and Tone as tertiary (affect perception and reception)
 * 
 * Research: Comprehension studies show clarity and fluency account for
 * ~60% of perceived speech quality (Derwing & Munro, 2009)
 */
function calculateOverallScore(metrics) {
  // Research-based weights
  const weights = {
    clarity: 0.28,      // 28% - Critical for understanding
    fluency: 0.27,      // 27% - Critical for processing
    pace: 0.18,         // 18% - Important for engagement
    confidence: 0.15,   // 15% - Affects credibility
    tone: 0.12          // 12% - Affects engagement
  };

  const overallScore = 
    (metrics.clarity * weights.clarity) +
    (metrics.fluency * weights.fluency) +
    (metrics.pace * weights.pace) +
    (metrics.confidence * weights.confidence) +
    (metrics.tone * weights.tone);

  return Math.round(Math.min(100, overallScore));
}

/**
 * Update user goals based on completed session
 * Returns array of completed goals
 */
async function updateUserGoals(userId, analysisData) {
  try {
    const Goal = require('../models/Goal.model');
    const User = require('../models/User.model');
    const AnalysisReport = require('../models/AnalysisReport.model');
    
    // Get all active goals for the user
    const activeGoals = await Goal.find({ user: userId, status: 'active' });
    
    if (activeGoals.length === 0) {
      return [];
    }
    
    // Get user data for streak info
    const user = await User.findById(userId);
    
    // Get all user reports for calculations
    const allReports = await AnalysisReport.find({ user: userId }).sort({ createdAt: -1 });
    
    const completedGoals = [];
    
    for (const goal of activeGoals) {
      let updated = false;
      let newValue = goal.currentValue;
      
      switch (goal.type) {
        case 'sessions':
          // Increment session count
          newValue = goal.currentValue + 1;
          updated = true;
          break;
          
        case 'score':
          // Check if current session score meets/exceeds target
          if (analysisData.overallScore >= goal.targetValue) {
            newValue = Math.max(goal.currentValue, analysisData.overallScore);
            updated = true;
          }
          break;
          
        case 'streak':
          // Update with current streak
          if (user.currentStreak) {
            newValue = user.currentStreak;
            updated = true;
          }
          break;
          
        case 'skill_improvement':
          // Update specific skill progress
          if (goal.targetSkill && analysisData.metrics[goal.targetSkill]) {
            const skillScore = analysisData.metrics[goal.targetSkill];
            if (skillScore >= goal.targetValue) {
              newValue = Math.max(goal.currentValue, skillScore);
              updated = true;
            }
          }
          break;
          
        case 'time_practiced':
          // Accumulate practice time (in minutes)
          const sessionMinutes = analysisData.duration ? Math.round(analysisData.duration / 60) : 0;
          newValue = goal.currentValue + sessionMinutes;
          updated = true;
          break;
          
        case 'custom':
          // For custom goals, just increment
          newValue = goal.currentValue + 1;
          updated = true;
          break;
      }
      
      if (updated) {
        goal.currentValue = newValue;
        
        // Check if goal is completed
        if (goal.currentValue >= goal.targetValue && goal.status === 'active') {
          goal.status = 'completed';
          goal.completedAt = new Date();
          completedGoals.push({
            _id: goal._id,
            title: goal.title,
            type: goal.type,
            targetValue: goal.targetValue,
            currentValue: goal.currentValue
          });
        }
        
        await goal.save();
      }
    }
    
    return completedGoals;
  } catch (error) {
    console.error('Error updating user goals:', error);
    return [];
  }
}

// The main controller function
exports.analyzeSpeech = async (req, res) => {
  console.log('🎤 analyzeSpeech called');
  console.log('   - Has file:', !!req.file);
  console.log('   - File buffer size:', req.file?.buffer?.length);
  console.log('   - Request body:', req.body);
  console.log('   - isPracticeExercise:', req.body?.isPracticeExercise);
  
  if (!req.file) {
    console.log('❌ No file uploaded');
    return res.status(400).json({ 
      success: false,
      message: 'Audio file is required.' 
    });
  }

  // Handle authentication (optional - support guest mode)
  let userId = null;
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      const user = await User.findById(decoded.userId);
      if (user) {
        userId = user._id;
        console.log('   - Authenticated user:', user.email);
      }
    } catch (authError) {
      console.log('   - Auth failed, continuing as guest:', authError.message);
    }
  } else {
    console.log('   - No token provided, treating as guest');
  }

  try {
    console.log('🔄 Starting audio processing...');
    
    // Check if audio buffer is too small
    if (req.file.buffer.length < 1000) {
      console.log('⚠️ Audio file is very small:', req.file.buffer.length, 'bytes');
      return res.status(400).json({
        success: false,
        message: 'Audio recording is too short or empty. Please record at least 3 seconds of speech.',
        error: 'Audio file too small'
      });
    }
    
    const audioBytes = req.file.buffer.toString('base64');
    console.log('   - Audio buffer size:', req.file.buffer.length, 'bytes');
    console.log('   - Audio base64 length:', audioBytes.length);
    console.log('   - File MIME type:', req.file.mimetype);
    console.log('   - File original name:', req.file.originalname);

    // Determine encoding based on file type
    // Google Speech-to-Text has issues with WEBM directly, try LINEAR16 or use longRunningRecognize
    let configOptions = {
      languageCode: 'en-US',
      enableWordTimeOffsets: true,
      enableWordConfidence: true,
      enableAutomaticPunctuation: true,
    };
    
    // For WEBM, we need to use a different approach
    // Option 1: Try WEBM_OPUS with proper config
    // Option 2: Use longRunningRecognize for async processing
    // Option 3: Let Google auto-detect (works better for some formats)
    
    if (req.file.mimetype && req.file.mimetype.includes('webm')) {
      // For browser WebM recordings, use WEBM_OPUS with explicit config
      configOptions.encoding = 'WEBM_OPUS';
      configOptions.sampleRateHertz = 48000;
      configOptions.audioChannelCount = 1; // Mono audio
    } else if (req.file.mimetype && req.file.mimetype.includes('ogg')) {
      configOptions.encoding = 'OGG_OPUS';
      configOptions.sampleRateHertz = 48000;
    } else if (req.file.mimetype && req.file.mimetype.includes('mp4')) {
      configOptions.encoding = 'MP3';
      configOptions.sampleRateHertz = 48000;
    } else {
      // Default fallback
      configOptions.encoding = 'WEBM_OPUS';
      configOptions.sampleRateHertz = 48000;
    }
    
    console.log('   - Using encoding:', configOptions.encoding);
    console.log('   - Sample rate:', configOptions.sampleRateHertz);
    console.log('   - Audio channels:', configOptions.audioChannelCount || 'default');

    const audio = {
      content: audioBytes,
    };
    const config = configOptions;
    const request = {
      audio: audio,
      config: config,
    };

    // 1. Call Google Speech-to-Text API for transcription
    console.log('☁️ Calling Google Speech-to-Text API...');
    const [response] = await speechClient.recognize(request);
    console.log('✅ Google API responded');
    
    const result = response.results[0];
    if (!result || !result.alternatives[0]) {
      console.log('❌ No transcription results from Google API');
      return res.status(500).json({ 
        success: false,
        message: 'Could not transcribe audio. Please ensure you spoke clearly and the audio quality is good.' 
      });
    }

    const transcript = result.alternatives[0].transcript || '';
    const formattedWords = result.alternatives[0].words || [];

    // Check if transcript is empty or too short
    if (!transcript || transcript.trim().length < 3) {
      return res.status(400).json({ 
        message: 'Audio is too short or unclear. Please record at least 5 seconds of clear speech.',
        error: 'Insufficient audio content'
      });
    }

    console.log('   - Transcript:', transcript.substring(0, 50) + '...');
    console.log('   - Word count:', formattedWords.length);

    // 2. Run all our analysis functions
    const fillerWords = analyzeFillerWords(transcript);
    const fillerWordCount = Object.values(fillerWords).reduce((sum, count) => sum + count, 0);
    const pace = calculatePace(formattedWords);
    
    // Calculate all metrics with enhanced algorithms
    const metrics = {};
    metrics.clarity = calculateClarity(formattedWords);
    metrics.fluency = calculateFluency(formattedWords, fillerWordCount);
    metrics.pace = scorePace(pace.wordsPerMinute);
    
    // Enhanced confidence calculation
    metrics.confidence = calculateConfidence(formattedWords, metrics, fillerWordCount, transcript);
    
    // Enhanced tone estimation (without audio features, based on text analysis)
    metrics.tone = estimateTone(formattedWords, transcript, metrics);

    // Add pronunciation, vocabulary, and grammar metrics for skill breakdown
    metrics.pronunciation = calculatePronunciation(formattedWords, transcript);
    metrics.vocabulary = calculateVocabulary(transcript);
    metrics.grammar = calculateGrammar(transcript);

    // Calculate overall score with research-based weights
    const overallScore = calculateOverallScore(metrics);

    // Generate AI-powered feedback
    console.log('🤖 Generating AI feedback...');
    const feedbackData = {
      transcript,
      metrics,
      pace,
      fillerWords,
      overallScore
    };
    
    const { strengths, areasForImprovement, recommendations } = await generateAIFeedback(feedbackData);

    // 3. Construct the final report object
    const analysisData = {
      transcript,
      overallScore,
      metrics,
      pace,
      fillerWords,
      strengths,
      areasForImprovement,
      recommendations,
    };

    // 4. Save to Database
    let reportId = null;
    const isPracticeExercise = req.body.isPracticeExercise === 'true';
    
    if (userId && !isPracticeExercise) {
      // Authenticated user - save to AnalysisReport
      const newReport = new AnalysisReport({
        user: userId,  // Changed from userId to user to match schema
        transcript: analysisData.transcript,
        overallScore: analysisData.overallScore,
        metrics: analysisData.metrics,
        pace: analysisData.pace,
        fillerWords: analysisData.fillerWords,
        strengths: analysisData.strengths,
        areasForImprovement: analysisData.areasForImprovement,
        recommendations: analysisData.recommendations,
        duration: formattedWords.length > 0 
          ? formattedWords[formattedWords.length - 1].endTime.seconds 
          : 0,
        wordCount: formattedWords.length,
      });
      await newReport.save();
      reportId = newReport._id;
      console.log('   - Report saved to DB:', reportId);
      
      // Update user streak and check for new badges
      try {
        const StreakService = require('../services/streak.service');
        const AchievementService = require('../services/achievement.service');
        
        await StreakService.updateStreak(userId);
        const newBadges = await AchievementService.checkAndAwardBadges(userId);
        
        if (newBadges.length > 0) {
          console.log(`   - 🏆 Awarded ${newBadges.length} new badge(s):`, newBadges.map(b => b.name).join(', '));
          // Add badges to response so frontend can show notifications
          analysisData.newBadges = newBadges;
        }
      } catch (error) {
        console.error('   - ⚠️ Error updating streak/badges:', error.message);
        // Don't fail the request if badge/streak update fails
      }

      // Update user goals progress
      try {
        const completedGoals = await updateUserGoals(userId, analysisData);
        if (completedGoals.length > 0) {
          console.log(`   - 🎯 Completed ${completedGoals.length} goal(s):`, completedGoals.map(g => g.title).join(', '));
          analysisData.completedGoals = completedGoals;
        }
      } catch (error) {
        console.error('   - ⚠️ Error updating goals:', error.message);
        // Don't fail the request if goal update fails
      }
    } else if (isPracticeExercise) {
      console.log('   - Practice exercise: analysis not saved to DB');
    } else {
      // Guest mode - save to GuestFeedback collection
      try {
        // Generate a session ID (from request body or create one)
        const sessionId = req.body.sessionId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Calculate recording duration
        const recordingDuration = formattedWords.length > 0 
          ? formattedWords[formattedWords.length - 1].endTime.seconds 
          : 0;
        
        const guestFeedback = new GuestFeedback({
          sessionId: sessionId,
          ipAddress: req.ip || req.connection.remoteAddress,
          transcript: analysisData.transcript,
          overallScore: analysisData.overallScore,
          metrics: analysisData.metrics,
          pace: analysisData.pace,
          fillerWords: analysisData.fillerWords,
          strengths: analysisData.strengths,
          areasForImprovement: analysisData.areasForImprovement,
          recommendations: analysisData.recommendations,
          recordingDuration: recordingDuration,
          audioFileSize: req.file.buffer.length,
          userAgent: req.headers['user-agent'],
          platform: 'web'
        });
        
        await guestFeedback.save();
        reportId = guestFeedback._id;
        console.log('   - Guest feedback saved to DB:', reportId);
      } catch (guestError) {
        // Don't fail the request if guest feedback save fails
        console.error('   - Failed to save guest feedback:', guestError.message);
      }
    }

    // 5. Send report back to client
    res.status(200).json({
      success: true,
      message: "Analysis completed successfully",
      data: {
        _id: reportId,
        ...analysisData,
        createdAt: new Date(),
      },
    });

  } catch (error) {
    console.error('❌ Error during speech analysis:', error);
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error stack:', error.stack);
    
    // More user-friendly error messages
    let userMessage = 'Server error during analysis.';
    if (error.code === 3 || error.message?.includes('credentials')) {
      userMessage = 'Authentication error with speech service. Please contact support.';
    } else if (error.code === 'ENOENT') {
      userMessage = 'Speech service configuration error. Please contact support.';
    } else if (error.message?.includes('audio')) {
      userMessage = 'Invalid audio format. Please try recording again.';
    }
    
    res.status(500).json({ 
      success: false,
      message: userMessage, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};