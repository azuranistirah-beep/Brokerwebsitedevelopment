#!/bin/bash

# Quick script to create test member using curl
# Usage: bash quick-create-member.sh

PROJECT_ID="ourtzdfyqpytfojlquff"
API_URL="https://${PROJECT_ID}.supabase.co/functions/v1/make-server-20da1dab/create-test-member"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Creating Test Member Account"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📧 Email: azuranistirah@gmail.com"
echo "🔑 Password: Sundala99!"
echo "👤 Name: Azura Nistirah"
echo "💰 Initial Balance: $0"
echo ""
echo "⏳ Sending request to backend..."
echo ""

# Make the request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "azuranistirah@gmail.com",
    "password": "Sundala99!",
    "name": "Azura Nistirah",
    "initial_balance": 0
  }')

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

# Extract response body (all lines except last)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📡 Response Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ SUCCESS! Account created successfully!"
  echo ""
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 Account is ready!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📝 Login Credentials:"
  echo "   Email: azuranistirah@gmail.com"
  echo "   Password: Sundala99!"
  echo ""
  echo "🚀 Next Steps:"
  echo "   1. Open: http://localhost:5173/"
  echo "   2. Click 'Sign In'"
  echo "   3. Enter credentials above"
  echo "   4. You'll be redirected to /member dashboard"
  echo ""
else
  echo "❌ ERROR: Failed to create account"
  echo ""
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  echo "💡 Possible reasons:"
  echo "   • User already exists (use different email)"
  echo "   • Backend server is not running"
  echo "   • Invalid project ID or endpoint"
  echo ""
  exit 1
fi
