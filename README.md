# SpeakWise – AI Evaluator Perception Coach 🎤

SpeakWise simulates how interviewers, investors, and examiners perceive your speech under high-stakes pressure.  
It identifies trust-breaking moments, hesitation clusters, and engagement risks—translating speech patterns into decision-impact signals through context-specific evaluator perception analysis.

> Live Frontend: https://speak-wise-speech-ai-coach.vercel.app/  
> Backend API: https://speakwise-backend-yuh6.onrender.com/

---

## 🌟 Core Philosophy

**SpeakWise does NOT:**
- Improve speech generally
- Teach pronunciation
- Show neutral analytics

**SpeakWise DOES:**
- Simulate evaluator perception
- Detect trust loss, hesitation, and disengagement
- Translate speech patterns into decision-impact signals
- Give opinionated, explainable judgments

---

## 🎯 Key Features

### 1. Record Response (Evaluation Contexts)
- Select evaluation mode:
  - **Interview Answer** (pause-sensitive, high pressure)
  - **Pitch/Presentation** (engagement-focused, energy critical)
  - **Viva/Oral Exam** (confidence-driven, content over delivery)
- Record speech directly in browser
- Backend calculates:
  - **Evaluator Confidence Index** (0-100)
  - Perception risk signals (pause risk, hesitation severity, confidence stability, engagement risk)
  - Critical moments timeline (trust-breaking pauses, confidence drops, hesitation clusters)
  - Opinionated evaluator judgments

### 2. Scenario Training (Practice Hub)
- Context-specific scenarios mirroring real evaluations:
  - Interview pressure simulations
  - Investor pitch scenarios
  - Oral exam question formats
- Daily challenges targeting communication risk patterns
- In-scenario assessment with evaluator perception feedback

### 3. Communication Trajectory
- **UserProgress** tracked in MongoDB:
  - Evaluator confidence scores over time
  - Risk pattern evolution
  - Critical moment frequency trends
  - Context-specific performance (Interview vs. Pitch vs. Viva)
- Visual trajectory to see perception stability improvement

### 4. Authentication & Security
- JWT‑based authentication for secure login
- Protected routes for evaluations and trajectory tracking
- Automatic logout on token expiration

### 5. Production Deployment
- **Frontend:** React + Vite on **Vercel**
- **Backend:** Node.js + Express on **Render**
- **Database:** MongoDB Atlas (cloud-hosted)
- Environment‑based configuration using `VITE_API_URL` and server env vars

---

## 🏗️ Tech Stack

**Frontend**
- React (Vite)
- Axios (with centralized API client & interceptors)
- MediaRecorder API for audio capture
- SPA routing & multi‑tab layout (Performance Studio, Analysis, Practice Hub, Progress)

**Backend**
- Node.js + Express
- Mongoose (MongoDB)
- Multer (audio upload)
- JWT for auth

**AI & External Services**
- Google Generative Language (Gemini) API for feedback & practice suggestions
- Speech‑to‑Text integration using Google Cloud credentials

**DevOps / Hosting**
- Vercel (frontend) – `client/` as Root Directory
- Render (backend) – Express Web Service
- MongoDB Atlas – database
- Environment variables for all secrets/URLs

---

## 📂 Project Structure

```bash
SpeakWise/
  server/
    index.js                # Express app entry
    package.json
    config/
      db.js                 # MongoDB connection
    models/
      User.js
      Exercise.js
      AnalysisReport.js
      UserProgress.js
    controllers/
      auth.controller.js
      speech.controller.js
      practiceHub.controller.js
    services/
      speech.service.js     # Speech analysis logic
      practiceHub.service.js# Streaks, skills, achievements
      ai.service.js         # Gemini integration
    routes/
      auth.routes.js
      speech.routes.js
      practiceHub.routes.js
    middleware/
      auth.middleware.js
      error.middleware.js
      cors.middleware.js

  client/
    package.json
    vite.config.js
    index.html
    src/
      main.jsx
      App.jsx
      utils/
        api.js              # Axios instance (with JWT + VITE_API_URL)
      components/
        layout/
          MainApp.jsx
          GuestMainApp.jsx
          TabNavigation.jsx
        performance/
          PerformanceStudio.jsx
        analysis/
          AnalysisDashboard.jsx
        practice/
          PracticeHub.jsx
          ExerciseModal.jsx
        progress/
          ProgressTracker.jsx
      pages/
        LoginPage.jsx
        SignupPage.jsx
        NotFoundPage.jsx
      styles/
        global.css
```

---

## 🧩 Architecture Overview

**High-Level Flow**

1. User signs up / logs in → receives JWT.
2. In **Performance Studio** or **Practice Hub**, user records audio via browser.
3. Frontend sends audio to backend (`/api/speech/analyze`) using the Axios client.
4. Backend:
   - Validates JWT (auth middleware).
   - Accepts audio file (Multer).
   - Detects MIME type & encoding (webm/ogg/mp4).
   - Performs speech‑to‑text.
   - Computes metrics + calls Gemini for feedback.
   - Optionally stores AnalysisReport in MongoDB.
5. For Practice Hub, on **Complete**:
   - `/api/practice-hub/complete-exercise` updates UserProgress.
   - Recalculates streaks, skill levels, achievements.
   - Returns updated stats for UI refresh.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (>= 18)
- npm or yarn
- MongoDB URI (Atlas or local)
- Gemini API key
- Google Cloud credentials (for speech‑to‑text)

### 1. Clone

```bash
git clone https://github.com/akshatkumar2006/SpeakWise.git
cd SpeakWise
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env      # Fill in required keys
npm install
npm run dev               # or npm start
```

Key env vars:

```env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
GOOGLE_CREDENTIALS_BASE64=base64-of-google-credentials-json
CORS_ORIGIN=http://localhost:5173
PORT=5001
```

### 3. Frontend Setup

```bash
cd ../client
cp .env.example .env      # Set VITE_API_URL
npm install
npm run dev
```

`.env`:

```env
VITE_API_URL=http://localhost:5001
```

Visit: `http://localhost:5173`

---

## 🌐 Production Deployment

**Frontend (Vercel)**
- Root directory: `client`
- Framework preset: Vite
- Env var: `VITE_API_URL = https://your-backend.onrender.com`

**Backend (Render)**
- Service type: Web Service
- Root directory: `server`
- Build: `npm install`
- Start: `npm start`
- Env vars: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GOOGLE_CREDENTIALS_BASE64`, `CORS_ORIGIN`, `NODE_ENV=production`, `PORT=5001`

---

## ✅ Testing & Quality

- Manual end‑to‑end testing of:
  - Auth flows (signup/login, expired tokens).
  - Speech analysis: recording, upload, metrics, AI feedback.
  - Practice Hub: exercises, completion, progress updates.
- Axios interceptors handle:
  - Attaching JWT from `localStorage`.
  - Auto‑logout on 401 (`/login` redirect).
- Layered backend structure (models → services → controllers → routes) for readability and maintainability.

---

## 📈 Why This Project Matters

SpeakWise demonstrates:
- Real‑world full‑stack skills (React + Node + MongoDB).
- Integration with external AI and speech services.
- Non‑trivial product logic (streaks, skills, achievements, recommendations).
- Production deployment with proper env separation and CORS.

It’s designed to feel like an actual SaaS product: users can log in, record real speech, receive intelligent feedback, and build a consistent practice habit.

---

## 🤝 Contributing

For now this is an individual project, but contributions, ideas, and feedback are welcome.  
Feel free to open issues or pull requests, or contact me via GitHub if you’d like to discuss improvements (e.g., automated tests, more AI prompts, better analytics).

---

## 📜 License

This project is currently shared for portfolio and educational purposes.  
Please contact the author before using it commercially.
