const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User.model');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Google OAuth enabled');
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('📧 Google OAuth - Profile received:', profile.id);

          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log('✅ Existing Google user found:', user.email);
            return done(null, user);
          }

          // Check if user exists with this email (account linking)
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            console.log('🔗 Linking Google account to existing user:', user.email);
            // Link Google account to existing user
            user.googleId = profile.id;
            user.provider = 'google';
            user.avatar = profile.photos[0]?.value || user.avatar;
            await user.save();
            return done(null, user);
          }

          // Create new user
          console.log('🆕 Creating new Google user:', profile.emails[0].value);
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            provider: 'google',
            avatar: profile.photos[0]?.value,
            password: Math.random().toString(36).slice(-12), // Random password (not used)
          });

          console.log('✅ New Google user created:', user.email);
          done(null, user);
        } catch (error) {
          console.error('❌ Google OAuth error:', error);
          done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠️  Google OAuth disabled - missing credentials');
}

// GitHub OAuth Strategy (only if credentials are provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  console.log('✅ GitHub OAuth enabled');
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5001/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('🐙 GitHub OAuth - Profile received:', profile.id);

          // Check if user already exists with this GitHub ID
          let user = await User.findOne({ githubId: profile.id });

          if (user) {
            console.log('✅ Existing GitHub user found:', user.email);
            return done(null, user);
          }

          // Get primary email from GitHub
          const email = profile.emails && profile.emails.length > 0 
            ? profile.emails.find(e => e.primary)?.value || profile.emails[0].value
            : `${profile.username}@github.com`; // Fallback if no email

          // Check if user exists with this email (account linking)
          user = await User.findOne({ email });

          if (user) {
            console.log('🔗 Linking GitHub account to existing user:', user.email);
            // Link GitHub account to existing user
            user.githubId = profile.id;
            user.provider = 'github';
            user.avatar = profile.photos[0]?.value || user.avatar;
            await user.save();
            return done(null, user);
          }

          // Create new user
          console.log('🆕 Creating new GitHub user:', email);
          user = await User.create({
            githubId: profile.id,
            email,
            name: profile.displayName || profile.username,
            provider: 'github',
            avatar: profile.photos[0]?.value,
            password: Math.random().toString(36).slice(-12), // Random password (not used)
          });

          console.log('✅ New GitHub user created:', user.email);
          done(null, user);
        } catch (error) {
          console.error('❌ GitHub OAuth error:', error);
          done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠️  GitHub OAuth disabled - missing credentials');
}

module.exports = passport;
