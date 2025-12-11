# Speech Transcription Implementation

## Current Setup

### Google Speech-to-Text API (Recommended for Transcription)
- **Used for**: Audio-to-text transcription with word-level timing
- **API**: `@google-cloud/speech` package
- **Credentials**: `google-credentials.json` file
- **Benefits**:
  - Specialized for speech recognition
  - Provides word-level timing and confidence scores
  - Highly accurate for various accents and audio qualities
  - Supports multiple audio formats (WebM, MP3, OGG, etc.)

### Gemini API (Used for AI Feedback)
- **Used for**: AI-powered feedback generation and analysis
- **API**: `@google/generative-ai` package  
- **API Key**: `GEMINI_API_KEY` in `.env` file
- **Benefits**:
  - Advanced AI analysis of speech content
  - Contextual feedback and suggestions
  - Natural language explanations

## Why Keep Google Speech-to-Text?

1. **Purpose-Built**: Google Speech-to-Text is specifically designed for audio transcription
2. **Word Timing**: Provides precise word-level timing data needed for pace analysis
3. **Confidence Scores**: Returns confidence scores for clarity calculations
4. **Audio Format Support**: Better handling of various audio codecs (WebM, Opus, etc.)
5. **Reliability**: More stable and tested for production speech recognition

## Gemini API Limitations for Speech Transcription

While Gemini is powerful for text analysis, it currently has limitations for direct audio transcription:
- Models may not be available in all regions
- Audio transcription support is still evolving
- May not provide word-level timing data
- Less optimized for real-time speech processing

## Architecture

```
Client Audio Recording
        ↓
    Server API
        ↓
Google Speech-to-Text ──→ Transcript + Word Timing
        ↓
Analysis Functions ──→ Metrics (Clarity, Fluency, Pace)
        ↓
  Gemini API ──→ AI Feedback & Suggestions
        ↓
    Database ──→ Save Report
        ↓
   Client UI ──→ Display Results
```

## Future Enhancements

If Gemini's audio capabilities improve, we could:
1. Add Gemini as an alternative transcription engine
2. Use Gemini for enhanced audio analysis (tone, emotion)
3. Implement a fallback system between both APIs
4. Use Gemini for multi-modal analysis (audio + context)

## Configuration

### Required Environment Variables:
```env
# Google Speech-to-Text
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Gemini AI (for feedback generation)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Files:
- **Speech Controller**: `server/controllers/speech.controller.js`
- **AI Feedback Service**: `server/services/aiAnalysis.service.js`
- **Credentials**: `server/google-credentials.json` (not in git)
- **Environment**: `server/.env`

## Testing

### Test Google Speech-to-Text:
```bash
npm run test-google-speech
```

### Test Gemini API:
```bash
node scripts/test-gemini-speech.js
```

### Test AI Feedback:
```bash
npm run test-ai-feedback
```

## Conclusion

The current hybrid approach provides:
- **Best-in-class transcription** with Google Speech-to-Text
- **Advanced AI analysis** with Gemini API
- **Reliability** and **accuracy** for production use
- **Future flexibility** to incorporate new AI capabilities as they become available
