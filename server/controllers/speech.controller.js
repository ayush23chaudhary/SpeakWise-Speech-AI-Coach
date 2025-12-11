// server/controllers/speech.controller.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SpeechClient } = require('@google-cloud/speech');
const AnalysisReport = require('../models/AnalysisReport.model');
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
function analyzeFillerWords(transcript) {
  const fillerWordList = ['um', 'uh', 'like', 'you know', 'so', 'right', 'actually', 'basically', 'i mean'];
  const fillerWordCounts = {};

  // Clean and split the transcript into individual words.
  const words = transcript.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/);

  for (const word of words) {
    if (fillerWordList.includes(word)) {
      fillerWordCounts[word] = (fillerWordCounts[word] || 0) + 1;
    }
  }

  // Your component expects data in a specific format, so this result is ready to use.
  // e.g., { um: 5, like: 3 }
  return fillerWordCounts;
}


function calculateClarity(words) {
  if (!words || words.length === 0) return 0;

  // Sum up all the confidence scores.
  const totalConfidence = words.reduce((acc, word) => acc + word.confidence, 0);

  // Calculate the average and scale to 100.
  const averageConfidence = totalConfidence / words.length;
  return Math.round(averageConfidence * 100);
}

function calculateFluency(words, fillerWordCount) {
  if (!words || words.length < 2) return 100;

  const totalWords = words.length;
  let longPauseCount = 0;
  const pauseThreshold = 1.5; // A pause over 1.5 seconds is considered long.

  // Count long pauses between words.
  for (let i = 0; i < words.length - 1; i++) {
    const pauseDuration = words[i + 1].startTime.seconds - words[i].endTime.seconds;
    if (pauseDuration > pauseThreshold) {
      longPauseCount++;
    }
  }

  // Penalize the score based on filler words and long pauses.
  // Example: Each filler word costs 2 points, each long pause costs 4 points.
  const fillerPenalty = fillerWordCount * 2;
  const pausePenalty = longPauseCount * 4;

  const totalPenalty = fillerPenalty + pausePenalty;
  
  // Ensure the score doesn't go below 0.
  const fluencyScore = Math.max(0, 100 - totalPenalty);
  return fluencyScore;
}

function scorePace(wpm) {
  const idealWpm = 150;
  const acceptableRange = 20; // WPM can be +/- 20 from ideal without penalty.

  const difference = Math.abs(wpm - idealWpm);

  if (difference <= acceptableRange) {
    return 100;
  }

  // The further away from the ideal range, the lower the score.
  const penalty = (difference - acceptableRange) * 1.5; // Penalize 1.5 points for each WPM outside the range
  return Math.max(0, 100 - penalty);
}

function calculateOverallScore(metrics) {
  // Define weights for each metric. They should add up to 1.0.
  const weights = {
    clarity: 0.30,    // 30%
    fluency: 0.30,    // 30%
    pace: 0.20,       // 20%
    confidence: 0.20, // 20%
    // Note: Tone is excluded here but you could add it.
  };

  const overallScore = 
    (metrics.clarity * weights.clarity) +
    (metrics.fluency * weights.fluency) +
    (metrics.pace * weights.pace) +
    (metrics.confidence * weights.confidence);

  return Math.round(overallScore);
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
    
    const metrics = {};
    metrics.clarity = calculateClarity(formattedWords);
    metrics.fluency = calculateFluency(formattedWords, fillerWordCount);
    metrics.pace = scorePace(pace.wordsPerMinute);
    // For now, confidence is a composite. Tone would require another API call.
    metrics.confidence = Math.round((metrics.clarity * 0.4) + (metrics.fluency * 0.4) + (metrics.pace * 0.2));
    metrics.tone = 75; // Placeholder for tone

    const overallScore = Math.round(
      (metrics.clarity * 0.3) +
      (metrics.fluency * 0.3) +
      (metrics.pace * 0.2) +
      (metrics.confidence * 0.2)
    );

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

    // 4. Save to Database only if user is authenticated AND it's not a practice exercise
    let reportId = null;
    const isPracticeExercise = req.body.isPracticeExercise === 'true';
    
    if (userId && !isPracticeExercise) {
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
      });
      await newReport.save();
      reportId = newReport._id;
      console.log('   - Report saved to DB:', reportId);
    } else if (isPracticeExercise) {
      console.log('   - Practice exercise: analysis not saved to DB');
    } else {
      console.log('   - Guest mode: analysis not saved to DB');
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