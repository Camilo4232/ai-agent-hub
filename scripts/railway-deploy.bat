@echo off
REM Railway Deployment Script for AI Agent Hub (Windows)
REM Usage: scripts\railway-deploy.bat

echo.
echo 🚂 AI Agent Hub - Railway Deployment Script
echo ===========================================
echo.

REM Check if Railway CLI is installed
where railway >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Railway CLI not found!
    echo.
    echo Installing Railway CLI...
    npm install -g @railway/cli
    echo ✅ Railway CLI installed
)

REM Check if logged in to Railway
echo 🔐 Checking Railway authentication...
railway whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Not logged in to Railway
    echo Please login...
    railway login
) else (
    echo ✅ Authenticated with Railway
)

REM Check if project is initialized
echo.
echo 📦 Checking project initialization...
if not exist ".railway" (
    echo ⚠️  Project not initialized
    echo Initializing Railway project...
    railway init
) else (
    echo ✅ Project initialized
)

REM Ask for confirmation
echo.
echo ⚠️  This will deploy to Railway using current configuration
set /p CONFIRM="Continue? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo ❌ Deployment cancelled
    exit /b 1
)

REM Run build locally
echo.
echo 🔨 Testing build locally...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    echo Please fix errors before deploying
    exit /b 1
)
echo ✅ Build successful

REM Deploy to Railway
echo.
echo 🚀 Deploying to Railway...
railway up

REM Wait for deployment
echo.
echo ⏳ Waiting for deployment to complete...
timeout /t 10 /nobreak >nul

REM Get deployment info
echo.
echo 🌐 Getting deployment URL...
railway domain

echo.
echo ✨ Deployment complete!
echo.
echo Next steps:
echo   1. View logs: railway logs
echo   2. Monitor deployment: railway status
echo   3. View dashboard: https://railway.app/dashboard
echo.

pause
