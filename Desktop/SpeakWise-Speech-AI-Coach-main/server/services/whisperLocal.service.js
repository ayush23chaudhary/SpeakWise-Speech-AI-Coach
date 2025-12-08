// server/services/whisperLocal.service.js

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const WHISPER_MODEL = process.env.WHISPER_MODEL || 'base'; // tiny, base, small, medium, large, turbo
const PYTHON_PATH = process.env.PYTHON_PATH || 'python3';
const WHISPER_SCRIPT = path.join(__dirname, '../scripts/whisper-transcribe.py');

/**
 * Check if local Whisper is available
 * @returns {Promise<boolean>}
 */
async function isWhisperLocalAvailable() {
  return new Promise((resolve) => {
    const checkProcess = spawn(PYTHON_PATH, ['-c', 'import whisper; print("OK")']);
    
    let output = '';
    checkProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    checkProcess.on('close', (code) => {
      resolve(code === 0 && output.includes('OK'));
    });
    
    checkProcess.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Transcribe audio using local Whisper model
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} originalFilename - Original filename for extension detection
 * @returns {Promise<Object>} - Object containing transcript and word-level timing data
 */
async function transcribeWithWhisperLocal(audioBuffer, originalFilename = 'audio.webm') {
  console.log('🎤 Starting Local Whisper transcription...');
  console.log('   - Audio buffer size:', audioBuffer.length, 'bytes');
  console.log('   - Model:', WHISPER_MODEL);
  console.log('   - Original filename:', originalFilename);

  // Check if Whisper is available
  const isAvailable = await isWhisperLocalAvailable();
  if (!isAvailable) {
    throw new Error(
      'Local Whisper is not installed. Please run: pip install -U openai-whisper'
    );
  }

  // Save buffer to temporary file
  const tempDir = os.tmpdir();
  const fileExt = path.extname(originalFilename) || '.webm';
  const tempFilePath = path.join(tempDir, `whisper-local-${Date.now()}${fileExt}`);
  
  try {
    // Write buffer to temp file
    fs.writeFileSync(tempFilePath, audioBuffer);
    console.log('   - Temporary file created:', tempFilePath);

    // Call Python script
    const result = await executePythonScript(tempFilePath, WHISPER_MODEL);
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    console.log('   - Temporary file cleaned up');
    
    // Parse and format result
    return parseWhisperLocalResponse(result);
    
  } catch (error) {
    // Ensure temp file is cleaned up even on error
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw error;
  }
}

/**
 * Execute Python Whisper script
 * @param {string} audioPath - Path to audio file
 * @param {string} modelName - Whisper model name
 * @returns {Promise<Object>}
 */
function executePythonScript(audioPath, modelName) {
  return new Promise((resolve, reject) => {
    console.log('🐍 Executing Python Whisper script...');
    
    const pythonProcess = spawn(PYTHON_PATH, [
      WHISPER_SCRIPT,
      audioPath,
      modelName,
      'en' // language
    ]);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
      // Log progress messages
      if (data.toString().includes('Loading') || data.toString().includes('Transcribing')) {
        console.log('   -', data.toString().trim());
      }
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ Python script failed:', stderrData);
        
        // Try to parse error as JSON
        try {
          const errorObj = JSON.parse(stderrData);
          reject(new Error(errorObj.message || 'Whisper transcription failed'));
        } catch {
          reject(new Error(`Whisper script exited with code ${code}: ${stderrData}`));
        }
        return;
      }

      try {
        const result = JSON.parse(stdoutData);
        if (!result.success) {
          reject(new Error(result.message || 'Transcription failed'));
          return;
        }
        resolve(result);
      } catch (parseError) {
        console.error('❌ Failed to parse Python output:', stdoutData);
        reject(new Error('Failed to parse transcription result'));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

/**
 * Parse Whisper local response to match expected format
 * @param {Object} whisperResponse - Response from Python script
 * @returns {Object} - Formatted result compatible with existing analysis code
 */
function parseWhisperLocalResponse(whisperResponse) {
  const transcript = whisperResponse.transcript || '';
  
  // Convert word format to match Google Speech-to-Text format
  const words = whisperResponse.words.map(wordData => {
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
      confidence: wordData.probability || 1.0, // Use probability as confidence
    };
  });

  console.log('✅ Local Whisper transcription completed');
  console.log('   - Transcript length:', transcript.length, 'characters');
  console.log('   - Words:', words.length);
  console.log('   - Language:', whisperResponse.language);
  console.log('   - Duration:', whisperResponse.duration.toFixed(2), 'seconds');
  console.log('   - Segments:', whisperResponse.segments);

  return {
    transcript,
    words,
    language: whisperResponse.language || 'en',
    duration: whisperResponse.duration || 0,
  };
}

/**
 * Get available Whisper models
 * @returns {Array<string>}
 */
function getAvailableModels() {
  return ['tiny', 'base', 'small', 'medium', 'large', 'turbo'];
}

/**
 * Get model information
 * @param {string} modelName - Model name
 * @returns {Object}
 */
function getModelInfo(modelName) {
  const models = {
    tiny: {
      params: '39M',
      vram: '~1 GB',
      speed: '~10x faster than large',
      accuracy: 'Good for simple speech',
    },
    base: {
      params: '74M',
      vram: '~1 GB',
      speed: '~7x faster than large',
      accuracy: 'Recommended for most use cases',
    },
    small: {
      params: '244M',
      vram: '~2 GB',
      speed: '~4x faster than large',
      accuracy: 'Better accuracy, still fast',
    },
    medium: {
      params: '769M',
      vram: '~5 GB',
      speed: '~2x faster than large',
      accuracy: 'High accuracy',
    },
    large: {
      params: '1550M',
      vram: '~10 GB',
      speed: 'Baseline speed',
      accuracy: 'Highest accuracy',
    },
    turbo: {
      params: '809M',
      vram: '~6 GB',
      speed: '~8x faster than large',
      accuracy: 'Optimized large-v3',
    },
  };
  
  return models[modelName] || models.base;
}

module.exports = {
  transcribeWithWhisperLocal,
  isWhisperLocalAvailable,
  getAvailableModels,
  getModelInfo,
};
