@echo off
REM 🚀 Investoft - Quick GitHub Setup Script (Windows)
REM This script helps you push your project to GitHub quickly

echo 🚀 Investoft GitHub Setup
echo ==========================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first:
    echo    https://git-scm.com/downloads
    pause
    exit /b 1
)

echo ✅ Git is installed
echo.

REM Get GitHub username
set /p GITHUB_USERNAME="Enter your GitHub username: "

if "%GITHUB_USERNAME%"=="" (
    echo ❌ GitHub username is required
    pause
    exit /b 1
)

REM Get repository name
set /p REPO_NAME="Enter repository name (default: investoft): "
if "%REPO_NAME%"=="" set REPO_NAME=investoft

echo.
echo 📋 Configuration:
echo    GitHub User: %GITHUB_USERNAME%
echo    Repository: %REPO_NAME%
echo    Remote URL: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
echo.

set /p CONFIRM="Is this correct? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo ❌ Setup cancelled
    pause
    exit /b 0
)

echo.
echo 🔧 Setting up Git repository...

REM Initialize git if not already initialized
if not exist .git (
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

REM Add all files
echo 📦 Adding files...
git add .

REM Commit
echo 💾 Committing changes...
git commit -m "Initial commit: Investoft trading platform"
if errorlevel 1 (
    echo ⚠️  No changes to commit or commit failed
) else (
    echo ✅ Changes committed
)

REM Add remote
echo 🔗 Adding remote...
git remote remove origin 2>nul
git remote add origin "https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git"
echo ✅ Remote added

REM Rename branch to main
git branch -M main

echo.
echo 🚀 Ready to push to GitHub!
echo.
echo ⚠️  IMPORTANT: Make sure you have created the repository on GitHub first:
echo    https://github.com/new
echo.
echo    Repository name: %REPO_NAME%
echo    Description: Modern trading platform with real-time charts
echo    Visibility: Public (or Private)
echo    ⚠️  DO NOT add README or .gitignore (we already have them)
echo.

set /p REPO_CREATED="Have you created the repository on GitHub? (y/n): "
if /i not "%REPO_CREATED%"=="y" (
    echo.
    echo 📝 Please create the repository first, then run this script again.
    echo    Or manually push with: git push -u origin main
    pause
    exit /b 0
)

echo.
echo 📤 Pushing to GitHub...

REM Push to GitHub
git push -u origin main
if errorlevel 1 (
    echo.
    echo ❌ Push failed. Possible reasons:
    echo    1. Repository doesn't exist on GitHub
    echo    2. You don't have push access
    echo    3. Authentication failed
    echo.
    echo 💡 Try manual push:
    echo    git push -u origin main
    echo.
    echo    If authentication fails, you may need to:
    echo    - Use GitHub Personal Access Token
    echo    - Or setup SSH keys
    echo    See: https://docs.github.com/en/authentication
) else (
    echo.
    echo ✅ SUCCESS! Your code is now on GitHub! 🎉
    echo.
    echo 📍 Repository URL:
    echo    https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
    echo.
    echo 🚀 Next steps:
    echo    1. Go to https://rocket.new
    echo    2. Click 'Import from GitHub'
    echo    3. Select your 'investoft' repository
    echo    4. Follow the deployment guide in DEPLOY_GITHUB_ROCKET.md
)

echo.
pause
