// server/services/aiAnalysis.service.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize AI providers
let genAI;
let openai;

// Try to initialize Gemini
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error.message);
}

// Try to initialize OpenAI if available
try {
  if (process.env.OPENAI_API_KEY) {
    const { OpenAI } = require('openai');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  // OpenAI SDK not installed or key not provided
  console.log('ℹ️ OpenAI not configured');
}

/**
 * Generate AI-powered feedback based on speech analysis metrics
 * @param {Object} analysisData - Complete analysis data including metrics, transcript, etc.
 * @returns {Promise<Object>} - Object containing strengths, areasForImprovement, and recommendations
 */
async function generateAIFeedback(analysisData) {
  // Try OpenAI first (more reliable), then Gemini, then fallback to rule-based
  
  if (openai && process.env.OPENAI_API_KEY) {
    try {
      return await generateOpenAIFeedback(analysisData);
    } catch (error) {
      console.error('❌ OpenAI feedback failed:', error.message);
    }
  }
  
  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      return await generateGeminiFeedback(analysisData);
    } catch (error) {
      console.error('❌ Gemini feedback failed:', error.message);
    }
  }
  
  console.warn('⚠️ No AI providers configured. Using rule-based feedback.');
  return generateRuleBasedFeedback(analysisData);
}

/**
 * Generate feedback using OpenAI GPT
 */
async function generateOpenAIFeedback(analysisData) {
  const prompt = constructPrompt(analysisData);
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are an expert speech coach providing constructive feedback on speech performances. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const text = completion.choices[0].message.content;
  const feedback = parseAIResponse(text);
  
  console.log('✅ OpenAI feedback generated successfully');
  return feedback;
}

/**
 * Generate feedback using Google Gemini
 */
async function generateGeminiFeedback(analysisData) {
  // Use gemini-2.0-flash model (latest available in Google AI Studio)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Construct a detailed prompt with all the metrics
  const prompt = constructPrompt(analysisData);

  // Generate content using Gemini
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Parse the AI response
  const feedback = parseAIResponse(text);
  
  console.log('✅ Gemini feedback generated successfully');
  return feedback;
}

/**
 * Construct a detailed prompt for the AI model
 */
function constructPrompt(data) {
  const { transcript, metrics, pace, fillerWords, overallScore } = data;
  
  const fillerWordCount = Object.values(fillerWords).reduce((sum, count) => sum + count, 0);
  const fillerWordDetails = Object.entries(fillerWords)
    .map(([word, count]) => `"${word}": ${count} times`)
    .join(', ');

  return `You are an expert speech coach analyzing a speech performance. Provide constructive, personalized feedback based on the following data:

**Speech Transcript:**
"${transcript}"

**Performance Metrics:**
- Overall Score: ${overallScore}/100
- Clarity Score: ${metrics.clarity}/100 (based on word recognition confidence)
- Fluency Score: ${metrics.fluency}/100 (affected by pauses and filler words)
- Pace Score: ${metrics.pace}/100
- Confidence Score: ${metrics.confidence}/100
- Tone Score: ${metrics.tone}/100

**Speaking Pace:**
- Words Per Minute: ${pace.wordsPerMinute} WPM
- Status: ${pace.status}
- Ideal Range: 130-170 WPM

**Filler Words Detected:**
${fillerWordCount > 0 ? `Total: ${fillerWordCount} filler words (${fillerWordDetails})` : 'No filler words detected'}

**Instructions:**
Analyze this speech performance and provide feedback in the following JSON format:

{
  "strengths": [
    "List 2-4 specific strengths based on the metrics",
    "Focus on what the speaker did well",
    "Be encouraging and specific"
  ],
  "areasForImprovement": [
    "List 2-4 areas that need improvement",
    "Be constructive and specific",
    "Reference the metrics that scored lower"
  ],
  "recommendations": [
    "Provide 3-5 actionable recommendations",
    "Give practical tips the speaker can implement",
    "Prioritize based on the biggest areas for improvement"
  ]
}

**Guidelines:**
1. Be specific and reference actual metrics (e.g., "Your clarity score of 95/100 shows excellent pronunciation")
2. If pace is too fast (>170 WPM), recommend slowing down with pauses
3. If pace is too slow (<130 WPM), recommend more dynamic delivery
4. If filler words are high, provide strategies to reduce them
5. If clarity is low, suggest enunciation exercises
6. If fluency is low, recommend practice and preparation strategies
7. Keep all feedback professional, constructive, and actionable
8. Limit each array to maximum lengths mentioned above
9. Return ONLY the JSON object, no additional text

Generate the feedback now:`;
}

/**
 * Parse the AI response and extract structured feedback
 */
function parseAIResponse(text) {
  try {
    // Remove markdown code blocks if present
    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '');
    cleanedText = cleanedText.replace(/```\n?/g, '');
    cleanedText = cleanedText.trim();

    // Parse JSON
    const feedback = JSON.parse(cleanedText);

    // Validate structure
    if (!feedback.strengths || !feedback.areasForImprovement || !feedback.recommendations) {
      throw new Error('Invalid feedback structure');
    }

    // Ensure arrays and limit lengths
    return {
      strengths: Array.isArray(feedback.strengths) 
        ? feedback.strengths.slice(0, 4) 
        : [feedback.strengths],
      areasForImprovement: Array.isArray(feedback.areasForImprovement) 
        ? feedback.areasForImprovement.slice(0, 4) 
        : [feedback.areasForImprovement],
      recommendations: Array.isArray(feedback.recommendations) 
        ? feedback.recommendations.slice(0, 5) 
        : [feedback.recommendations],
    };

  } catch (error) {
    console.error('❌ Error parsing AI response:', error.message);
    console.log('   AI Response:', text.substring(0, 200));
    throw new Error('Failed to parse AI response');
  }
}

/**
 * Fallback rule-based feedback generation (original logic)
 */
function generateRuleBasedFeedback(data) {
  const { metrics, pace, fillerWords } = data;
  const fillerWordCount = Object.values(fillerWords).reduce((sum, count) => sum + count, 0);

  const strengths = [];
  const areasForImprovement = [];
  const recommendations = [];

  // Strengths Logic
  if (pace.status === 'Good') {
    strengths.push("Your speaking pace was excellent and engaging, maintaining an ideal rhythm throughout.");
  }
  if (metrics.clarity > 90) {
    strengths.push("Exceptional clarity - your words were very easy to understand with excellent pronunciation.");
  } else if (metrics.clarity > 80) {
    strengths.push("Good clarity in your speech, with clear pronunciation on most words.");
  }
  
  if (fillerWordCount === 0) {
    strengths.push("Fantastic job avoiding filler words - your speech was clean and professional.");
  } else if (fillerWordCount < 3) {
    strengths.push("Minimal use of filler words, showing good speaking discipline.");
  }
  
  if (metrics.fluency > 85) {
    strengths.push("Excellent fluency with smooth transitions and natural flow.");
  }
  
  if (metrics.confidence > 80) {
    strengths.push("Strong confidence in delivery, projecting authority and credibility.");
  }

  // Improvement & Recommendation Logic
  if (pace.status === 'Too Fast') {
    areasForImprovement.push(`Speaking pace was too fast at ${pace.wordsPerMinute} WPM (ideal: 130-170 WPM).`);
    recommendations.push("Try to build in deliberate pauses after key sentences to control your speed and allow your audience to digest information.");
    recommendations.push("Practice with a metronome or timer to develop a consistent, measured pace.");
  } else if (pace.status === 'Too Slow') {
    areasForImprovement.push(`Speaking pace was too slow at ${pace.wordsPerMinute} WPM (ideal: 130-170 WPM).`);
    recommendations.push("Work on increasing your energy and enthusiasm to naturally speed up your delivery.");
    recommendations.push("Practice condensing your points and removing unnecessary pauses.");
  }

  if (metrics.fluency < 70) {
    areasForImprovement.push("Speech fluency could be improved - detected hesitations and interruptions in flow.");
    recommendations.push("Practice your speech multiple times to become more comfortable with the content.");
    recommendations.push("When you catch yourself using a filler word, try to replace it with a silent pause.");
  }

  if (fillerWordCount > 5) {
    const topFillers = Object.entries(fillerWords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([word, count]) => `"${word}" (${count}x)`)
      .join(' and ');
    areasForImprovement.push(`High usage of filler words: ${fillerWordCount} total, especially ${topFillers}.`);
    recommendations.push("Record yourself and identify your most common filler words to build awareness.");
  }

  if (metrics.clarity < 80) {
    areasForImprovement.push("Clarity could be improved - some words were difficult to understand.");
    recommendations.push("Focus on enunciation by exaggerating mouth movements during practice.");
    recommendations.push("Speak slightly slower and emphasize consonants for better clarity.");
  }

  if (metrics.confidence < 70) {
    areasForImprovement.push("Confidence level could be strengthened in your delivery.");
    recommendations.push("Practice power poses before speaking to boost confidence naturally.");
    recommendations.push("Make eye contact with your audience and use purposeful gestures.");
  }

  // Ensure we have at least one item in each category
  if (strengths.length === 0) {
    strengths.push("You completed the speech and provided content for analysis.");
  }
  if (areasForImprovement.length === 0) {
    areasForImprovement.push("Continue to refine your speaking skills with regular practice.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Keep practicing regularly to maintain and improve your speaking abilities.");
  }

  return { strengths, areasForImprovement, recommendations };
}

module.exports = {
  generateAIFeedback,
  generateRuleBasedFeedback,
};
