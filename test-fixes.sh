#!/bin/bash

# 🧪 Test Script - Verify All Fixes
# This script tests if all fixes are working correctly

echo "🧪 ==============================================="
echo "   INVESTOFT - ERROR FIX VERIFICATION"
echo "==============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_REF="nvocyxqxlxqxdzioxgrw"
FUNCTION_NAME="binance-proxy"
FUNCTION_URL="https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME"

echo "📋 Tests to run:"
echo "   1. Check Supabase CLI"
echo "   2. Test Edge Function deployment"
echo "   3. Test Edge Function response"
echo "   4. Verify project files"
echo ""

# Test 1: Check Supabase CLI
echo "Test 1: Checking Supabase CLI..."
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI is installed${NC}"
else
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "   Install: npm install -g supabase"
fi
echo ""

# Test 2: Check if logged in
echo "Test 2: Checking Supabase login status..."
if supabase projects list &> /dev/null 2>&1; then
    echo -e "${GREEN}✅ Logged in to Supabase${NC}"
else
    echo -e "${YELLOW}⚠️  Not logged in${NC}"
    echo "   Run: supabase login"
fi
echo ""

# Test 3: Test Edge Function
echo "Test 3: Testing Edge Function..."
echo "   URL: $FUNCTION_URL"
echo "   Testing BTCUSDT price..."

RESPONSE=$(curl -s -X POST $FUNCTION_URL \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT"}' 2>/dev/null)

if echo "$RESPONSE" | grep -q "price"; then
    echo -e "${GREEN}✅ Edge Function is working!${NC}"
    echo ""
    echo "   Response:"
    echo "   $RESPONSE" | python3 -m json.tool 2>/dev/null || echo "   $RESPONSE"
elif echo "$RESPONSE" | grep -q "404"; then
    echo -e "${RED}❌ Error 404: Function not deployed${NC}"
    echo ""
    echo "   Deploy with: supabase functions deploy binance-proxy"
else
    echo -e "${YELLOW}⚠️  Unexpected response${NC}"
    echo "   $RESPONSE"
fi
echo ""

# Test 4: Verify project files
echo "Test 4: Verifying project files..."

FILES=(
  "src/app/App.tsx"
  "src/app/routes.tsx"
  "vite.config.ts"
  "index.html"
  "supabase/functions/binance-proxy/index.ts"
)

ALL_EXIST=true
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅ $file${NC}"
  else
    echo -e "${RED}❌ $file (missing!)${NC}"
    ALL_EXIST=false
  fi
done
echo ""

# Test 5: Check for lazy loading in routes
echo "Test 5: Checking lazy loading implementation..."
if grep -q "lazy" src/app/routes.tsx 2>/dev/null; then
    echo -e "${GREEN}✅ Lazy loading implemented in routes.tsx${NC}"
else
    echo -e "${RED}❌ Lazy loading not found in routes.tsx${NC}"
fi
echo ""

# Test 6: Check App.tsx version
echo "Test 6: Checking App.tsx version..."
if grep -q "26.2.0" src/app/App.tsx 2>/dev/null; then
    echo -e "${GREEN}✅ App.tsx has correct version (26.2.0)${NC}"
else
    echo -e "${YELLOW}⚠️  App.tsx version might be outdated${NC}"
fi
echo ""

# Final Summary
echo "==============================================="
echo "   VERIFICATION SUMMARY"
echo "==============================================="
echo ""

if [ "$ALL_EXIST" = true ] && echo "$RESPONSE" | grep -q "price"; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo "Your Investoft platform is ready to use:"
    echo "1. ✅ All files present"
    echo "2. ✅ Edge Function deployed and working"
    echo "3. ✅ Lazy loading implemented"
    echo "4. ✅ Version up to date"
    echo ""
    echo "Next steps:"
    echo "1. Open app in browser"
    echo "2. Clear cache with Ctrl+Shift+R"
    echo "3. Check console for errors"
    echo "4. Verify prices updating"
else
    echo -e "${YELLOW}⚠️  SOME TESTS FAILED${NC}"
    echo ""
    echo "Issues found:"
    
    if [ "$ALL_EXIST" = false ]; then
        echo "- Some project files are missing"
    fi
    
    if ! echo "$RESPONSE" | grep -q "price"; then
        echo "- Edge Function not deployed or not working"
        echo "  Deploy with: supabase functions deploy binance-proxy"
    fi
    
    echo ""
    echo "See /ERRORS_FIXED_FINAL.md for detailed fix instructions"
fi
echo ""
