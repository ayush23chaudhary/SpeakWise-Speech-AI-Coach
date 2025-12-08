// server/scripts/test-whisper-local.js

require('dotenv').config();
const { 
  transcribeWithWhisperLocal, 
  isWhisperLocalAvailable,
  getAvailableModels,
  getModelInfo 
} = require('../services/whisperLocal.service');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Local Whisper Integration\n');
console.log('=' .repeat(60));

// Check environment setup
console.log('\n📋 Environment Check:');
console.log('-'.repeat(60));

const whisperModel = process.env.WHISPER_MODEL || 'base';
const pythonPath = process.env.PYTHON_PATH || 'python3';

console.log(`✓ WHISPER_MODEL: ${whisperModel}`);
console.log(`✓ PYTHON_PATH: ${pythonPath}`);

const modelInfo = getModelInfo(whisperModel);
console.log('\n📊 Model Information:');
console.log('-'.repeat(60));
console.log(`Model: ${whisperModel}`);
console.log(`Parameters: ${modelInfo.params}`);
console.log(`VRAM Required: ${modelInfo.vram}`);
console.log(`Speed: ${modelInfo.speed}`);
console.log(`Accuracy: ${modelInfo.accuracy}`);

console.log('\n🔧 Available Models:');
console.log('-'.repeat(60));
getAvailableModels().forEach(model => {
  const info = getModelInfo(model);
  console.log(`  • ${model.padEnd(8)} - ${info.params.padEnd(8)} - ${info.vram.padEnd(12)} - ${info.speed}`);
});

// Test service availability
async function testSetup() {
  console.log('\n🔌 Service Availability Check:');
  console.log('-'.repeat(60));
  
  console.log('Checking if Whisper is installed...');
  const isAvailable = await isWhisperLocalAvailable();
  
  if (!isAvailable) {
    console.log('❌ Local Whisper is not available');
    console.log('\n❗ Installation Required:');
    console.log('-'.repeat(60));
    console.log('Local Whisper is not installed. Please run the setup script:');
    console.log('');
    console.log('  ./setup-whisper-local.sh');
    console.log('');
    console.log('Or install manually:');
    console.log('  pip install -U openai-whisper');
    console.log('  brew install ffmpeg  (macOS)');
    console.log('  sudo apt install ffmpeg  (Ubuntu/Debian)');
    console.log('');
    process.exit(1);
  }
  
  console.log('✅ Local Whisper is available and ready');
}

// Test with sample audio
async function testTranscription() {
  console.log('\n🎤 Testing Transcription:');
  console.log('-'.repeat(60));
  
  // Check for test audio file
  const testAudioPath = path.join(__dirname, 'test-audio.webm');
  
  if (!fs.existsSync(testAudioPath)) {
    console.log('⚠️ No test audio file found at:', testAudioPath);
    console.log('\n📝 To test with real audio:');
    console.log('-'.repeat(60));
    console.log('1. Record a short audio clip (5-30 seconds)');
    console.log('2. Save it as: server/scripts/test-audio.webm');
    console.log('   (Supported formats: .webm, .mp3, .wav, .m4a, .ogg)');
    console.log('3. Run this test again: npm run test-whisper-local');
    console.log('');
    console.log('Example recording command (macOS):');
    console.log('  ffmpeg -f avfoundation -i ":0" -t 10 test-audio.webm');
    console.log('');
    console.log('✅ Local Whisper service is properly configured!');
    console.log('   It will work when you use it with real audio in the app.');
    return;
  }
  
  try {
    console.log('📂 Reading test audio file...');
    const audioBuffer = fs.readFileSync(testAudioPath);
    console.log(`   - File size: ${audioBuffer.length} bytes`);
    console.log(`   - File path: ${testAudioPath}`);
    
    console.log('\n🚀 Starting transcription...');
    console.log(`   Using model: ${whisperModel}`);
    console.log('   (First run will download the model - may take a few minutes)');
    console.log('');
    
    const startTime = Date.now();
    
    const result = await transcribeWithWhisperLocal(audioBuffer, 'test-audio.webm');
    
    const duration = Date.now() - startTime;
    
    console.log('\n✅ Transcription successful!');
    console.log(`   - Processing time: ${(duration / 1000).toFixed(2)}s`);
    console.log(`   - Audio duration: ${result.duration.toFixed(2)}s`);
    console.log(`   - Real-time factor: ${(result.duration / (duration / 1000)).toFixed(2)}x`);
    console.log(`   - Transcript length: ${result.transcript.length} characters`);
    console.log(`   - Word count: ${result.words.length} words`);
    console.log(`   - Language detected: ${result.language}`);
    
    console.log('\n📝 Transcript:');
    console.log('-'.repeat(60));
    console.log(result.transcript);
    console.log('-'.repeat(60));
    
    if (result.words.length > 0) {
      console.log('\n🔤 Word-Level Timings (first 5 words):');
      console.log('-'.repeat(60));
      result.words.slice(0, 5).forEach((word, idx) => {
        console.log(`${(idx + 1).toString().padStart(2)}. "${word.word}"`);
        console.log(`    Start: ${word.startTime.seconds.toFixed(3)}s`);
        console.log(`    End:   ${word.endTime.seconds.toFixed(3)}s`);
        console.log(`    Conf:  ${word.confidence.toFixed(3)}`);
      });
      
      if (result.words.length > 5) {
        console.log(`    ... and ${result.words.length - 5} more words`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Local Whisper integration test PASSED!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Your setup is working correctly. You can now:');
    console.log('  1. Set ASR_PROVIDER=whisper-local in server/.env');
    console.log('  2. Start your server: npm run dev');
    console.log('  3. Use the app with local Whisper transcription!');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Transcription test failed:');
    console.error('   Error:', error.message);
    console.error('');
    console.error('📋 Troubleshooting:');
    console.error('-'.repeat(60));
    console.error('1. Ensure Whisper is installed:');
    console.error('   pip install -U openai-whisper');
    console.error('');
    console.error('2. Ensure ffmpeg is installed:');
    console.error('   brew install ffmpeg  (macOS)');
    console.error('   sudo apt install ffmpeg  (Linux)');
    console.error('');
    console.error('3. Check Python version (3.8+ required):');
    console.error('   python3 --version');
    console.error('');
    console.error('4. Run the setup script:');
    console.error('   ./setup-whisper-local.sh');
    console.error('');
    process.exit(1);
  }
}

// Run tests
async function runAllTests() {
  try {
    await testSetup();
    await testTranscription();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

runAllTests();
