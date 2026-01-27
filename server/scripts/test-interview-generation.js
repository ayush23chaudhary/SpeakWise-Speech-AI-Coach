const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testQuestionGeneration() {
  try {
    console.log('🧪 Testing Interview Question Generation with gemini-2.5-flash...\n');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Generate 2 technical interview questions for a Software Engineer position.

Return ONLY a valid JSON array with this format:
[
  {
    "question": "Your question here",
    "category": "technical",
    "difficulty": "medium",
    "expectedKeyPoints": ["Point 1", "Point 2", "Point 3"],
    "timeLimit": 180
  }
]`;

    console.log('📤 Sending request to Gemini API...');
    const startTime = Date.now();
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Response received in ${duration} seconds\n`);
    
    // Extract JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('❌ Failed to extract JSON from response');
      console.log('Raw response:', response.substring(0, 200));
      return;
    }
    
    const questions = JSON.parse(jsonMatch[0]);
    console.log(`✅ Successfully parsed ${questions.length} questions:\n`);
    
    questions.forEach((q, i) => {
      console.log(`Question ${i + 1}:`);
      console.log(`  📝 ${q.question}`);
      console.log(`  🏷️  Category: ${q.category}`);
      console.log(`  📊 Difficulty: ${q.difficulty}`);
      console.log(`  ⏱️  Time Limit: ${q.timeLimit}s`);
      console.log(`  ✓ Key Points: ${q.expectedKeyPoints.length}`);
      console.log('');
    });
    
    console.log('✅ Interview question generation is WORKING!');
    console.log('🎉 AI Interview Mode should now work correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('404')) {
      console.log('\n⚠️  Model not found! The model name might be wrong.');
      console.log('Try: gemini-2.5-flash, gemini-2.5-pro, or gemini-2.0-flash');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n⚠️  API Key is invalid or expired!');
      console.log('Get a new key from: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('429')) {
      console.log('\n⚠️  Rate limit exceeded! Wait a minute and try again.');
    }
  }
}

console.log('🔍 Checking GEMINI_API_KEY...');
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in .env file!');
  process.exit(1);
}
console.log('✅ API Key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...\n');

testQuestionGeneration();
