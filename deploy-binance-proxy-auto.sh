#!/bin/bash

# 🚀 One-Click Deploy Binance Proxy
# This script will automatically deploy binance-proxy Edge Function to Supabase

echo "🚀 ==============================================="
echo "   INVESTOFT - BINANCE PROXY DEPLOYMENT"
echo "==============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_REF="nvocyxqxlxqxdzioxgrw"
FUNCTION_NAME="binance-proxy"

echo "📋 Configuration:"
echo "   Project: $PROJECT_REF"
echo "   Function: $FUNCTION_NAME"
echo ""

# Step 1: Check if Supabase CLI is installed
echo "Step 1: Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo ""
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install Supabase CLI${NC}"
        echo "💡 Try manual installation:"
        echo "   npm install -g supabase"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Supabase CLI is installed${NC}"
echo ""

# Step 2: Check login status
echo "Step 2: Checking login status..."
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase${NC}"
    echo ""
    echo "🔐 Opening browser for login..."
    supabase login
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Login failed${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Logged in to Supabase${NC}"
echo ""

# Step 3: Link project
echo "Step 3: Linking to project..."
supabase link --project-ref $PROJECT_REF 2>&1 | grep -q "already linked" || supabase link --project-ref $PROJECT_REF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to link project${NC}"
    echo "💡 Make sure you have access to project: $PROJECT_REF"
    exit 1
fi
echo -e "${GREEN}✅ Project linked successfully${NC}"
echo ""

# Step 4: Deploy function
echo "Step 4: Deploying $FUNCTION_NAME..."
echo "⏳ This may take 30-60 seconds..."
echo ""

supabase functions deploy $FUNCTION_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    echo ""
    echo "🔍 Possible issues:"
    echo "   1. Check if you have permissions"
    echo "   2. Verify Edge Functions are enabled"
    echo "   3. Check Supabase Dashboard logs"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""

# Step 5: Test the deployment
echo "Step 5: Testing deployment..."
FUNCTION_URL="https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME"

echo "🧪 Testing URL: $FUNCTION_URL"
echo ""

# Test with curl
RESPONSE=$(curl -s -X POST $FUNCTION_URL \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT"}')

if echo "$RESPONSE" | grep -q "price"; then
    echo -e "${GREEN}✅ Test successful!${NC}"
    echo ""
    echo "📊 Response:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${YELLOW}⚠️  Test returned unexpected response${NC}"
    echo ""
    echo "📊 Response:"
    echo "$RESPONSE"
fi

echo ""
echo "🎉 ==============================================="
echo "   DEPLOYMENT COMPLETE!"
echo "==============================================="
echo ""
echo "📝 Next steps:"
echo "   1. Open your app in browser"
echo "   2. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   3. Open DevTools Console (F12)"
echo "   4. Check for real-time price updates"
echo ""
echo "🔗 Useful links:"
echo "   Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF"
echo "   Logs: https://supabase.com/dashboard/project/$PROJECT_REF/logs/edge-functions"
echo "   Function URL: $FUNCTION_URL"
echo ""
echo -e "${GREEN}✅ All done! Your binance-proxy is now live! 🚀${NC}"
echo ""
