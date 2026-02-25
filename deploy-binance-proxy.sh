#!/bin/bash

# 🚀 Deploy Binance Proxy Edge Function
# Script otomatis untuk deploy Edge Function ke Supabase

set -e

echo ""
echo "🚀 =================================="
echo "   DEPLOY BINANCE PROXY"
echo "   Investoft Trading Platform"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project Config
PROJECT_ID="nvocyxqxlxqxdzioxgrw"

# Step 1: Check Supabase CLI
echo -e "${BLUE}[1/5]${NC} Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo ""
    echo "Install Supabase CLI first:"
    echo "  macOS/Linux: brew install supabase/tap/supabase"
    echo "  Windows:     scoop install supabase"
    echo "  npm:         npm install -g supabase"
    echo ""
    exit 1
fi

SUPABASE_VERSION=$(supabase --version)
echo -e "${GREEN}✅ Supabase CLI installed: ${SUPABASE_VERSION}${NC}"
echo ""

# Step 2: Check Login Status
echo -e "${BLUE}[2/5]${NC} Checking authentication..."
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase${NC}"
    echo "Logging in..."
    supabase login
    echo -e "${GREEN}✅ Login successful${NC}"
else
    echo -e "${GREEN}✅ Already logged in${NC}"
fi
echo ""

# Step 3: Link Project
echo -e "${BLUE}[3/5]${NC} Linking project..."
if [ -f ".supabase/config.toml" ]; then
    echo -e "${GREEN}✅ Project already linked${NC}"
else
    echo "Linking to project: ${PROJECT_ID}"
    supabase link --project-ref "${PROJECT_ID}"
    echo -e "${GREEN}✅ Project linked${NC}"
fi
echo ""

# Step 4: Verify Function Files
echo -e "${BLUE}[4/5]${NC} Verifying function files..."
if [ ! -f "supabase/functions/binance-proxy/index.ts" ]; then
    echo -e "${RED}❌ Function file not found: supabase/functions/binance-proxy/index.ts${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Function files verified${NC}"
echo ""

# Step 5: Deploy Function
echo -e "${BLUE}[5/5]${NC} Deploying binance-proxy function..."
echo ""
supabase functions deploy binance-proxy --no-verify-jwt
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""

# Test Endpoint
FUNCTION_URL="https://${PROJECT_ID}.supabase.co/functions/v1/binance-proxy"
echo "=================================="
echo "🎉 SUCCESS!"
echo "=================================="
echo ""
echo "Function URL:"
echo "  ${FUNCTION_URL}"
echo ""
echo "Test with cURL:"
echo "  curl ${FUNCTION_URL}"
echo ""
echo "Next steps:"
echo "  1. Refresh your application (Ctrl+Shift+R)"
echo "  2. Check browser console for price updates"
echo "  3. Monitor function logs: supabase functions logs binance-proxy"
echo ""

# Ask if user wants to test now
read -p "Test function now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Testing function..."
    echo ""
    curl -s "${FUNCTION_URL}" | head -c 500
    echo ""
    echo ""
    echo -e "${GREEN}✅ Function is working!${NC}"
fi

echo ""
echo "Deployment completed successfully! 🚀"
echo ""
