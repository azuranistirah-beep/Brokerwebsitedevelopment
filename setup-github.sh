#!/bin/bash

# 🚀 Investoft - Quick GitHub Setup Script
# This script helps you push your project to GitHub quickly

echo "🚀 Investoft GitHub Setup"
echo "=========================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first:"
    echo "   https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

# Get repository name (default: investoft)
read -p "Enter repository name (default: investoft): " REPO_NAME
REPO_NAME=${REPO_NAME:-investoft}

echo ""
echo "📋 Configuration:"
echo "   GitHub User: $GITHUB_USERNAME"
echo "   Repository: $REPO_NAME"
echo "   Remote URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo ""

read -p "Is this correct? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "❌ Setup cancelled"
    exit 0
fi

echo ""
echo "🔧 Setting up Git repository..."

# Initialize git if not already initialized
if [ ! -d .git ]; then
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files
echo "📦 Adding files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "⚠️  No changes to commit"
else
    # Commit
    echo "💾 Committing changes..."
    git commit -m "Initial commit: Investoft trading platform

Features:
- Trading Demo with TradingView charts
- Real-time news feed
- User authentication
- Admin dashboard
- Market screener
- Responsive design"
    echo "✅ Changes committed"
fi

# Add remote
echo "🔗 Adding remote..."
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo "✅ Remote added"

# Rename branch to main
git branch -M main

echo ""
echo "🚀 Ready to push to GitHub!"
echo ""
echo "⚠️  IMPORTANT: Make sure you have created the repository on GitHub first:"
echo "   https://github.com/new"
echo ""
echo "   Repository name: $REPO_NAME"
echo "   Description: Modern trading platform with real-time charts"
echo "   Visibility: Public (or Private)"
echo "   ⚠️  DO NOT add README or .gitignore (we already have them)"
echo ""

read -p "Have you created the repository on GitHub? (y/n): " REPO_CREATED
if [ "$REPO_CREATED" != "y" ]; then
    echo ""
    echo "📝 Please create the repository first, then run this script again."
    echo "   Or manually push with: git push -u origin main"
    exit 0
fi

echo ""
echo "📤 Pushing to GitHub..."

# Push to GitHub
if git push -u origin main; then
    echo ""
    echo "✅ SUCCESS! Your code is now on GitHub! 🎉"
    echo ""
    echo "📍 Repository URL:"
    echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Go to https://rocket.new"
    echo "   2. Click 'Import from GitHub'"
    echo "   3. Select your 'investoft' repository"
    echo "   4. Follow the deployment guide in DEPLOY_GITHUB_ROCKET.md"
    echo ""
else
    echo ""
    echo "❌ Push failed. Possible reasons:"
    echo "   1. Repository doesn't exist on GitHub"
    echo "   2. You don't have push access"
    echo "   3. Authentication failed"
    echo ""
    echo "💡 Try manual push:"
    echo "   git push -u origin main"
    echo ""
    echo "   If authentication fails, you may need to:"
    echo "   - Use GitHub Personal Access Token"
    echo "   - Or setup SSH keys"
    echo "   See: https://docs.github.com/en/authentication"
fi
