const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const speechRoutes = require("./routes/speech.routes");
const practiceHubRoutes = require("./routes/practiceHub.routes");
const mongoose = require("mongoose");

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

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

console.log('🌐 CORS configured for origin:', corsOptions.origin);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/speech", speechRoutes);
app.use("/api/practice-hub", practiceHubRoutes);

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