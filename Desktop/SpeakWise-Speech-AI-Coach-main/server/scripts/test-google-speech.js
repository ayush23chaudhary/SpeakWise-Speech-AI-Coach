// Test script to verify Google Speech-to-Text API credentials
require('dotenv').config();
const { SpeechClient } = require('@google-cloud/speech');
const path = require('path');
const fs = require('fs');

console.log('\n🧪 Testing Google Speech-to-Text API Setup...\n');

// Test 1: Check if credentials file exists
console.log('1️⃣  Checking credentials file...');
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json';
const fullPath = path.resolve(__dirname, '..', credPath);

if (fs.existsSync(fullPath)) {
  console.log('   ✅ Credentials file found at:', fullPath);
} else {
  console.log('   ❌ Credentials file NOT found at:', fullPath);
  console.log('   📝 Please download your service account JSON from Google Cloud Console');
  console.log('   📝 Save it as: server/google-credentials.json');
  process.exit(1);
}

// Test 2: Initialize Speech Client
console.log('\n2️⃣  Initializing Google Speech Client...');
let speechClient;
try {
  speechClient = new SpeechClient({
    keyFilename: fullPath
  });
  console.log('   ✅ Speech Client initialized successfully');
} catch (error) {
  console.log('   ❌ Failed to initialize Speech Client');
  console.error('   Error:', error.message);
  process.exit(1);
}

// Test 3: Test with a simple audio sample
console.log('\n3️⃣  Testing API call with sample audio...');

// Create a simple test audio (1 second of silence as base64)
// This is a minimal valid WebM audio file
const testAudio = Buffer.from([
  0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f,
  0x42, 0x86, 0x81, 0x01, 0x42, 0xf7, 0x81, 0x01, 0x42, 0xf2, 0x81, 0x04,
  0x42, 0xf3, 0x81, 0x08, 0x42, 0x82, 0x88, 0x77, 0x65, 0x62, 0x6d, 0x42,
  0x87, 0x81, 0x02, 0x42, 0x85, 0x81, 0x02
]).toString('base64');

const request = {
  audio: {
    content: testAudio,
  },
  config: {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000,
    languageCode: 'en-US',
    enableWordTimeOffsets: true,
    enableWordConfidence: true,
  },
};

(async () => {
  try {
    console.log('   🔄 Making test API call...');
    const [response] = await speechClient.recognize(request);
    
    // Even if transcription fails (due to silent audio), successful API call means credentials work
    console.log('   ✅ API call successful! Credentials are valid.');
    
    if (response.results && response.results.length > 0) {
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      console.log('   📝 Transcription:', transcription || '(empty - test audio was silent)');
    } else {
      console.log('   📝 No transcription (expected for test audio)');
    }
    
    console.log('\n✅ All tests passed! Your Google Speech-to-Text setup is working correctly.\n');
    
  } catch (error) {
    console.log('   ❌ API call failed');
    console.error('   Error:', error.message);
    
    if (error.code === 7) {
      console.log('\n   💡 Error code 7 usually means:');
      console.log('      - The Speech-to-Text API is not enabled in your Google Cloud project');
      console.log('      - Go to: https://console.cloud.google.com/apis/library/speech.googleapis.com');
      console.log('      - Click "Enable" for your project');
    } else if (error.code === 16) {
      console.log('\n   💡 Error code 16 usually means:');
      console.log('      - Invalid credentials or wrong service account');
      console.log('      - Make sure your service account has "Cloud Speech Client" role');
    }
    
    console.log('\n❌ Setup verification failed. Please fix the errors above.\n');
    process.exit(1);
  }
})();
