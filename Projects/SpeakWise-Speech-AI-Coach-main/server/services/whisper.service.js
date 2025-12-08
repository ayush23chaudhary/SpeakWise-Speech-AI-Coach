// server/services/whisper.service.js

const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Initialize OpenAI client
let openaiClient;

try {
  if (process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI Whisper client initialized');
  } else {
    console.warn('⚠️ OPENAI_API_KEY not found. Whisper ASR will not be available.');
  }
} catch (error) {
  console.error('❌ Failed to initialize OpenAI Whisper client:', error.message);
}

/**
 * Transcribe audio using OpenAI Whisper API
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} originalFilename - Original filename for extension detection
 * @returns {Promise<Object>} - Object containing transcript and word-level timing data
 */
async function transcribeWithWhisper(audioBuffer, originalFilename = 'audio.webm') {
  if (!openaiClient) {
    throw new Error('OpenAI Whisper client not initialized. Please set OPENAI_API_KEY environment variable.');
  }

  try {
    console.log('🎤 Starting OpenAI Whisper transcription...');
    console.log('   - Audio buffer size:', audioBuffer.length, 'bytes');
    console.log('   - Original filename:', originalFilename);

    // Whisper API requires a file, so we need to save the buffer temporarily
    const tempDir = os.tmpdir();
    const fileExt = path.extname(originalFilename) || '.webm';
    const tempFilePath = path.join(tempDir, `whisper-audio-${Date.now()}${fileExt}`);
    
    // Write buffer to temp file
    fs.writeFileSync(tempFilePath, audioBuffer);
    console.log('   - Temporary file created:', tempFilePath);

    try {
      // Call Whisper API with timestamp_granularities for word-level timestamps
      const transcription = await openaiClient.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        response_format: 'verbose_json', // Get detailed response with timing
        timestamp_granularities: ['word'], // Request word-level timestamps
        language: 'en', // Optimize for English
      });

      console.log('✅ Whisper transcription completed');
      console.log('   - Transcript length:', transcription.text?.length || 0, 'characters');

      // Parse the response to match Google Speech-to-Text format
      const result = parseWhisperResponse(transcription);
      
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      console.log('   - Temporary file cleaned up');

      return result;

    } catch (apiError) {
      // Clean up temp file even on error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw apiError;
    }

  } catch (error) {
    console.error('❌ Whisper transcription failed:', error.message);
    throw new Error(`Whisper transcription failed: ${error.message}`);
  }
}

/**
 * Parse Whisper API response to match Google Speech-to-Text format
 * @param {Object} whisperResponse - Response from Whisper API
 * @returns {Object} - Formatted result compatible with existing analysis code
 */
function parseWhisperResponse(whisperResponse) {
  const transcript = whisperResponse.text || '';
  
  // Extract words with timing information
  let words = [];
  
  if (whisperResponse.words && Array.isArray(whisperResponse.words)) {
    // Whisper provides word-level timestamps
    words = whisperResponse.words.map(wordData => {
      return {
        word: wordData.word || '',
        startTime: {
          seconds: wordData.start || 0,
          nanos: 0,
        },
        endTime: {
          seconds: wordData.end || 0,
          nanos: 0,
        },
        confidence: 1.0, // Whisper doesn't provide confidence scores, use 1.0 as default
      };
    });
  } else {
    // Fallback: If word-level timestamps not available, estimate based on duration
    // This is a basic estimation and won't be as accurate
    console.warn('⚠️ Word-level timestamps not available, using estimation');
    const duration = whisperResponse.duration || 0;
    const wordsArray = transcript.split(/\s+/).filter(w => w.length > 0);
    
    if (wordsArray.length > 0 && duration > 0) {
      const avgWordDuration = duration / wordsArray.length;
      let currentTime = 0;
      
      words = wordsArray.map(word => {
        const wordObj = {
          word: word,
          startTime: {
            seconds: currentTime,
            nanos: 0,
          },
          endTime: {
            seconds: currentTime + avgWordDuration,
            nanos: 0,
          },
          confidence: 1.0,
        };
        currentTime += avgWordDuration;
        return wordObj;
      });
    }
  }

  console.log('   - Parsed words:', words.length);
  console.log('   - Transcript preview:', transcript.substring(0, 100));

  return {
    transcript,
    words,
    language: whisperResponse.language || 'en',
    duration: whisperResponse.duration || 0,
  };
}

/**
 * Check if Whisper service is available
 * @returns {boolean}
 */
function isWhisperAvailable() {
  return openaiClient !== null && openaiClient !== undefined;
}

module.exports = {
  transcribeWithWhisper,
  isWhisperAvailable,
};
