@echo off
REM 🚀 Deploy Binance Proxy Edge Function (Windows)
REM Script otomatis untuk deploy Edge Function ke Supabase

setlocal EnableDelayedExpansion

echo.
echo ==================================
echo    DEPLOY BINANCE PROXY
echo    Investoft Trading Platform
echo ==================================
echo.

set PROJECT_ID=nvocyxqxlxqxdzioxgrw

REM Step 1: Check Supabase CLI
echo [1/5] Checking Supabase CLI...
where supabase >nul 2>nul
if errorlevel 1 (
    echo ❌ Supabase CLI not found!
    echo.
    echo Install Supabase CLI first:
    echo   Windows: scoop install supabase
    echo   npm:     npm install -g supabase
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('supabase --version') do set SUPABASE_VERSION=%%i
echo ✅ Supabase CLI installed: %SUPABASE_VERSION%
echo.

REM Step 2: Check Login Status
echo [2/5] Checking authentication...
supabase projects list >nul 2>nul
if errorlevel 1 (
    echo ⚠️  Not logged in to Supabase
    echo Logging in...
    supabase login
    if errorlevel 1 (
        echo ❌ Login failed
        pause
        exit /b 1
    )
    echo ✅ Login successful
) else (
    echo ✅ Already logged in
)
echo.

REM Step 3: Link Project
echo [3/5] Linking project...
if exist ".supabase\config.toml" (
    echo ✅ Project already linked
) else (
    echo Linking to project: %PROJECT_ID%
    supabase link --project-ref %PROJECT_ID%
    if errorlevel 1 (
        echo ❌ Failed to link project
        pause
        exit /b 1
    )
    echo ✅ Project linked
)
echo.

REM Step 4: Verify Function Files
echo [4/5] Verifying function files...
if not exist "supabase\functions\binance-proxy\index.ts" (
    echo ❌ Function file not found: supabase\functions\binance-proxy\index.ts
    pause
    exit /b 1
)
echo ✅ Function files verified
echo.

REM Step 5: Deploy Function
echo [5/5] Deploying binance-proxy function...
echo.
supabase functions deploy binance-proxy --no-verify-jwt
if errorlevel 1 (
    echo ❌ Deployment failed
    pause
    exit /b 1
)
echo.
echo ✅ Deployment complete!
echo.

REM Success Message
set FUNCTION_URL=https://%PROJECT_ID%.supabase.co/functions/v1/binance-proxy
echo ==================================
echo 🎉 SUCCESS!
echo ==================================
echo.
echo Function URL:
echo   %FUNCTION_URL%
echo.
echo Test with cURL:
echo   curl %FUNCTION_URL%
echo.
echo Next steps:
echo   1. Refresh your application (Ctrl+Shift+R)
echo   2. Check browser console for price updates
echo   3. Monitor function logs: supabase functions logs binance-proxy
echo.

REM Ask if user wants to test now
set /p TEST_NOW="Test function now? (y/n): "
if /i "%TEST_NOW%"=="y" (
    echo.
    echo Testing function...
    echo.
    curl -s "%FUNCTION_URL%"
    echo.
    echo.
    echo ✅ Function is working!
)

echo.
echo Deployment completed successfully! 🚀
echo.
pause
