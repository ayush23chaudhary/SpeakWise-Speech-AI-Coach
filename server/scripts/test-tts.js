/**
 * Test script for Google Text-to-Speech service
 * Run with: node scripts/test-tts.js
 */

require('dotenv').config();
const ttsService = require('../services/textToSpeech.service');
const fs = require('fs');
const path = require('path');

async function testTTS() {
  console.log('🎤 Testing Google Text-to-Speech Service...\n');

  try {
    // Test 1: Generate intro audio
    console.log('1️⃣ Testing interview intro...');
    const introAudio = await ttsService.generateInterviewIntro('John', 'Software Engineer');
    console.log(`✅ Intro generated: ${introAudio.length} bytes`);

    // Save to file for manual verification
    const introPath = path.join(__dirname, '../test-audio-intro.mp3');
    fs.writeFileSync(introPath, introAudio);
    console.log(`📁 Saved to: ${introPath}\n`);

    // Test 2: Generate question audio
    console.log('2️⃣ Testing question audio...');
    const questionText = 'Can you describe a time when you had to work with a difficult team member? How did you handle the situation?';
    const questionAudio = await ttsService.generateInterviewQuestionAudio(questionText, 'Question 1 of 5');
    console.log(`✅ Question generated: ${questionAudio.length} bytes`);

    const questionPath = path.join(__dirname, '../test-audio-question.mp3');
    fs.writeFileSync(questionPath, questionAudio);
    console.log(`📁 Saved to: ${questionPath}\n`);

    // Test 3: Generate completion audio
    console.log('3️⃣ Testing completion audio...');
    const completionAudio = await ttsService.generateInterviewCompletion('John');
    console.log(`✅ Completion generated: ${completionAudio.length} bytes`);

    const completionPath = path.join(__dirname, '../test-audio-completion.mp3');
    fs.writeFileSync(completionPath, completionAudio);
    console.log(`📁 Saved to: ${completionPath}\n`);

    // Test 4: Test basic speech generation
    console.log('4️⃣ Testing basic speech...');
    const basicAudio = await ttsService.generateSpeech('Hello, this is a test of the text to speech system.');
    console.log(`✅ Basic speech generated: ${basicAudio.length} bytes\n`);

    console.log('✨ All tests passed!');
    console.log('\n📝 Test audio files saved in server directory:');
    console.log('   - test-audio-intro.mp3');
    console.log('   - test-audio-question.mp3');
    console.log('   - test-audio-completion.mp3');
    console.log('\n🎧 Play these files to verify audio quality.\n');

    // Cost estimation
    const totalChars = 
      'Hello John. Welcome to your Software Engineer interview. I\'ll be asking you a series of questions. Take your time to think through each answer, and speak clearly. Let\'s begin.'.length +
      'Question 1 of 5. Can you describe a time when you had to work with a difficult team member? How did you handle the situation?'.length +
      'Thank you John. You\'ve completed all the questions. I\'m now analyzing your responses and will have your detailed feedback ready shortly. Great job!'.length;

    const costPer1MChars = 16.00; // Neural2 voice pricing
    const estimatedCost = (totalChars / 1000000) * costPer1MChars;

    console.log('💰 Cost Analysis:');
    console.log(`   Total characters: ${totalChars}`);
    console.log(`   Estimated cost: $${estimatedCost.toFixed(6)} per interview`);
    console.log(`   Monthly cost (1000 interviews): $${(estimatedCost * 1000).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    
    if (error.message.includes('credentials')) {
      console.error('\n⚠️  Possible issue with Google Cloud credentials.');
      console.error('Make sure GOOGLE_APPLICATION_CREDENTIALS is set correctly in .env');
    }
    
    process.exit(1);
  }
}

// Run tests
testTTS()
  .then(() => {
    console.log('✅ TTS service is working correctly!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
