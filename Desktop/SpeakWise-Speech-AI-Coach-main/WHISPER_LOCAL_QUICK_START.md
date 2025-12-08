# 🎤 Local Whisper Quick Reference

## 🚀 Installation (2 minutes)

```bash
# Automated setup
./setup-whisper-local.sh

# Or manual
pip install -U openai-whisper
brew install ffmpeg  # macOS
echo "ASR_PROVIDER=whisper-local" >> server/.env
```

## ⚙️ Configuration

**`server/.env`:**
```bash
ASR_PROVIDER=whisper-local
WHISPER_MODEL=base
```

## 🧪 Testing

```bash
cd server
npm run test-whisper-local
```

## 🎛️ Model Selection

| Model | Speed | Accuracy | Use Case |
|-------|-------|----------|----------|
| **tiny** | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | Testing |
| **base** ⭐ | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | **Recommended** |
| **turbo** ⭐ | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | **Best overall** |

Change model:
```bash
WHISPER_MODEL=turbo  # in .env
```

## 🔄 Switch Providers

```bash
# Local Whisper (FREE)
ASR_PROVIDER=whisper-local

# OpenAI API
ASR_PROVIDER=whisper
OPENAI_API_KEY=sk-...

# Google Cloud
ASR_PROVIDER=google
```

## 🐛 Quick Fixes

**Whisper not installed:**
```bash
pip install -U openai-whisper
```

**ffmpeg missing:**
```bash
brew install ffmpeg  # macOS
sudo apt install ffmpeg  # Linux
```

**Slow transcription:**
```bash
WHISPER_MODEL=tiny  # faster model
```

**Check installation:**
```bash
python3 -c "import whisper; print('✅ OK')"
```

## 💰 Cost Savings

| Provider | 1000 min/month | Annual |
|----------|----------------|--------|
| **Local Whisper** | **$0** | **$0** |
| OpenAI API | $6 | $72 |
| Google STT | $24 | $288 |

## 📊 Performance

**10-second audio transcription:**
- CPU: 1-2 seconds
- GPU: 0.2-0.5 seconds
- Accuracy: 95-98%

## 🔒 Privacy

✅ **100% local processing**
✅ **No cloud dependencies**
✅ **GDPR/HIPAA compliant**
✅ **No API keys needed**

## 📁 Key Files

```
server/
├── services/
│   └── whisperLocal.service.js    # Node.js service
├── scripts/
│   ├── whisper-transcribe.py      # Python script
│   └── test-whisper-local.js      # Test script
└── .env                            # Configuration

setup-whisper-local.sh              # Auto installer
LOCAL_WHISPER_GUIDE.md              # Full guide
```

## 🎯 Common Commands

```bash
# Test installation
npm run test-whisper-local

# Start server
npm run dev

# Download model manually
python3 -c "import whisper; whisper.load_model('base')"

# Check GPU support
python3 -c "import torch; print(torch.cuda.is_available())"

# Clear model cache
rm -rf ~/.cache/whisper/
```

## 📖 Full Documentation

- **`LOCAL_WHISPER_GUIDE.md`** - Complete setup guide
- **`LOCAL_WHISPER_COMPLETE.md`** - Implementation details

## ✅ Checklist

- [ ] Run `./setup-whisper-local.sh`
- [ ] Test with `npm run test-whisper-local`
- [ ] Set `ASR_PROVIDER=whisper-local`
- [ ] Start server with `npm run dev`
- [ ] Test in app!

---

**Need help?** Check `LOCAL_WHISPER_GUIDE.md` or run `npm run test-whisper-local`
