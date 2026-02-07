@echo off
REM 🚀 Investoft Edge Functions Auto-Deploy Script (Windows)
REM This script automates the deployment of Supabase Edge Functions

echo ==================================================
echo 🚀 Investoft Edge Functions Deployment
echo ==================================================
echo.

REM Check if Supabase CLI is installed
echo Checking Supabase CLI...
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Supabase CLI not found!
    echo ℹ️  Installing Supabase CLI globally...
    call npm install -g supabase
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Supabase CLI installed successfully!
    ) else (
        echo ❌ Failed to install Supabase CLI. Please install manually.
        pause
        exit /b 1
    )
) else (
    echo ✅ Supabase CLI is already installed
    call supabase --version
)

echo.
echo ==================================================
echo Step 1: Authentication
echo ==================================================

REM Check if already logged in
call supabase projects list >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Already logged in to Supabase
) else (
    echo ⚠️  Not logged in. Starting authentication...
    echo ℹ️  Browser will open for authentication...
    call supabase login
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Login successful!
    ) else (
        echo ❌ Login failed. Please try again manually.
        pause
        exit /b 1
    )
)

echo.
echo ==================================================
echo Step 2: Project Linking
echo ==================================================

REM Check if project is already linked
if exist ".supabase\config.toml" (
    echo ⚠️  Project appears to be linked already
    set /p relink="Do you want to re-link? (y/n): "
    if /i not "%relink%"=="y" (
        echo ℹ️  Skipping project linking...
        goto secrets
    )
)

echo.
echo ℹ️  Please enter your Supabase Project Reference ID:
echo ℹ️  (Find it at: https://app.supabase.com/project/_/settings/general)
set /p project_ref="Project Ref: "

if "%project_ref%"=="" (
    echo ❌ Project reference cannot be empty!
    pause
    exit /b 1
)

call supabase link --project-ref %project_ref%

if %ERRORLEVEL% EQU 0 (
    echo ✅ Project linked successfully!
) else (
    echo ❌ Failed to link project. Please check your project reference.
    pause
    exit /b 1
)

:secrets
echo.
echo ==================================================
echo Step 3: Environment Secrets
echo ==================================================

echo ℹ️  Checking if secrets are already set...
call supabase secrets list

echo.
set /p set_secrets="Do you want to set/update environment secrets? (y/n): "

if /i "%set_secrets%"=="y" (
    echo.
    echo ℹ️  Enter your Supabase credentials (press Enter to skip):
    
    set /p supabase_url="SUPABASE_URL: "
    if not "%supabase_url%"=="" (
        call supabase secrets set SUPABASE_URL="%supabase_url%"
    )
    
    set /p supabase_anon_key="SUPABASE_ANON_KEY: "
    if not "%supabase_anon_key%"=="" (
        call supabase secrets set SUPABASE_ANON_KEY="%supabase_anon_key%"
    )
    
    set /p supabase_service_key="SUPABASE_SERVICE_ROLE_KEY: "
    if not "%supabase_service_key%"=="" (
        call supabase secrets set SUPABASE_SERVICE_ROLE_KEY="%supabase_service_key%"
    )
    
    set /p news_api_key="NEWS_API_KEY (optional): "
    if not "%news_api_key%"=="" (
        call supabase secrets set NEWS_API_KEY="%news_api_key%"
    )
    
    echo ✅ Secrets updated!
) else (
    echo ℹ️  Skipping secrets setup...
)

echo.
echo ==================================================
echo Step 4: Deployment
echo ==================================================

echo ℹ️  Deploying Edge Function: make-server...
echo.

call supabase functions deploy make-server --no-verify-jwt

if %ERRORLEVEL% EQU 0 (
    echo ✅ Deployment successful! 🎉
    echo.
    echo ℹ️  Your Edge Function is now live!
    echo ℹ️  View logs with: supabase functions logs make-server
) else (
    echo ❌ Deployment failed!
    echo.
    echo ⚠️  Common solutions:
    echo 1. Try using access token:
    echo    - Generate at: https://app.supabase.com/account/tokens
    echo    - Set: set SUPABASE_ACCESS_TOKEN=your_token
    echo    - Run this script again
    echo.
    echo 2. Check organization permissions
    echo 3. Verify project reference ID
    echo.
    echo ℹ️  For detailed troubleshooting, see: EDGE_FUNCTIONS_DEPLOYMENT_FIX.md
    pause
    exit /b 1
)

echo.
echo ==================================================
echo Step 5: Testing
echo ==================================================

echo ℹ️  Getting function URL...
call supabase functions list

echo.
echo ✅ Deployment Complete!
echo ℹ️  Next steps:
echo   1. Test your function endpoint
echo   2. Check logs: supabase functions logs make-server
echo   3. Update frontend API URLs if needed
echo.
echo ==================================================

pause
