# AI-Powered Feedback System Setup Guide

## Overview

The SpeakWise application now includes **AI-powered feedback generation** using Google's Gemini AI. This enhancement provides personalized, contextual feedback based on multiple speech metrics including:

- **Transcript content** - What was actually said
- **Clarity Score** - Word recognition confidence
- **Fluency Score** - Speech smoothness and flow
- **Pace Score** - Speaking speed (WPM)
- **Confidence Score** - Overall delivery confidence
- **Filler Words** - Usage of um, uh, like, etc.

---

## Features

### 1. **AI-Generated Feedback**
The AI analyzes your speech performance and generates:
- ✅ **Strengths**: 2-4 specific things you did well
- 🎯 **Areas for Improvement**: 2-4 specific areas to work on
- 💡 **Recommendations**: 3-5 actionable tips and strategies

### 2. **Intelligent Fallback**
- If Gemini API is unavailable, the system automatically uses rule-based feedback
- No disruption to user experience

### 3. **Context-Aware Analysis**
The AI considers:
- Your actual transcript content
- Performance scores across multiple dimensions
- Speaking pace and filler word patterns
- Industry best practices for public speaking

---

## Setup Instructions

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key

### Step 2: Configure Environment Variables

Open `/server/.env` and update the `GEMINI_API_KEY`:

```env
# Google Gemini AI API (for AI-powered feedback generation)
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**⚠️ Important**: Replace `your_actual_gemini_api_key_here` with your real API key from Step 1.

### Step 3: Restart the Server

```bash
cd server
npm run dev
```

The server will now use AI-powered feedback generation!

---

## How It Works

### Architecture

```
User Records Speech
        ↓
Google Speech-to-Text API
        ↓
Transcript + Metrics Calculated
        ↓
Gemini AI Analyzes Performance
        ↓
AI-Generated Feedback Returned
```

### Metrics Used for AI Analysis

| Metric | Description | Impact on Feedback |
|--------|-------------|-------------------|
| **Clarity** | Word recognition accuracy | Pronunciation quality feedback |
| **Fluency** | Speech smoothness | Flow and hesitation feedback |
| **Pace** | Words per minute | Speaking speed recommendations |
| **Confidence** | Overall delivery strength | Presence and authority feedback |
| **Filler Words** | um, uh, like, etc. | Verbal habit reduction tips |
| **Transcript** | Actual content | Content-specific suggestions |

### Scoring System

- **Overall Score**: Weighted average of all metrics (0-100)
  - Clarity: 30%
  - Fluency: 30%
  - Pace: 20%
  - Confidence: 20%

- **Pace Ranges**:
  - Too Slow: < 130 WPM
  - Good: 130-170 WPM
  - Too Fast: > 170 WPM

---

## Example Feedback

### High-Performing Speech (Score: 92)

**Strengths:**
- ✅ Exceptional clarity with a score of 95/100 demonstrates excellent pronunciation and enunciation
- ✅ Your speaking pace of 155 WPM falls perfectly within the ideal range, making your speech engaging and easy to follow
- ✅ Zero filler words detected - your speech was clean, professional, and confident

**Areas for Improvement:**
- 🎯 While your fluency score of 82/100 is solid, there were a few minor hesitations that could be smoothed out

**Recommendations:**
- 💡 Continue practicing your current speaking style as it's highly effective
- 💡 To improve fluency, try recording yourself and identifying specific moments where you pause unnecessarily
- 💡 Consider using hand gestures strategically to emphasize key points and maintain engagement

### Needs Improvement Speech (Score: 68)

**Strengths:**
- ✅ Your clarity score of 78/100 shows you can be understood, providing a solid foundation to build upon
- ✅ You successfully delivered your message and completed the speech

**Areas for Improvement:**
- 🎯 Speaking pace of 195 WPM is too fast (ideal: 130-170 WPM), which may overwhelm listeners
- 🎯 High usage of filler words: 12 total, especially "um" (7x) and "like" (5x)
- 🎯 Fluency score of 62/100 indicates significant hesitations and interruptions in flow

**Recommendations:**
- 💡 Practice deliberate pauses after key sentences to naturally slow your pace and give your audience time to absorb information
- 💡 Record yourself practicing and identify your trigger moments for filler words - awareness is the first step to elimination
- 💡 Try the "pause practice" technique: replace every filler word with a 1-2 second silent pause
- 💡 Rehearse your speech multiple times to build confidence and reduce hesitations
- 💡 Use breathing exercises before speaking to calm nerves and improve delivery control

---

## API Costs

### Gemini 1.5 Flash Pricing (as of 2025)

- **Free Tier**: 15 requests per minute
- **Pay-as-you-go**: $0.00001 per input character (extremely affordable)

**Example Cost Calculation:**
- Average prompt size: ~1,000 characters
- Cost per analysis: ~$0.01 (1 cent)
- 100 analyses: ~$1.00

The AI feedback feature is **very cost-effective** for most use cases.

---

## Troubleshooting

### Issue: "Using rule-based feedback" message

**Solution:**
1. Check if `GEMINI_API_KEY` is set in `.env`
2. Verify your API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Restart the server after updating `.env`

### Issue: AI returns generic feedback

**Solution:**
- Ensure speech is at least 5 seconds long
- Speak clearly into the microphone
- Check that transcript is being generated correctly

### Issue: API quota exceeded

**Solution:**
- Check your quota at [Google AI Studio](https://makersuite.google.com/app/apikey)
- The system will automatically fall back to rule-based feedback
- Consider upgrading if you need higher limits

---

## Code Structure

### Files Modified/Created

```
server/
├── services/
│   └── aiAnalysis.service.js       # NEW: AI feedback generation logic
├── controllers/
│   └── speech.controller.js        # MODIFIED: Integrated AI service
├── .env                             # MODIFIED: Added GEMINI_API_KEY
└── package.json                     # MODIFIED: Added @google/generative-ai
```

### Key Functions

**`generateAIFeedback(analysisData)`**
- Main function that calls Gemini AI
- Input: Complete analysis data with metrics
- Output: Structured feedback object
- Handles errors gracefully with fallback

**`constructPrompt(data)`**
- Builds detailed prompt for AI model
- Includes all metrics and context
- Provides clear formatting instructions

**`parseAIResponse(text)`**
- Parses AI JSON response
- Validates structure
- Handles edge cases

**`generateRuleBasedFeedback(data)`**
- Fallback when AI is unavailable
- Uses predefined rules and thresholds
- Ensures consistent user experience

---

## Best Practices

### For Developers

1. **Always check API key availability** before deploying
2. **Monitor API usage** to avoid unexpected costs
3. **Test fallback logic** regularly
4. **Keep prompts updated** with latest speech coaching practices
5. **Log AI responses** for quality monitoring

### For Users

1. **Speak clearly** for 10-30 seconds
2. **Use a good microphone** for better transcription
3. **Practice in a quiet environment**
4. **Review feedback carefully** and implement suggestions
5. **Track progress over time** by comparing reports

---

## Future Enhancements

Potential improvements for the AI feedback system:

- [ ] Emotion/tone analysis using additional APIs
- [ ] Multi-language support
- [ ] Historical progress tracking with AI insights
- [ ] Personalized coaching based on user history
- [ ] Voice modulation and pitch analysis
- [ ] Comparison with industry benchmarks
- [ ] Video analysis integration (facial expressions, body language)

---

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with sample audio files first
4. Review the Gemini API documentation: https://ai.google.dev/docs

---

## License & Credits

- **Google Gemini AI**: Used for intelligent feedback generation
- **Google Speech-to-Text**: Used for transcription
- **SpeakWise Development Team**: Implementation and integration

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
