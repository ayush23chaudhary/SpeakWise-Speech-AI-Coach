# Environment Variables for ASR Configuration

## Required for Whisper ASR

Add these to your `server/.env` file:

```bash
# ============================================
# ASR Provider Configuration
# ============================================

# Choose your ASR provider: "google" or "whisper"
ASR_PROVIDER=whisper

# OpenAI API Key (Required for Whisper)
# Get it from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here

# ============================================
# Alternative: Google Speech-to-Text
# ============================================

# If using Google Speech-to-Text instead:
# ASR_PROVIDER=google
# GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# ============================================
# Other Required Variables
# ============================================

# MongoDB Connection
MONGODB_URI=mongodb://127.0.0.1:27017/speakwise

# JWT Secret
JWT_SECRET=your-jwt-secret-key-here

# AI Analysis (Optional but recommended)
GEMINI_API_KEY=your-gemini-api-key-here

# Server Port
PORT=5001
```

## Quick Start

1. **Copy the example configuration:**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Add your OpenAI API key:**
   - Go to https://platform.openai.com/api-keys
   - Create a new secret key
   - Copy and paste it in `.env`

3. **Set ASR provider:**
   ```bash
   ASR_PROVIDER=whisper
   ```

4. **Test the configuration:**
   ```bash
   npm run test-whisper
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

## Switching Between ASR Providers

### To use Whisper:
```bash
ASR_PROVIDER=whisper
OPENAI_API_KEY=sk-...
```

### To use Google Speech-to-Text:
```bash
ASR_PROVIDER=google
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

Both providers work seamlessly with the same API endpoints!

## Environment Variable Validation

The server automatically validates your configuration on startup:

```
✅ Using OpenAI Whisper as ASR provider
✅ OpenAI Whisper client initialized
```

or

```
✅ Using Google Speech-to-Text as ASR provider
```

If you see errors, check that:
- [ ] `.env` file exists in `server/` directory
- [ ] API keys are correctly set
- [ ] No extra spaces in environment variables
- [ ] Variables are not commented out

## Security Reminders

⚠️ **NEVER commit `.env` files to version control!**

The `.gitignore` file should include:
```
.env
.env.local
.env.*.local
```
