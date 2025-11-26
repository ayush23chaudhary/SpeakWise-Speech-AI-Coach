#!/bin/bash

# SpeakWise Deployment Helper Script
# This script helps prepare your project for deployment

echo "🚀 SpeakWise Deployment Helper"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check for .gitignore
if [ ! -f .gitignore ]; then
    echo "⚠️  No .gitignore found! Creating one..."
    cat > .gitignore << 'EOF'
# Environment variables
.env
.env.local
.env.development
.env.production
.env.test

# Google credentials
google-credentials.json
server/google-credentials.json

# Dependencies
node_modules
node_modules/
*/node_modules/

# Build outputs
dist
build
.vercel
.render

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode
.idea
*.swp
*.swo
*~

# Testing
coverage
.nyc_output
EOF
    echo "✅ .gitignore created"
else
    echo "✅ .gitignore exists"
fi

# Check for sensitive files
echo ""
echo "🔍 Checking for sensitive files..."

if [ -f "server/.env" ]; then
    echo "⚠️  WARNING: server/.env found - make sure it's in .gitignore!"
fi

if [ -f "client/.env" ]; then
    echo "⚠️  WARNING: client/.env found - make sure it's in .gitignore!"
fi

if [ -f "server/google-credentials.json" ]; then
    echo "⚠️  WARNING: server/google-credentials.json found - make sure it's in .gitignore!"
    
    # Offer to create base64 version
    echo ""
    read -p "📝 Would you like to generate GOOGLE_CREDENTIALS_BASE64? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "🔐 Base64 encoded credentials (copy this for Render):"
        echo "=================================================="
        cat server/google-credentials.json | base64
        echo "=================================================="
        echo ""
        echo "💾 Copy the above text and save it as GOOGLE_CREDENTIALS_BASE64 in Render"
    fi
fi

# Check for required files
echo ""
echo "📋 Checking required files..."

required_files=(
    "vercel.json"
    "render.yaml"
    "server/.env.example"
    "client/.env.example"
    "DEPLOYMENT_GUIDE.md"
    "DEPLOYMENT_CHECKLIST.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check Node.js version
echo ""
echo "🔧 Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"

if [[ "$node_version" < "v18" ]]; then
    echo "⚠️  WARNING: Node.js 18+ recommended for deployment"
else
    echo "✅ Node.js version compatible"
fi

# Offer to add git remote
echo ""
read -p "📡 Add GitHub remote? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git remote add origin https://github.com/ayush23chaudhary/SpeakWise-Speech-AI-Coach.git 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Remote added successfully"
    else
        echo "ℹ️  Remote already exists or failed to add"
    fi
fi

# Offer to create initial commit
echo ""
read -p "💾 Create initial commit? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "Initial commit: SpeakWise Speech AI Coach"
    echo "✅ Commit created"
fi

# Offer to push to GitHub
echo ""
read -p "🚀 Push to GitHub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git branch -M main
    git push -u origin main
    if [ $? -eq 0 ]; then
        echo "✅ Code pushed to GitHub!"
    else
        echo "❌ Push failed. Please check your GitHub credentials and remote URL"
    fi
fi

echo ""
echo "================================"
echo "🎉 Preparation Complete!"
echo ""
echo "Next Steps:"
echo "1. Go to https://render.com and deploy backend"
echo "2. Go to https://vercel.com and deploy frontend"
echo "3. Follow DEPLOYMENT_CHECKLIST.md for detailed steps"
echo ""
echo "📚 Documentation:"
echo "   - DEPLOYMENT_GUIDE.md (complete guide)"
echo "   - DEPLOYMENT_CHECKLIST.md (step-by-step checklist)"
echo ""
echo "Good luck! 🚀"
