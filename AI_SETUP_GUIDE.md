# 🤖 AI Feedback Setup Guide

## Overview

SpeakWise now supports **AI-powered feedback generation** for speech analysis! The system provides intelligent, personalized feedback based on your speech metrics, transcript, and performance.

## 🎯 Supported AI Providers

The system supports **multiple AI providers** with automatic fallback:

### 1. **OpenAI GPT (Recommended) ✅**
- **Model**: GPT-3.5-turbo
- **Reliability**: Very High
- **Cost**: Pay-per-use (~$0.002 per analysis)
- **Setup**: Easy
- **Best for**: Production use

### 2. **Google Gemini**
- **Model**: Gemini-1.5-Pro
- **Reliability**: Good (but some API key issues)
- **Cost**: Free tier available
- **Setup**: Easy
- **Best for**: Development/testing

### 3. **Rule-Based Fallback**
- **Reliability**: Always works
- **Cost**: Free
- **Best for**: Offline mode or when APIs fail

---

## 🚀 Quick Setup

### Option 1: Using OpenAI (Recommended)

1. **Get an API key** from OpenAI:
   - Visit: https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-...`)

2. **Add to your `.env` file**:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Test it**:
   ```bash
   npm run test-ai-feedback
   ```

### Option 2: Using Google Gemini

1. **Get an API key** from Google AI Studio:
   - Visit: https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy the key

2. **Add to your `.env` file**:
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. **Test it**:
   ```bash
   npm run test-ai-feedback
   ```

---

## 📋 Environment Variables

Your `.env` file should include:

```env
# AI Feedback Configuration
# The system will try OpenAI first, then Gemini, then fallback to rule-based

# OpenAI (Recommended - most reliable)
OPENAI_API_KEY=sk-your-openai-key-here

# Google Gemini (Alternative)
GEMINI_API_KEY=your-gemini-key-here
```

---

## 🧪 Testing

Test your AI configuration:

```bash
cd server
npm run test-ai-feedback
```

Expected output:
```
🤖 Generating feedback...
✅ OpenAI feedback generated successfully
✅ Feedback generated in 1234ms

💪 STRENGTHS:
   1. Your speaking pace was excellent and engaging...
   2. Exceptional clarity - your words were very easy to understand...

🎯 AREAS FOR IMPROVEMENT:
   1. Slight hesitation detected in the middle section...

💡 RECOMMENDATIONS:
   1. Practice your speech multiple times to build confidence...
   2. Try to replace filler words with silent pauses...
```

---

## 💡 How It Works

### 1. **AI Provider Selection**
The system tries providers in this order:
1. OpenAI (if `OPENAI_API_KEY` is set)
2. Gemini (if `GEMINI_API_KEY` is set)
3. Rule-based fallback (always works)

### 2. **Data Analyzed**
The AI considers:
- ✅ Complete transcript of your speech
- ✅ Clarity score (pronunciation quality)
- ✅ Fluency score (smoothness of delivery)
- ✅ Speaking pace (words per minute)
- ✅ Confidence score
- ✅ Tone analysis
- ✅ Filler word usage (um, uh, like, etc.)
- ✅ Overall performance score

### 3. **Feedback Generated**
The AI provides:
- **Strengths** (2-4 specific positive points)
- **Areas for Improvement** (2-4 constructive points)
- **Recommendations** (3-5 actionable tips)

---

## 🔧 Troubleshooting

### Issue: "OpenAI feedback failed"
**Solution**: Check your API key:
```bash
# Verify key is set
echo $OPENAI_API_KEY

# Or check .env file
cat .env | grep OPENAI
```

### Issue: "Gemini feedback failed: 404 Not Found"
**Solutions**:
1. Your API key might be invalid - regenerate it
2. Try using OpenAI instead
3. System will automatically fallback to rule-based feedback

### Issue: "Using rule-based feedback"
**This means**: No AI keys are configured, but the app still works!
- Add an OpenAI or Gemini key to enable AI feedback

### Issue: "Rate limit exceeded"
**Solutions**:
1. Wait a few seconds and try again
2. For OpenAI: Check your usage limits
3. For Gemini: Switch to OpenAI

---

## 💰 Cost Estimation

### OpenAI Pricing (GPT-3.5-turbo)
- **Input**: $0.50 per 1M tokens
- **Output**: $1.50 per 1M tokens
- **Per analysis**: ~$0.002 (very cheap!)
- **1000 analyses**: ~$2.00

### Google Gemini Pricing
- **Free tier**: 60 requests per minute
- **Paid tier**: Varies by region
- **Best for**: Development/testing

---

## 🎓 Examples

### Sample AI Feedback Output

**For a speech with good pace but some filler words:**

```json
{
  "strengths": [
    "Your speaking pace of 145 WPM was excellent and engaging",
    "Exceptional clarity score of 92/100 shows great pronunciation",
    "Strong confidence in delivery throughout the presentation"
  ],
  "areasForImprovement": [
    "Detected 8 filler words which slightly disrupted fluency",
    "Some hesitation in the middle section affected flow"
  ],
  "recommendations": [
    "Practice replacing 'um' and 'uh' with brief silent pauses",
    "Record yourself and identify your most common filler words",
    "Focus on breathing at natural sentence breaks to maintain composure",
    "Try the 'power pose' technique before speaking to boost confidence"
  ]
}
```

---

## 🔐 Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for all API keys
- **Rotate keys regularly** for security
- **Monitor usage** to avoid unexpected charges

---

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [SpeakWise AI Service Code](./server/services/aiAnalysis.service.js)

---

## ✅ Verification Checklist

- [ ] API key added to `.env` file
- [ ] No syntax errors in `.env`
- [ ] Test script runs successfully
- [ ] AI feedback appears in test output
- [ ] No rate limit errors

---

Need help? The system will automatically fallback to rule-based feedback if AI providers fail, so your app will always work! 🎉
