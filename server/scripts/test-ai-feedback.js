// server/scripts/test-ai-feedback.js
// Quick test script to verify AI feedback generation

require('dotenv').config();
const { generateAIFeedback } = require('../services/aiAnalysis.service');

// Sample test data simulating a speech analysis
const testData = {
  transcript: "Hello everyone, um, today I want to talk about the importance of, like, public speaking. It's really important for, you know, career development and personal growth.",
  overallScore: 72,
  metrics: {
    clarity: 85,
    fluency: 68,
    pace: 75,
    confidence: 70,
    tone: 75
  },
  pace: {
    wordsPerMinute: 145,
    status: 'Good'
  },
  fillerWords: {
    'um': 2,
    'like': 1,
    'you know': 1
  }
};

async function testAIFeedback() {
  console.log('🧪 Testing AI Feedback Generation\n');
  console.log('━'.repeat(50));
  
  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.log('⚠️  WARNING: GEMINI_API_KEY not configured');
    console.log('   Will test fallback to rule-based feedback\n');
  } else {
    console.log('✅ GEMINI_API_KEY is configured\n');
  }

  console.log('📊 Test Data:');
  console.log('   Transcript:', testData.transcript);
  console.log('   Overall Score:', testData.overallScore);
  console.log('   Clarity:', testData.metrics.clarity);
  console.log('   Fluency:', testData.metrics.fluency);
  console.log('   Pace:', testData.pace.wordsPerMinute, 'WPM');
  console.log('   Filler Words:', Object.values(testData.fillerWords).reduce((a, b) => a + b, 0));
  console.log('\n' + '━'.repeat(50));
  
  try {
    console.log('\n🤖 Generating feedback...\n');
    const startTime = Date.now();
    
    const feedback = await generateAIFeedback(testData);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Feedback generated in ${duration}ms\n`);
    console.log('━'.repeat(50));
    
    console.log('\n💪 STRENGTHS:');
    feedback.strengths.forEach((strength, idx) => {
      console.log(`   ${idx + 1}. ${strength}`);
    });
    
    console.log('\n🎯 AREAS FOR IMPROVEMENT:');
    feedback.areasForImprovement.forEach((area, idx) => {
      console.log(`   ${idx + 1}. ${area}`);
    });
    
    console.log('\n💡 RECOMMENDATIONS:');
    feedback.recommendations.forEach((rec, idx) => {
      console.log(`   ${idx + 1}. ${rec}`);
    });
    
    console.log('\n' + '━'.repeat(50));
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testAIFeedback();
