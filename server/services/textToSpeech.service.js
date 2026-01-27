const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Initialize the TTS client
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

/**
 * Convert text to speech using Google TTS
 * @param {string} text - The text to convert to speech
 * @param {Object} options - Optional voice configuration
 * @returns {Promise<Buffer>} Audio buffer in MP3 format
 */
async function generateSpeech(text, options = {}) {
  try {
    // Default to professional female voice (en-US-Neural2-F)
    // Other good options: en-US-Neural2-A (male), en-US-Neural2-C (female)
    const voiceConfig = {
      languageCode: options.languageCode || 'en-US',
      name: options.voiceName || 'en-US-Neural2-F',
      ssmlGender: options.ssmlGender || 'FEMALE'
    };

    // Configure audio output
    const audioConfig = {
      audioEncoding: 'MP3',
      speakingRate: options.speakingRate || 0.95, // Slightly slower for clarity
      pitch: options.pitch || 0.0,
      volumeGainDb: options.volumeGainDb || 0.0
    };

    // Construct the request
    const request = {
      input: { text },
      voice: voiceConfig,
      audioConfig: audioConfig
    };

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    return response.audioContent;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech: ' + error.message);
  }
}

/**
 * Generate speech with SSML for more natural delivery
 * @param {string} ssml - SSML formatted text
 * @param {Object} options - Optional voice configuration
 * @returns {Promise<Buffer>} Audio buffer in MP3 format
 */
async function generateSpeechWithSSML(ssml, options = {}) {
  try {
    const voiceConfig = {
      languageCode: options.languageCode || 'en-US',
      name: options.voiceName || 'en-US-Neural2-F',
      ssmlGender: options.ssmlGender || 'FEMALE'
    };

    const audioConfig = {
      audioEncoding: 'MP3',
      speakingRate: options.speakingRate || 0.95,
      pitch: options.pitch || 0.0,
      volumeGainDb: options.volumeGainDb || 0.0
    };

    const request = {
      input: { ssml },
      voice: voiceConfig,
      audioConfig: audioConfig
    };

    const [response] = await client.synthesizeSpeech(request);
    return response.audioContent;
  } catch (error) {
    console.error('Error generating SSML speech:', error);
    throw new Error('Failed to generate SSML speech: ' + error.message);
  }
}

/**
 * Format interview question with natural pauses using SSML
 * @param {string} question - The question text
 * @param {string} context - Optional context or introduction
 * @returns {string} SSML formatted text
 */
function formatInterviewQuestionSSML(question, context = null) {
  let ssml = '<speak>';
  
  if (context) {
    // Add context with a pause
    ssml += `${context}<break time="800ms"/>`;
  }
  
  // Add the question with natural emphasis
  ssml += `<prosody rate="95%" pitch="+0st">${question}</prosody>`;
  
  // Add a pause at the end for the user to think
  ssml += '<break time="500ms"/>';
  
  ssml += '</speak>';
  
  return ssml;
}

/**
 * Generate interview question audio with context
 * @param {string} question - The question text
 * @param {string} context - Optional context (e.g., "Question 1 of 5")
 * @param {Object} options - Voice options
 * @returns {Promise<Buffer>} Audio buffer
 */
async function generateInterviewQuestionAudio(question, context = null, options = {}) {
  const ssml = formatInterviewQuestionSSML(question, context);
  return generateSpeechWithSSML(ssml, options);
}

/**
 * Generate welcome/intro audio for interview
 * @param {string} name - User's name
 * @param {string} role - Interview role
 * @returns {Promise<Buffer>} Audio buffer
 */
async function generateInterviewIntro(name, role) {
  const text = `Hello ${name}. Welcome to your ${role} interview. I'll be asking you a series of questions. Take your time to think through each answer, and speak clearly. Let's begin.`;
  
  const ssml = `<speak>
    <prosody rate="95%" pitch="+2st">
      Hello ${name}. <break time="500ms"/>
      Welcome to your ${role} interview. <break time="700ms"/>
      I'll be asking you a series of questions. <break time="500ms"/>
      Take your time to think through each answer, and speak clearly. <break time="800ms"/>
      Let's begin.
    </prosody>
  </speak>`;
  
  return generateSpeechWithSSML(ssml);
}

/**
 * Generate completion/goodbye audio
 * @param {string} name - User's name
 * @returns {Promise<Buffer>} Audio buffer
 */
async function generateInterviewCompletion(name) {
  const ssml = `<speak>
    <prosody rate="95%" pitch="+2st">
      Thank you ${name}. <break time="500ms"/>
      You've completed all the questions. <break time="700ms"/>
      I'm now analyzing your responses and will have your detailed feedback ready shortly. <break time="500ms"/>
      Great job!
    </prosody>
  </speak>`;
  
  return generateSpeechWithSSML(ssml);
}

module.exports = {
  generateSpeech,
  generateSpeechWithSSML,
  generateInterviewQuestionAudio,
  generateInterviewIntro,
  generateInterviewCompletion,
  formatInterviewQuestionSSML
};
