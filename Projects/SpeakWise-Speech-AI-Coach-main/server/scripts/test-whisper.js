// server/scripts/test-whisper.js

require('dotenv').config();
const { transcribeWithWhisper, isWhisperAvailable } = require('../services/whisper.service');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing OpenAI Whisper Integration\n');
console.log('=' .repeat(60));

// Check environment setup
console.log('\n📋 Environment Check:');
console.log('-'.repeat(60));

if (process.env.OPENAI_API_KEY) {
  console.log('✅ OPENAI_API_KEY is set');
  const keyPreview = process.env.OPENAI_API_KEY.substring(0, 10) + '...';
  console.log(`   Preview: ${keyPreview}`);
} else {
  console.log('❌ OPENAI_API_KEY is not set');
  console.log('   Please set it in your .env file:');
  console.log('   OPENAI_API_KEY=your-api-key-here');
  process.exit(1);
}

console.log('\n🔌 Service Availability:');
console.log('-'.repeat(60));
if (isWhisperAvailable()) {
  console.log('✅ Whisper service is available');
} else {
  console.log('❌ Whisper service is not available');
  process.exit(1);
}

// Test with a sample audio file
async function testWhisperTranscription() {
  console.log('\n🎤 Testing Whisper Transcription:');
  console.log('-'.repeat(60));
  
  // Create a test audio file path
  const testAudioPath = path.join(__dirname, 'test-audio.webm');
  
  if (!fs.existsSync(testAudioPath)) {
    console.log('⚠️ No test audio file found at:', testAudioPath);
    console.log('\nTo test with real audio:');
    console.log('1. Record a short audio file (webm, mp3, or wav format)');
    console.log('2. Save it as: server/scripts/test-audio.webm');
    console.log('3. Run this test again');
    console.log('\n✅ Whisper service is properly configured and ready to use!');
    return;
  }
  
  try {
    console.log('📂 Reading test audio file...');
    const audioBuffer = fs.readFileSync(testAudioPath);
    console.log(`   - File size: ${audioBuffer.length} bytes`);
    
    console.log('\n🚀 Calling Whisper API...');
    const startTime = Date.now();
    
    const result = await transcribeWithWhisper(audioBuffer, 'test-audio.webm');
    
    const duration = Date.now() - startTime;
    
    console.log('\n✅ Transcription successful!');
    console.log(`   - Time taken: ${duration}ms`);
    console.log(`   - Transcript length: ${result.transcript.length} characters`);
    console.log(`   - Word count: ${result.words.length} words`);
    console.log(`   - Language: ${result.language}`);
    console.log(`   - Duration: ${result.duration}s`);
    
    console.log('\n📝 Transcript:');
    console.log('-'.repeat(60));
    console.log(result.transcript);
    
    if (result.words.length > 0) {
      console.log('\n🔤 Sample Word Timings (first 5 words):');
      console.log('-'.repeat(60));
      result.words.slice(0, 5).forEach((word, idx) => {
        console.log(`${idx + 1}. "${word.word}"`);
        console.log(`   Start: ${word.startTime.seconds.toFixed(2)}s`);
        console.log(`   End: ${word.endTime.seconds.toFixed(2)}s`);
        console.log(`   Confidence: ${word.confidence}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Whisper integration test passed!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testWhisperTranscription().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
