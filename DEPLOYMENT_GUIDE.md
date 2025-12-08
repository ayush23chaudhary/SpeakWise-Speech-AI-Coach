# 🚀 SpeakWise Deployment Guide

Complete guide to deploy SpeakWise with Vercel (Frontend) + Render (Backend)

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ GitHub account
- ✅ Vercel account (sign up at vercel.com)
- ✅ Render account (sign up at render.com)
- ✅ MongoDB Atlas account with database created
- ✅ Google Cloud credentials JSON file
- ✅ Gemini API key

---

## Part 1: Prepare Your Code

### 1.1 Create Production Environment Files

#### Backend `.env.production` (Don't commit this!)
Create `/server/.env.production`:
```env
# MongoDB
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Google Cloud (Path will be different on Render)
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/google-credentials.json

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port
PORT=5001

# CORS Origins (Update with your Vercel domain)
CORS_ORIGIN=https://your-app.vercel.app

# Node Environment
NODE_ENV=production
```

#### Frontend `.env.production`
Create `/client/.env.production`:
```env
# Backend API URL (Update with your Render domain)
VITE_API_URL=https://your-backend.onrender.com/api
```

### 1.2 Update `.gitignore`

Add to your `.gitignore`:
```
# Environment variables
.env
.env.local
.env.development
.env.production
.env.test

# Google credentials
google-credentials.json
server/google-credentials.json

# Build outputs
dist
build
.vercel
.render

# Dependencies
node_modules
```

### 1.3 Create `vercel.json` in Root

Create `/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "client/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "client/dist/$1"
    }
  ],
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "installCommand": "cd client && npm install"
}
```

### 1.4 Update `package.json` Scripts

#### Root `package.json`
Add these scripts:
```json
{
  "name": "speakwise",
  "version": "1.0.0",
  "scripts": {
    "install:all": "npm install && cd client && npm install && cd ../server && npm install",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && npm run dev",
    "client": "cd client && npm run dev",
    "build": "cd client && npm run build",
    "deploy:vercel": "vercel --prod",
    "deploy:render": "cd server && npm install && npm start"
  }
}
```

#### Server `package.json`
Update `/server/package.json`:
```json
{
  "name": "speakwise-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "node test-userprogress-save.js"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

#### Client `package.json`
Update `/client/package.json`:
```json
{
  "name": "speakwise-client",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 1.5 Update Server CORS Configuration

Update `/server/index.js`:
```javascript
const cors = require('cors');

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 1.6 Create `render.yaml` (Optional)

Create `/render.yaml` for Infrastructure as Code:
```yaml
services:
  - type: web
    name: speakwise-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5001
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: GEMINI_API_KEY
        sync: false
      - key: CORS_ORIGIN
        sync: false
    autoDeploy: true
```

---

## Part 2: Push Code to GitHub

### 2.1 Initialize Git Repository

```bash
cd /Users/ayushchaudhary/Desktop/SpeakWise2

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SpeakWise Speech AI Coach"
```

### 2.2 Connect to GitHub Repository

```bash
# Add remote repository
git remote add origin https://github.com/ayush23chaudhary/SpeakWise-Speech-AI-Coach.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

### 2.3 Verify on GitHub

Go to: https://github.com/ayush23chaudhary/SpeakWise-Speech-AI-Coach

Check that all files are present (except `.env` and `google-credentials.json`)

---

## Part 3: Deploy Backend to Render

### 3.1 Sign Up / Log In to Render

1. Go to https://render.com
2. Sign up or log in (use GitHub for easy deployment)

### 3.2 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account if not already connected
3. Select repository: `ayush23chaudhary/SpeakWise-Speech-AI-Coach`
4. Click **"Connect"**

### 3.3 Configure Web Service

**Basic Settings:**
- **Name**: `speakwise-backend`
- **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch**: `main`
- **Root Directory**: `server`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- **Free** (for testing) or **Starter** ($7/month for production)

### 3.4 Add Environment Variables

Click **"Environment"** tab and add:

```
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://akshat:$b2z4nwAKSHAT@speakwise-cluster.uuhgeb8.mongodb.net/
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
GEMINI_API_KEY=AIzaSyALuGnOwnfy7tE8F3wjhUT1SE71SCUS5KU
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

**⚠️ IMPORTANT**: You'll update `CORS_ORIGIN` after deploying frontend!

### 3.5 Add Google Credentials as Secret File

Render doesn't support file uploads directly, so we'll use an environment variable:

**Option A: Base64 Encode (Recommended)**

1. On your local machine:
```bash
cd server
cat google-credentials.json | base64
```

2. Copy the output
3. In Render, add environment variable:
```
GOOGLE_CREDENTIALS_BASE64=paste_the_base64_string_here
```

4. Update `/server/index.js` to decode:
```javascript
// At the top of index.js
const fs = require('fs');
const path = require('path');

// Decode Google credentials from environment variable
if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  const credentialsPath = path.join(__dirname, 'google-credentials.json');
  const decodedCredentials = Buffer.from(
    process.env.GOOGLE_CREDENTIALS_BASE64, 
    'base64'
  ).toString('utf-8');
  fs.writeFileSync(credentialsPath, decodedCredentials);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
}
```

**Option B: JSON String (Alternative)**

1. Copy entire content of `google-credentials.json`
2. Minify it (remove newlines and spaces)
3. Add as environment variable:
```
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}
```

4. Update `/server/index.js`:
```javascript
if (process.env.GOOGLE_CREDENTIALS_JSON) {
  const credentialsPath = path.join(__dirname, 'google-credentials.json');
  fs.writeFileSync(credentialsPath, process.env.GOOGLE_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
}
```

### 3.6 Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build and deployment
3. Your backend will be available at: `https://speakwise-backend.onrender.com`

### 3.7 Test Backend

```bash
# Test health endpoint
curl https://speakwise-backend.onrender.com/api/health

# Test seed exercises
curl -X POST https://speakwise-backend.onrender.com/api/practice-hub/seed-exercises
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully seeded 10 exercises"
}
```

---

## Part 4: Deploy Frontend to Vercel

### 4.1 Sign Up / Log In to Vercel

1. Go to https://vercel.com
2. Sign up or log in (use GitHub for easy deployment)

### 4.2 Import Project

1. Click **"Add New"** → **"Project"**
2. Import from GitHub: `ayush23chaudhary/SpeakWise-Speech-AI-Coach`
3. Click **"Import"**

### 4.3 Configure Project

**Framework Preset**: Vite

**Root Directory**: `client`

**Build Settings:**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Node.js Version**: 18.x or higher

### 4.4 Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_API_URL=https://speakwise-backend.onrender.com/api
```

### 4.5 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Your frontend will be available at: `https://speakwise-speech-ai-coach.vercel.app`

### 4.6 Update Backend CORS

Go back to Render → Your backend service → Environment:

Update `CORS_ORIGIN`:
```
CORS_ORIGIN=https://speakwise-speech-ai-coach.vercel.app
```

Click **"Save Changes"** - This will trigger a redeploy.

### 4.7 Test Frontend

1. Open: `https://speakwise-speech-ai-coach.vercel.app`
2. Sign up with a new account
3. Try recording in Performance Studio
4. Test Practice Hub exercises

---

## Part 5: Post-Deployment Configuration

### 5.1 MongoDB Atlas Whitelist

1. Go to MongoDB Atlas Dashboard
2. Network Access → IP Access List
3. Add IP: `0.0.0.0/0` (Allow from anywhere)
   - **Note**: For production, restrict to Render IPs only

### 5.2 Custom Domain (Optional)

#### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain: `speakwise.yourdomain.com`
3. Update DNS records as instructed

#### Render:
1. Go to Service Settings → Custom Domains
2. Add: `api.speakwise.yourdomain.com`
3. Update DNS with CNAME record

#### Update CORS:
```
CORS_ORIGIN=https://speakwise.yourdomain.com
```

### 5.3 Environment-Specific URLs

Update your frontend API URL if using custom domain:
```
VITE_API_URL=https://api.speakwise.yourdomain.com/api
```

---

## Part 6: Monitoring & Maintenance

### 6.1 Render Dashboard

Monitor your backend:
- **Logs**: Real-time logs of your server
- **Metrics**: CPU, Memory usage
- **Events**: Deployment history

### 6.2 Vercel Dashboard

Monitor your frontend:
- **Deployments**: History and status
- **Analytics**: Page views, performance
- **Logs**: Function logs

### 6.3 MongoDB Atlas

Monitor database:
- **Cluster Metrics**: Connections, operations
- **Database Access**: User activity
- **Data Explorer**: Browse collections

### 6.4 Set Up Alerts

**Render:**
- Email notifications for deployment failures
- Slack integration for errors

**Vercel:**
- Email notifications for failed builds
- Discord/Slack webhooks

**MongoDB Atlas:**
- Set alerts for high connections
- Storage usage warnings

---

## Part 7: Troubleshooting

### Issue 1: Frontend Can't Connect to Backend

**Symptoms:**
- "Failed to fetch" errors
- CORS errors in browser console

**Solution:**
```bash
# Check CORS_ORIGIN matches exactly (no trailing slash)
CORS_ORIGIN=https://speakwise-speech-ai-coach.vercel.app

# Check VITE_API_URL includes /api
VITE_API_URL=https://speakwise-backend.onrender.com/api
```

### Issue 2: Google Speech API Not Working

**Symptoms:**
- "Could not transcribe audio" errors
- 500 errors during analysis

**Solution:**
1. Verify `GOOGLE_CREDENTIALS_BASE64` is set correctly
2. Check server logs on Render for credential errors
3. Ensure Google Cloud Speech-to-Text API is enabled
4. Verify billing is set up on Google Cloud

### Issue 3: MongoDB Connection Failed

**Symptoms:**
- "MongoServerError: bad auth" 
- "Connection timeout"

**Solution:**
1. Check `MONGODB_URI` is correct
2. Verify IP is whitelisted (0.0.0.0/0)
3. Check database user has read/write permissions
4. Test connection string locally first

### Issue 4: Build Failures

**Frontend (Vercel):**
```bash
# Check package.json has correct scripts
"build": "vite build"

# Check all dependencies are in package.json
npm install --save [missing-package]
```

**Backend (Render):**
```bash
# Check Node.js version
"engines": {
  "node": ">=18.0.0"
}

# Check build command
Build Command: npm install
Start Command: npm start
```

### Issue 5: Environment Variables Not Working

**Solution:**
1. Don't use quotes in Render/Vercel UI
2. Redeploy after adding new variables
3. Check variable names match exactly (case-sensitive)
4. For Vite: Must prefix with `VITE_`

---

## Part 8: Continuous Deployment

### 8.1 Auto-Deploy on Git Push

Both Vercel and Render automatically deploy when you push to `main`:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel and Render will auto-deploy
```

### 8.2 Preview Deployments (Vercel)

Every pull request gets a preview URL:
1. Create a new branch
2. Make changes
3. Push and create PR
4. Vercel creates preview deployment
5. Test before merging to main

### 8.3 Rollback

**Vercel:**
1. Go to Deployments
2. Find working version
3. Click "..." → "Promote to Production"

**Render:**
1. Go to Events
2. Find previous deployment
3. Click "Redeploy"

---

## Part 9: Performance Optimization

### 9.1 Frontend Optimizations

**Code Splitting:**
```javascript
// In your React components
const PracticeHub = lazy(() => import('./components/practice/PracticeHub'));
const AnalysisDashboard = lazy(() => import('./components/analysis/AnalysisDashboard'));
```

**Image Optimization:**
- Use WebP format
- Lazy load images
- Compress assets

**Bundle Size:**
```bash
# Check bundle size
cd client
npm run build

# Analyze
npx vite-bundle-visualizer
```

### 9.2 Backend Optimizations

**Database Indexing:**
```javascript
// In your models
userSchema.index({ email: 1 });
userProgressSchema.index({ userId: 1 });
exerciseSchema.index({ category: 1, difficulty: 1 });
```

**Caching:**
```javascript
// Cache exercises
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes
```

**Compression:**
```javascript
const compression = require('compression');
app.use(compression());
```

### 9.3 CDN Configuration

**Vercel (Built-in CDN):**
- Automatically optimized
- Global edge network
- Automatic caching

**Render:**
- Enable HTTP/2
- Use Cloudflare in front (optional)

---

## Part 10: Security Checklist

### 10.1 Environment Variables
- ✅ Never commit `.env` files
- ✅ Use strong JWT secret (32+ characters)
- ✅ Rotate API keys regularly
- ✅ Use different keys for dev/prod

### 10.2 CORS
- ✅ Set specific origin (not `*`)
- ✅ No trailing slashes in URLs
- ✅ Enable credentials if needed

### 10.3 MongoDB
- ✅ Restrict IP access
- ✅ Use strong passwords
- ✅ Enable authentication
- ✅ Regular backups

### 10.4 Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 10.5 HTTPS
- ✅ Vercel: Automatic HTTPS
- ✅ Render: Automatic HTTPS
- ✅ Force HTTPS redirect

---

## Part 11: Cost Estimation

### Free Tier (For Testing)

**Vercel:**
- ✅ 100 GB bandwidth/month
- ✅ Unlimited projects
- ✅ Automatic SSL

**Render:**
- ✅ 750 hours/month (sleeps after 15min idle)
- ✅ 100 GB bandwidth/month
- ⚠️ Slow cold starts (30-60 seconds)

**MongoDB Atlas:**
- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ Suitable for development

**Google Cloud:**
- ✅ $300 free credit for 90 days
- ~$0.006 per 15 seconds of audio
- 60 minutes free per month

**Total:** $0/month (within free tiers)

### Production Tier

**Vercel Pro:** $20/month
- 1 TB bandwidth
- Better performance
- Advanced analytics

**Render Starter:** $7/month
- Always on (no sleep)
- Fast cold starts
- 100 GB bandwidth

**MongoDB Atlas M10:** $57/month
- 10 GB storage
- Automated backups
- Better performance

**Google Cloud:** ~$50/month
- For ~8,000 minutes of speech/month

**Total:** ~$134/month

---

## Part 12: Quick Reference

### URLs Structure

```
Production:
Frontend: https://speakwise-speech-ai-coach.vercel.app
Backend:  https://speakwise-backend.onrender.com
API:      https://speakwise-backend.onrender.com/api

Custom Domain (Optional):
Frontend: https://speakwise.yourdomain.com
Backend:  https://api.speakwise.yourdomain.com
API:      https://api.speakwise.yourdomain.com/api
```

### Important Commands

```bash
# Local Development
npm run dev

# Build Frontend
cd client && npm run build

# Test Backend
cd server && npm start

# Git Push
git add .
git commit -m "Your message"
git push origin main

# View Logs
# Render: Dashboard → Logs
# Vercel: Dashboard → Functions → Logs
```

### API Endpoints

```
GET  /api/health
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
POST /api/speech/analyze
GET  /api/speech/history
POST /api/practice-hub/seed-exercises
GET  /api/practice-hub/recommendations
GET  /api/practice-hub/stats
POST /api/practice-hub/complete-exercise
```

---

## 🎉 Deployment Complete!

Your SpeakWise application is now live! 

**Next Steps:**
1. Test all features thoroughly
2. Share with users for feedback
3. Monitor logs and performance
4. Iterate based on usage
5. Scale as needed

**Support:**
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Docs: https://docs.mongodb.com

---

## 📧 Deployment Checklist

Print this and check off as you complete:

- [ ] Create `.env.production` files
- [ ] Update `.gitignore`
- [ ] Create `vercel.json`
- [ ] Update CORS configuration
- [ ] Push code to GitHub
- [ ] Deploy backend to Render
- [ ] Add all environment variables to Render
- [ ] Add Google credentials to Render
- [ ] Test backend endpoints
- [ ] Deploy frontend to Vercel
- [ ] Add environment variables to Vercel
- [ ] Update CORS_ORIGIN on backend
- [ ] Test frontend-backend connection
- [ ] Whitelist IPs on MongoDB Atlas
- [ ] Test all features end-to-end
- [ ] Set up monitoring alerts
- [ ] Document deployment for team

**Deployment Date:** _____________

**Deployed By:** _____________

**Production URLs:**
- Frontend: _____________
- Backend: _____________

---

**Good luck with your deployment! 🚀**
