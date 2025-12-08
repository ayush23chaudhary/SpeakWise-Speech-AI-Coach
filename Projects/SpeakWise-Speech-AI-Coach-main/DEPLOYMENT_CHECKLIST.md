# 🚀 Pre-Deployment Checklist

## Before You Push to GitHub

### 1. Environment Files ✅
- [ ] Create `server/.env.example` (done)
- [ ] Create `client/.env.example` (done)
- [ ] Ensure `.env` files are in `.gitignore`
- [ ] Verify `google-credentials.json` is in `.gitignore`

### 2. Configuration Files ✅
- [ ] Create `vercel.json` (done)
- [ ] Create `render.yaml` (done)
- [ ] Update `package.json` scripts
- [ ] Set Node.js engine version

### 3. Code Updates ✅
- [ ] Update CORS configuration in `server/index.js` (done)
- [ ] Add Google credentials handler (done)
- [ ] Test locally one more time

### 4. Git Repository
- [ ] Initialize git: `git init`
- [ ] Add all files: `git add .`
- [ ] Create commit: `git commit -m "Initial commit"`
- [ ] Add remote: `git remote add origin https://github.com/ayush23chaudhary/SpeakWise-Speech-AI-Coach.git`
- [ ] Rename branch: `git branch -M main`
- [ ] Push code: `git push -u origin main`

---

## Render Backend Deployment

### 1. Account Setup
- [ ] Sign up at https://render.com
- [ ] Connect GitHub account

### 2. Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Select repository: `ayush23chaudhary/SpeakWise-Speech-AI-Coach`
- [ ] Configure:
  - Name: `speakwise-backend`
  - Root Directory: `server`
  - Build Command: `npm install`
  - Start Command: `npm start`

### 3. Environment Variables
Add these in Render dashboard:

```
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://akshat:$b2z4nwAKSHAT@speakwise-cluster.uuhgeb8.mongodb.net/
JWT_SECRET=[Generate a 32+ character secret]
GEMINI_API_KEY=AIzaSyALuGnOwnfy7tE8F3wjhUT1SE71SCUS5KU
GOOGLE_CREDENTIALS_BASE64=[Base64 encoded google-credentials.json]
CORS_ORIGIN=[Will add after Vercel deployment]
```

### 4. Get Google Credentials Base64
Run on your local machine:
```bash
cd server
cat google-credentials.json | base64
```
Copy the output and paste as `GOOGLE_CREDENTIALS_BASE64`

### 5. Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (3-5 minutes)
- [ ] Copy your backend URL: `https://speakwise-backend.onrender.com`

### 6. Test Backend
```bash
curl https://speakwise-backend.onrender.com/api/health
```

---

## Vercel Frontend Deployment

### 1. Account Setup
- [ ] Sign up at https://vercel.com
- [ ] Connect GitHub account

### 2. Import Project
- [ ] Click "Add New" → "Project"
- [ ] Select: `ayush23chaudhary/SpeakWise-Speech-AI-Coach`
- [ ] Configure:
  - Framework: Vite
  - Root Directory: `client`
  - Build Command: `npm run build`
  - Output Directory: `dist`

### 3. Environment Variables
Add in Vercel dashboard:

```
VITE_API_URL=https://speakwise-backend.onrender.com/api
```

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (2-3 minutes)
- [ ] Copy your frontend URL: `https://speakwise-speech-ai-coach.vercel.app`

### 5. Update Backend CORS
Go back to Render:
- [ ] Add environment variable:
  ```
  CORS_ORIGIN=https://speakwise-speech-ai-coach.vercel.app
  ```
- [ ] Save (this triggers redeploy)

---

## Post-Deployment Testing

### 1. Test Authentication
- [ ] Open frontend URL
- [ ] Sign up with new account
- [ ] Verify email/password validation
- [ ] Log out and log back in

### 2. Test Performance Studio
- [ ] Record 10-15 seconds of audio
- [ ] Click "Analyze"
- [ ] Verify results appear
- [ ] Check metrics display correctly

### 3. Test Practice Hub
- [ ] Check stats display (0 if new)
- [ ] Start an exercise
- [ ] Record and analyze
- [ ] Click "Complete"
- [ ] Verify stats update

### 4. Test Database
- [ ] Go to MongoDB Atlas
- [ ] Check collections:
  - [ ] `users` has new user
  - [ ] `analysisreports` has analyses
  - [ ] `userprogresses` has progress data
  - [ ] `exercises` has seeded exercises

### 5. Check Logs
**Render:**
- [ ] Go to Logs tab
- [ ] Verify no errors
- [ ] Check API calls working

**Vercel:**
- [ ] Go to Deployments
- [ ] Click latest deployment
- [ ] Check Functions logs

---

## MongoDB Atlas Configuration

### 1. Network Access
- [ ] Go to Network Access
- [ ] Add IP Address: `0.0.0.0/0` (Allow from anywhere)
- [ ] Save

### 2. Database Access
- [ ] Verify user `akshat` has read/write permissions
- [ ] Check password is correct in connection string

### 3. Seed Data
Run once after deployment:
```bash
curl -X POST https://speakwise-backend.onrender.com/api/practice-hub/seed-exercises
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully seeded 10 exercises"
}
```

---

## Final Verification

### ✅ All Systems Check

- [ ] Frontend loads without errors
- [ ] Backend responds to API calls
- [ ] Authentication works
- [ ] Speech analysis works
- [ ] Practice Hub exercises work
- [ ] Progress tracking updates
- [ ] Database saves data
- [ ] No CORS errors
- [ ] No console errors
- [ ] Mobile responsive (test on phone)

### 📊 Performance Check

- [ ] Frontend loads in < 3 seconds
- [ ] Backend responds in < 2 seconds
- [ ] Speech analysis completes in < 10 seconds
- [ ] No memory leaks
- [ ] No slow queries

### 🔒 Security Check

- [ ] Environment variables not exposed
- [ ] CORS set to specific domain
- [ ] JWT secrets are strong
- [ ] MongoDB password is strong
- [ ] Google credentials secure
- [ ] No API keys in client code

---

## Monitoring Setup

### Render
- [ ] Enable email notifications
- [ ] Set up Slack/Discord webhooks (optional)

### Vercel
- [ ] Enable deployment notifications
- [ ] Set up error alerts

### MongoDB Atlas
- [ ] Set up alerts for:
  - High connections (>100)
  - Storage >80%
  - CPU >80%

---

## Documentation

- [ ] Update README.md with production URLs
- [ ] Document API endpoints
- [ ] Add architecture diagram
- [ ] Create user guide

---

## Backup Plan

### If Something Goes Wrong

**Backend Issues:**
1. Check Render logs
2. Verify environment variables
3. Test MongoDB connection
4. Check Google credentials

**Frontend Issues:**
1. Check Vercel build logs
2. Verify VITE_API_URL
3. Test API calls manually
4. Check browser console

**Rollback:**
- Render: Deploy → Events → Redeploy previous version
- Vercel: Deployments → Find working version → Promote

---

## Success! 🎉

Your app is live at:
- **Frontend**: https://speakwise-speech-ai-coach.vercel.app
- **Backend**: https://speakwise-backend.onrender.com

**Next Steps:**
1. Share with beta users
2. Gather feedback
3. Monitor performance
4. Iterate and improve

---

**Deployment Date**: ______________

**Deployed By**: ______________

**Notes**:
_________________________________________________
_________________________________________________
_________________________________________________
