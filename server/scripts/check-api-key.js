const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkAPIKey() {
  try {
    console.log('🔍 Checking Gemini API Key...\n');
    console.log('API Key:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...\n');
    
    // Try to list models using fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    
    console.log('Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      
      if (response.status === 401 || response.status === 403) {
        console.log('\n⚠️  API Key is INVALID or EXPIRED!');
        console.log('🔑 Get a new key from: https://aistudio.google.com/app/apikey');
      } else if (response.status === 404) {
        console.log('\n⚠️  API endpoint not found');
      }
      return;
    }
    
    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      console.log('✅ API Key is VALID!\n');
      console.log('Available models:');
      data.models.forEach(model => {
        const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
        const status = supportsGenerate ? '✅' : '❌';
        console.log(`  ${status} ${model.name}`);
      });
      
      console.log('\n📝 Recommended models for interview questions:');
      const goodModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      goodModels.slice(0, 3).forEach(model => {
        console.log(`  - ${model.name}`);
      });
    } else {
      console.log('❌ No models available for this API key');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAPIKey();
