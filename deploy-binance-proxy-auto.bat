@echo off
REM 🚀 One-Click Deploy Binance Proxy (Windows)
REM This script will automatically deploy binance-proxy Edge Function to Supabase

echo.
echo ===============================================
echo    INVESTOFT - BINANCE PROXY DEPLOYMENT
echo ===============================================
echo.

REM Project configuration
set PROJECT_REF=nvocyxqxlxqxdzioxgrw
set FUNCTION_NAME=binance-proxy

echo Configuration:
echo    Project: %PROJECT_REF%
echo    Function: %FUNCTION_NAME%
echo.

REM Step 1: Check if Supabase CLI is installed
echo Step 1: Checking Supabase CLI...
where supabase >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [91m ERROR: Supabase CLI not found![0m
    echo.
    echo Installing Supabase CLI...
    call npm install -g supabase
    
    if %ERRORLEVEL% NEQ 0 (
        echo [91m ERROR: Failed to install Supabase CLI[0m
        echo Try manual installation:
        echo    npm install -g supabase
        pause
        exit /b 1
    )
)
echo [92m OK: Supabase CLI is installed[0m
echo.

REM Step 2: Check login status
echo Step 2: Checking login status...
supabase projects list >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [93m WARNING: Not logged in to Supabase[0m
    echo.
    echo Opening browser for login...
    call supabase login
    
    if %ERRORLEVEL% NEQ 0 (
        echo [91m ERROR: Login failed[0m
        pause
        exit /b 1
    )
)
echo [92m OK: Logged in to Supabase[0m
echo.

REM Step 3: Link project
echo Step 3: Linking to project...
call supabase link --project-ref %PROJECT_REF%

if %ERRORLEVEL% NEQ 0 (
    echo [91m ERROR: Failed to link project[0m
    echo Make sure you have access to project: %PROJECT_REF%
    pause
    exit /b 1
)
echo [92m OK: Project linked successfully[0m
echo.

REM Step 4: Deploy function
echo Step 4: Deploying %FUNCTION_NAME%...
echo This may take 30-60 seconds...
echo.

call supabase functions deploy %FUNCTION_NAME%

if %ERRORLEVEL% NEQ 0 (
    echo [91m ERROR: Deployment failed[0m
    echo.
    echo Possible issues:
    echo    1. Check if you have permissions
    echo    2. Verify Edge Functions are enabled
    echo    3. Check Supabase Dashboard logs
    pause
    exit /b 1
)

echo.
echo [92m SUCCESS: Deployment successful![0m
echo.

REM Step 5: Test the deployment
echo Step 5: Testing deployment...
set FUNCTION_URL=https://%PROJECT_REF%.supabase.co/functions/v1/%FUNCTION_NAME%

echo Testing URL: %FUNCTION_URL%
echo.

REM Test with curl (if available)
where curl >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Testing with curl...
    curl -s -X POST %FUNCTION_URL% ^
      -H "Content-Type: application/json" ^
      -d "{\"symbol\":\"BTCUSDT\"}"
    echo.
) else (
    echo curl not found, skipping test
    echo You can test manually in browser console
)

echo.
echo ===============================================
echo    DEPLOYMENT COMPLETE!
echo ===============================================
echo.
echo Next steps:
echo    1. Open your app in browser
echo    2. Hard refresh: Ctrl+Shift+R
echo    3. Open DevTools Console (F12)
echo    4. Check for real-time price updates
echo.
echo Useful links:
echo    Dashboard: https://supabase.com/dashboard/project/%PROJECT_REF%
echo    Logs: https://supabase.com/dashboard/project/%PROJECT_REF%/logs/edge-functions
echo    Function URL: %FUNCTION_URL%
echo.
echo [92m All done! Your binance-proxy is now live![0m
echo.
pause
