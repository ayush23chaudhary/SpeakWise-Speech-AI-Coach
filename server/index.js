const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
require("dotenv").config(); // Load environment variables FIRST

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const speechRoutes = require("./routes/speech.routes");
const practiceHubRoutes = require("./routes/practiceHub.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const goalRoutes = require("./routes/goal.routes");
const mongoose = require("mongoose");
const passport = require("./config/passport"); // Import passport AFTER dotenv
const AchievementService = require("./services/achievement.service");

const app = express();

// Handle Google credentials from environment variable (for deployment)
if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  console.log('📝 Decoding Google credentials from environment variable...');
  try {
    const credentialsPath = path.join(__dirname, 'google-credentials.json');
    const decodedCredentials = Buffer.from(
      process.env.GOOGLE_CREDENTIALS_BASE64, 
      'base64'
    ).toString('utf-8');
    fs.writeFileSync(credentialsPath, decodedCredentials);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    console.log('✅ Google credentials file created successfully');
  } catch (error) {
    console.error('❌ Error decoding Google credentials:', error);
  }
} else if (process.env.GOOGLE_CREDENTIALS_JSON) {
  console.log('📝 Using Google credentials from JSON string...');
  try {
    const credentialsPath = path.join(__dirname, 'google-credentials.json');
    fs.writeFileSync(credentialsPath, process.env.GOOGLE_CREDENTIALS_JSON);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    console.log('✅ Google credentials file created successfully');
  } catch (error) {
    console.error('❌ Error writing Google credentials:', error);
  }
} else {
  console.log('📄 Using local google-credentials.json file');
}

// Connect to MongoDB
connectDB();

// Seed achievements on startup
AchievementService.seedAchievements().catch(err => {
    console.error('❌ Error seeding achievements:', err);
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 CORS check - Origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ CORS allowed - No origin (same-origin or non-browser)');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

console.log('🌐 CORS configured for origins:', allowedOrigins);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth (required by Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/speech", speechRoutes);
app.use("/api/practice-hub", practiceHubRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/goals", goalRoutes);

// Root route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🎤 SpeakWise API Server",
        version: "1.0.0",
        status: "running",
        endpoints: {
            health: "/api/health",
            auth: "/api/auth",
            speech: "/api/speech",
            practiceHub: "/api/practice-hub"
        }
    });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server is running",
        timestamp: new Date(),
        mongodb:
            mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`SpeakWise Server running on port ${PORT}`);
    console.log(`Database: MongoDB`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});