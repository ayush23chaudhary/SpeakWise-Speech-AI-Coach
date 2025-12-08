# Quick Start Guide - AI Feedback Feature

## 🚀 Get Started in 3 Steps

### Step 1: Get Your Gemini API Key (2 minutes)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" 
4. Copy the key

### Step 2: Add API Key to .env

Open `server/.env` and replace:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

With your actual key:
```
GEMINI_API_KEY=AIzaSyD...your-actual-key...
```

### Step 3: Test It!

```bash
cd server
npm run test-ai-feedback
```

You should see AI-generated feedback! 🎉

---

## ✅ Verify Installation

Run the test to make sure everything works:

```bash
npm run test-ai-feedback
```

**Expected Output:**
```
✅ GEMINI_API_KEY is configured
🤖 Generating feedback...
✅ Feedback generated in 2500ms

💪 STRENGTHS:
   1. Your speaking pace of 145 WPM falls within the ideal range...
   2. Clarity score of 85/100 demonstrates good pronunciation...

🎯 AREAS FOR IMPROVEMENT:
   1. Detected 4 filler words which could be reduced...
   2. Fluency score of 68/100 suggests room for improvement...

💡 RECOMMENDATIONS:
   1. Practice replacing filler words with silent pauses...
   2. Rehearse your speech multiple times to build confidence...
   ...
```

---

## 🎯 What Gets Analyzed?

The AI examines:

✅ **Transcript Content** - What you actually said  
✅ **Clarity (0-100)** - How clear your pronunciation is  
✅ **Fluency (0-100)** - How smoothly you speak  
✅ **Pace (WPM)** - Your speaking speed  
✅ **Confidence (0-100)** - Overall delivery strength  
✅ **Filler Words** - um, uh, like, you know, etc.  

Then generates personalized:
- 💪 Strengths (what you did well)
- 🎯 Areas for Improvement (what to work on)
- 💡 Recommendations (actionable tips)

---

## 🔧 Troubleshooting

### "Using rule-based feedback" warning?

**Cause**: API key not configured or invalid

**Fix**:
1. Check `.env` has real API key (not placeholder)
2. Verify key at: https://makersuite.google.com/app/apikey
3. Restart server: `npm run dev`

### Test fails with API error?

**Cause**: Network issue or quota exceeded

**Fix**:
1. Check internet connection
2. Verify API quota at Google AI Studio
3. System will auto-fallback to rule-based feedback

---

## 💰 Cost

**Free Tier**: 15 requests/minute (plenty for testing!)

**Paid**: ~$0.01 per analysis (very cheap)

**100 analyses ≈ $1.00** 💵

---

## 📚 Full Documentation

See `AI_FEEDBACK_SETUP.md` for complete details, examples, and advanced configuration.

---

## 🎉 You're Ready!

Start the server and try recording a speech:

```bash
npm run dev
```

Your feedback will now be AI-powered! 🤖✨
