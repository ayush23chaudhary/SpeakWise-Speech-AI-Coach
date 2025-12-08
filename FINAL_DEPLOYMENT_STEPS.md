# 🚀 Final Deployment Steps - Copy & Paste Guide

**Date:** November 26, 2025  
**Status:** Ready to Deploy

---

## 🎯 DO THESE IN ORDER:

---

## 1️⃣ FIX VERCEL BUILD SETTINGS (5 minutes)

### Go to: https://vercel.com/dashboard

1. Click project: **speak-wise-speech-ai-coach**
2. **Settings** → **General**
3. Scroll to **Build & Development Settings**
4. Configure:
   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: (LEAVE EMPTY or toggle Override OFF)
   Output Directory: (LEAVE EMPTY or toggle Override OFF)  
   Install Command: (LEAVE EMPTY or toggle Override OFF)
   ```
5. Click **"Save"**

---

## 2️⃣ ADD VERCEL ENVIRONMENT VARIABLE

While in Vercel settings:

1. **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add:
   ```
   Key: VITE_API_URL
   Value: https://speakwise-backend-yuh6.onrender.com
   ```
4. Check: **Production**, **Preview**, **Development** (all three)
5. Click **"Save"**

---

## 3️⃣ UPDATE RENDER ENVIRONMENT VARIABLES

### Go to: https://dashboard.render.com

1. Click: **`speakwise-backend-yuh6`**
2. Click: **Environment** tab

### Add JWT_SECRET (Copy this exactly):
```
Key: JWT_SECRET
Value: f37df15fd3f20f0eb2d2045e571bbec1ea7b8dc221a17f2fb0b6971c893f4becf05a704e694d435d2df374688b5d551bf125e929fabef83e6fa16c4bbd3f6dc3
```

### Update CORS_ORIGIN (Copy this exactly):
```
Key: CORS_ORIGIN
Value: https://speak-wise-speech-ai-coach.vercel.app
```

3. Click **"Save Changes"**
4. Wait for redeploy (2-3 minutes)

---

## 4️⃣ REDEPLOY VERCEL

1. Go to: https://vercel.com/dashboard
2. Click project: **speak-wise-speech-ai-coach**
3. Go to: **Deployments** tab
4. Click **"..."** menu on latest deployment
5. Click **"Redeploy"**
6. Wait 3-5 minutes

---

## 5️⃣ VERIFY BOTH SERVICES (After 5 minutes)

### Test Backend:
```bash
curl https://speakwise-backend-yuh6.onrender.com/api/health
```

Expected response:
```json
{"status":"success","message":"Server is running","mongodb":"connected"}
```

### Test Frontend:
Open: **https://speak-wise-speech-ai-coach.vercel.app**

Should:
- ✅ Load without 404 errors
- ✅ Show homepage
- ✅ Navigation works

---

## 6️⃣ FULL APPLICATION TEST

### A. Test Authentication:
1. Click **"Sign Up"**
2. Create account (any email/username/password)
3. Should redirect to dashboard
4. **Logout**
5. Click **"Login"**
6. Login with same credentials
7. Should work without errors

### B. Test Performance Studio:
1. Click **"Performance Studio"**
2. Allow microphone when prompted
3. Click **"Start Recording"**
4. Speak for 5-10 seconds
5. Click **"Stop Recording"**
6. Click **"Analyze"**
7. Wait 10-15 seconds
8. Should see:
   - Clarity score
   - Pace (words/minute)
   - Filler word count
   - AI-powered feedback (strengths, areas to improve, recommendations)
9. Check **"Previous Sessions"** - recording should be saved

### C. Test Practice Hub:
1. Click **"Practice Hub"**
2. Should see **10 exercises**:
   - Classic Tongue Twisters
   - Advanced Tongue Twisters
   - Alliteration Practice
   - News Anchor Practice
   - Pause Practice
   - Breathing & Vocal Warm-up
   - Storytelling in 60 Seconds
   - Metronome Speaking
   - Vowel Clarity Exercise
   - Public Speaking Opener
3. Click any exercise (e.g., "Classic Tongue Twisters")
4. Click **"Start Practice"**
5. Read the practice text
6. Click **"Start Recording"**
7. Speak the text
8. Click **"Stop Recording"**
9. Click **"Analyze"**
10. Wait for analysis
11. Should see results in modal
12. Click **"Complete"**
13. Check stats update (exercises completed, streak, etc.)

---

## ✅ SUCCESS INDICATORS:

When everything works:
- ✅ No 404 errors anywhere
- ✅ No CORS errors in console
- ✅ Can sign up and login
- ✅ Performance Studio analyzes speech
- ✅ AI feedback shows strengths and recommendations
- ✅ Practice Hub shows 10 exercises
- ✅ Can complete exercises
- ✅ Progress tracking updates
- ✅ Previous sessions are saved

---

## 🔍 TROUBLESHOOTING:

### If frontend shows "Network Error":
1. Check CORS_ORIGIN on Render (must be EXACT Vercel URL, no trailing slash)
2. Check VITE_API_URL on Vercel (must be EXACT Render URL, no trailing slash)
3. Verify backend is running: test the health endpoint

### If login/signup fails:
1. Make sure JWT_SECRET is set on Render
2. Check browser console for errors
3. Check Render logs: https://dashboard.render.com → Your service → Logs

### If speech analysis fails:
1. Check Render logs for Google credentials errors
2. Verify GOOGLE_CREDENTIALS_BASE64 is set correctly
3. Make sure microphone permission is granted

### If exercises don't load:
1. Database was already seeded (should work)
2. Check MongoDB connection in Render logs
3. Re-seed if needed: `curl -X POST https://speakwise-backend-yuh6.onrender.com/api/practice-hub/seed-exercises`

---

## 📊 YOUR COMPLETE CONFIGURATION:

### Frontend (Vercel):
- **URL:** https://speak-wise-speech-ai-coach.vercel.app
- **Root Directory:** client
- **Environment Variables:**
  - VITE_API_URL = https://speakwise-backend-yuh6.onrender.com

### Backend (Render):
- **URL:** https://speakwise-backend-yuh6.onrender.com
- **Environment Variables:**
  - MONGODB_URI ✓
  - JWT_SECRET = f37df15fd3f20f0eb2d2045e571bbec1ea7b8dc221a17f2fb0b6971c893f4becf05a704e694d435d2df374688b5d551bf125e929fabef83e6fa16c4bbd3f6dc3
  - GOOGLE_CREDENTIALS_BASE64 ✓
  - GEMINI_API_KEY ✓
  - PORT = 5001
  - NODE_ENV = production
  - CORS_ORIGIN = https://speak-wise-speech-ai-coach.vercel.app

### Database (MongoDB Atlas):
- **Status:** Connected & Seeded with 10 exercises ✓

---

## ⏰ TOTAL TIME: ~10 minutes

- Vercel settings: 2 min
- Render settings: 2 min
- Deploy wait: 5 min
- Testing: 1 min

---

## 🎉 YOU'RE ALMOST THERE!

Follow the steps above in order, and your app will be live!

**Start with Step 1 (Fix Vercel Build Settings) now!** 🚀
