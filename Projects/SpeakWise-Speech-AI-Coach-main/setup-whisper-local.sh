#!/bin/bash

# Setup script for Local Whisper ASR
# This script installs OpenAI's open-source Whisper for local transcription

echo "=========================================="
echo "Local Whisper Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    echo "Please install Python 3.8 or higher:"
    echo "  macOS: brew install python3"
    echo "  Ubuntu/Debian: sudo apt install python3 python3-pip"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✅ Python ${PYTHON_VERSION} found${NC}"

# Check if pip is installed
echo ""
echo "Checking pip installation..."
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}❌ pip3 is not installed${NC}"
    echo "Please install pip3"
    exit 1
fi

PIP_VERSION=$(pip3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✅ pip ${PIP_VERSION} found${NC}"

# Check if ffmpeg is installed
echo ""
echo "Checking ffmpeg installation..."
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${YELLOW}⚠️  ffmpeg is not installed${NC}"
    echo "ffmpeg is required for audio processing"
    echo ""
    echo "Installation instructions:"
    echo "  macOS:          brew install ffmpeg"
    echo "  Ubuntu/Debian:  sudo apt update && sudo apt install ffmpeg"
    echo "  Arch Linux:     sudo pacman -S ffmpeg"
    echo "  Windows:        choco install ffmpeg  (or scoop install ffmpeg)"
    echo ""
    read -p "Continue without ffmpeg? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    FFMPEG_VERSION=$(ffmpeg -version 2>&1 | head -n 1 | awk '{print $3}')
    echo -e "${GREEN}✅ ffmpeg ${FFMPEG_VERSION} found${NC}"
fi

# Install Whisper
echo ""
echo "=========================================="
echo "Installing OpenAI Whisper..."
echo "=========================================="
echo ""

pip3 install -U openai-whisper

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Whisper installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install Whisper${NC}"
    echo "Try running: pip3 install --user -U openai-whisper"
    exit 1
fi

# Verify installation
echo ""
echo "Verifying Whisper installation..."
python3 -c "import whisper; print('Whisper version:', whisper.__version__)" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Whisper is working correctly${NC}"
else
    echo -e "${RED}❌ Whisper verification failed${NC}"
    exit 1
fi

# Download a model (optional but recommended)
echo ""
echo "=========================================="
echo "Downloading Whisper Model"
echo "=========================================="
echo ""
echo "Available models:"
echo "  1. tiny   - Fastest, least accurate (~39M params, ~1 GB VRAM)"
echo "  2. base   - Good balance (recommended) (~74M params, ~1 GB VRAM)"
echo "  3. small  - Better accuracy (~244M params, ~2 GB VRAM)"
echo "  4. medium - High accuracy (~769M params, ~5 GB VRAM)"
echo "  5. large  - Highest accuracy (~1550M params, ~10 GB VRAM)"
echo "  6. turbo  - Fast & accurate (~809M params, ~6 GB VRAM)"
echo ""
read -p "Download a model now? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Which model? (tiny/base/small/medium/large/turbo) [base]: " MODEL
    MODEL=${MODEL:-base}
    
    echo ""
    echo "Downloading ${MODEL} model (this may take a few minutes)..."
    python3 -c "import whisper; whisper.load_model('${MODEL}')"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${MODEL} model downloaded successfully${NC}"
    else
        echo -e "${RED}❌ Failed to download ${MODEL} model${NC}"
        echo "You can download it later when first using Whisper"
    fi
fi

# Make Python script executable
echo ""
echo "Making Python script executable..."
chmod +x server/scripts/whisper-transcribe.py
echo -e "${GREEN}✅ Script permissions set${NC}"

# Update .env file
echo ""
echo "=========================================="
echo "Environment Configuration"
echo "=========================================="
echo ""

ENV_FILE="server/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file..."
    touch "$ENV_FILE"
fi

# Check if ASR_PROVIDER is already set
if grep -q "ASR_PROVIDER" "$ENV_FILE"; then
    echo -e "${YELLOW}⚠️  ASR_PROVIDER already exists in .env${NC}"
    echo "Current value:"
    grep "ASR_PROVIDER" "$ENV_FILE"
    echo ""
    read -p "Update to whisper-local? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Update existing line
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' 's/^ASR_PROVIDER=.*/ASR_PROVIDER=whisper-local/' "$ENV_FILE"
        else
            sed -i 's/^ASR_PROVIDER=.*/ASR_PROVIDER=whisper-local/' "$ENV_FILE"
        fi
        echo -e "${GREEN}✅ Updated ASR_PROVIDER to whisper-local${NC}"
    fi
else
    echo "Adding ASR_PROVIDER to .env..."
    echo "" >> "$ENV_FILE"
    echo "# ASR Provider (google, whisper, whisper-local)" >> "$ENV_FILE"
    echo "ASR_PROVIDER=whisper-local" >> "$ENV_FILE"
    echo -e "${GREEN}✅ Added ASR_PROVIDER=whisper-local${NC}"
fi

# Check if WHISPER_MODEL is set
if ! grep -q "WHISPER_MODEL" "$ENV_FILE"; then
    echo "Adding WHISPER_MODEL to .env..."
    echo "" >> "$ENV_FILE"
    echo "# Whisper Model (tiny, base, small, medium, large, turbo)" >> "$ENV_FILE"
    echo "WHISPER_MODEL=base" >> "$ENV_FILE"
    echo -e "${GREEN}✅ Added WHISPER_MODEL=base${NC}"
fi

# Summary
echo ""
echo "=========================================="
echo "Setup Complete! 🎉"
echo "=========================================="
echo ""
echo "Local Whisper is now configured:"
echo "  ✅ Python and dependencies installed"
echo "  ✅ Whisper package installed"
echo "  ✅ Environment configured"
echo ""
echo "Next steps:"
echo "  1. Test the setup:"
echo "     cd server && npm run test-whisper-local"
echo ""
echo "  2. Start your server:"
echo "     npm run dev"
echo ""
echo "  3. Your app will now use local Whisper for transcription!"
echo ""
echo "Configuration:"
echo "  ASR_PROVIDER=whisper-local (in server/.env)"
echo "  WHISPER_MODEL=${MODEL:-base} (change in server/.env)"
echo ""
echo "Models are cached in:"
echo "  ~/.cache/whisper/ (Linux/macOS)"
echo "  %USERPROFILE%\\.cache\\whisper\\ (Windows)"
echo ""
echo -e "${GREEN}Happy transcribing! 🎤${NC}"
