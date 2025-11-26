# Data Flow Test Documentation

## 🔍 Fixed Issues

### 1. **Backend Controller - Guest Mode Support**
   - **File**: `server/controllers/speech.controller.js`
   - **Issue**: Controller was trying to access `req.user.id` which doesn't exist for guest users
   - **Fix**: Added JWT authentication handling with fallback to guest mode
   - **Added**: Detailed console logging for debugging

### 2. **Frontend API Helper - Response Extraction**
   - **File**: `client/src/api.js`
   - **Issue**: API was returning nested `{ message, report }` but dashboard expected flat data
   - **Fix**: Extract and return `response.data.report` directly
   - **Added**: Console logging to see API response structure

## 📊 Expected Data Flow

### Step 1: User Records Audio
- **Component**: `PerformanceStudio.jsx`
- **Action**: User clicks "Start Recording" → records → clicks "Stop Recording"
- **Output**: `audioBlob` (WebM format)

### Step 2: Upload to Backend
- **Function**: `analyzeAudio(audioBlob, token)` in `api.js`
- **Request**: 
  ```javascript
  POST /api/speech/analyze
  Content-Type: multipart/form-data
  Authorization: Bearer <token> (optional)
  Body: { audio: File }
  ```

### Step 3: Backend Processing
- **Route**: `server/routes/speech.routes.js` → `analyzeSpeech()`
- **Controller**: `server/controllers/speech.controller.js`
- **Process**:
  1. Extract audio buffer from `req.file.buffer`
  2. Authenticate user (optional, supports guest mode)
  3. Convert audio to base64
  4. Call Google Speech-to-Text API
  5. Calculate metrics from API response
  6. Save to database (only if authenticated)
  7. Return analysis data

### Step 4: Google Speech API Response Structure
```javascript
{
  results: [{
    alternatives: [{
      transcript: "Hello this is a test...",
      confidence: 0.95,
      words: [
        {
          word: "Hello",
          startTime: { seconds: 0, nanos: 0 },
          endTime: { seconds: 0, nanos: 500000000 },
          confidence: 0.98
        },
        // ... more words
      ]
    }]
  }]
}
```

### Step 5: Calculated Metrics
From the Google API response, we calculate:

```javascript
{
  // Main transcript
  transcript: "Full text of speech...",
  
  // Overall score (weighted average)
  overallScore: 85,
  
  // Individual metrics (0-100 scale)
  metrics: {
    clarity: 90,      // Based on word confidence scores
    fluency: 85,      // Based on pauses and hesitations
    pace: 82,         // Based on words per minute
    confidence: 87,   // Composite of clarity + fluency + pace
    tone: 75          // Placeholder (requires additional API)
  },
  
  // Pace analysis
  pace: {
    wordsPerMinute: 145,
    status: "Good",    // "Too Fast" | "Good" | "Too Slow"
    statusColor: "text-green-500"
  },
  
  // Filler word detection
  fillerWords: {
    "um": 3,
    "uh": 2,
    "like": 5,
    "you know": 1,
    "so": 2,
    "well": 1,
    "ah": 0
  },
  
  // AI-generated feedback
  strengths: [
    "Your speaking pace was excellent and engaging.",
    "Exceptional clarity. Your words were very easy to understand."
  ],
  
  areasForImprovement: [
    "Try to reduce usage of filler words like 'like' and 'um'."
  ],
  
  recommendations: [
    "Practice your speech to become more comfortable.",
    "Try to build in deliberate pauses after key sentences."
  ]
}
```

### Step 6: Backend Response
```javascript
{
  message: "Analysis completed successfully",
  report: {
    id: "507f1f77bcf86cd799439011",  // MongoDB ID (null for guest)
    transcript: "...",
    overallScore: 85,
    metrics: { ... },
    pace: { ... },
    fillerWords: { ... },
    strengths: [ ... ],
    areasForImprovement: [ ... ],
    recommendations: [ ... ],
    createdAt: "2025-11-14T12:00:00.000Z"
  }
}
```

### Step 7: Frontend Receives Data
- **Function**: `analyzeAudio()` returns `response.data.report`
- **Component**: `PerformanceStudio.jsx` receives analysis object
- **Navigation**: `navigate('/dashboard/analysis', { state: { analysisData: analysis } })`

### Step 8: Dashboard Displays Data
- **Component**: `AnalysisDashboard.jsx`
- **Data Source**: `location.state.analysisData`
- **Displays**:
  - Overall Score (circle gauge)
  - Metrics Radar Chart (5 metrics)
  - Pace Status (WPM with color coding)
  - Filler Words Bar Chart
  - Transcript with highlighted filler words
  - Strengths, Improvements, Recommendations cards

## 🧪 Testing Checklist

### Manual Test Steps:
1. ✅ **Start both servers**:
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend
   cd client && npm run dev
   ```

2. ✅ **Verify servers running**:
   - Backend: `http://localhost:5001`
   - Frontend: `http://localhost:3000` (or 3001 if 3000 busy)
   - MongoDB: `mongodb://127.0.0.1:27017/speakwise`

3. ✅ **Open browser console** (F12)
   - Look for console logs showing data flow

4. ✅ **Test Guest Mode**:
   - Open app → Guest Mode
   - Go to Performance Studio
   - Click "Start Recording"
   - Speak for 10-15 seconds
   - Click "Stop Recording"
   - Click "Analyze Recording"
   - **Expected logs**:
     ```
     📥 Analyze request received
        - Has file: true
        - Auth header: Missing
     🎤 analyzeSpeech called
        - Has file: true
        - File buffer size: <bytes>
        - No token provided, treating as guest
     📊 API Response: { message, report: {...} }
     ```
   - **Expected result**: Dashboard shows all metrics

5. ✅ **Test Authenticated Mode**:
   - Signup/Login
   - Go to Performance Studio
   - Record and analyze
   - **Expected logs**:
     ```
     📥 Analyze request received
        - Has file: true
        - Auth header: Present
     🎤 analyzeSpeech called
        - Authenticated user: user@example.com
        - Report saved to DB: <report-id>
     ```
   - **Expected result**: Dashboard shows metrics + data saved to DB

6. ✅ **Verify Dashboard Data**:
   - Overall Score displays (0-100)
   - Radar chart shows 5 metrics (Clarity, Confidence, Fluency, Pace, Tone)
   - Pace shows WPM and status color
   - Filler words bar chart displays
   - Transcript appears with highlighted filler words
   - Strengths/Improvements/Recommendations cards show

## 🐛 Debug Console Commands

### Check if data structure matches:
```javascript
// In browser console after analysis completes
console.log('Analysis Data:', location.state?.analysisData);
console.log('Has metrics?', !!location.state?.analysisData?.metrics);
console.log('Has overallScore?', location.state?.analysisData?.overallScore);
```

### Verify API response structure:
```javascript
// Add temporary logging in PerformanceStudio.jsx analyzeRecording():
console.log('Raw API response:', analysis);
console.log('Has report?', !!analysis.report);
console.log('Metrics:', analysis.metrics || analysis.report?.metrics);
```

## 🔧 Common Issues & Solutions

### Issue 1: Dashboard shows "No Analysis Available"
- **Cause**: Data not passed via navigation state
- **Check**: `console.log(location.state)` in AnalysisDashboard
- **Solution**: Verify PerformanceStudio calls `navigate('/dashboard/analysis', { state: { analysisData: analysis } })`

### Issue 2: Metrics showing undefined
- **Cause**: Response structure mismatch
- **Check**: `console.log('API Response:', response.data)` in api.js
- **Solution**: Verify api.js returns `response.data.report`

### Issue 3: "No audio file provided"
- **Cause**: Multer not receiving file buffer
- **Check**: Server logs show file buffer size
- **Solution**: Verify multer uses `memoryStorage()`

### Issue 4: Google API error
- **Cause**: Credentials or audio format issue
- **Check**: Run `npm run test-google-speech` in server folder
- **Solution**: Verify GOOGLE_APPLICATION_CREDENTIALS path

### Issue 5: Proxy errors (404/502)
- **Cause**: Port mismatch
- **Check**: Server runs on 5001, vite.config.js proxy points to 5001
- **Solution**: Update vite.config.js proxy target

## ✅ Success Indicators

When everything works correctly, you should see:

1. **Server Console**:
   ```
   🎤 analyzeSpeech called
      - Has file: true
      - File buffer size: 45231
      - Authenticated user: test@example.com
   ✅ Google API transcription successful
   ✅ Metrics calculated
      - Report saved to DB: 507f1f77bcf86cd799439011
   ```

2. **Browser Console**:
   ```
   📊 API Response: {
     message: "Analysis completed successfully",
     report: { overallScore: 85, metrics: {...}, ... }
   }
   ```

3. **Dashboard UI**:
   - Large circular score shows overall percentage
   - Colorful radar chart displays all 5 metrics
   - Pace indicator shows green/yellow/red status
   - Bar chart shows filler word counts
   - Complete transcript with yellow highlights on filler words
   - Three cards with strengths, improvements, and recommendations

## 📝 Notes

- Audio format: WebM Opus (48kHz)
- Google API language: en-US
- Pronunciation assessment: PHONEME level
- Authentication: Optional (supports guest mode)
- Database: Only saves for authenticated users
- Max file size: 10MB
