#!/bin/bash

# 🚀 Investoft Edge Functions Auto-Deploy Script
# This script automates the deployment of Supabase Edge Functions

echo "=================================================="
echo "🚀 Investoft Edge Functions Deployment"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Supabase CLI is installed
echo "Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI not found!"
    print_info "Installing Supabase CLI globally..."
    npm install -g supabase
    if [ $? -eq 0 ]; then
        print_success "Supabase CLI installed successfully!"
    else
        print_error "Failed to install Supabase CLI. Please install manually."
        exit 1
    fi
else
    print_success "Supabase CLI is already installed"
    supabase --version
fi

echo ""
echo "=================================================="
echo "Step 1: Authentication"
echo "=================================================="

# Check if already logged in
if supabase projects list &> /dev/null; then
    print_success "Already logged in to Supabase"
else
    print_warning "Not logged in. Starting authentication..."
    print_info "Browser will open for authentication..."
    supabase login
    
    if [ $? -eq 0 ]; then
        print_success "Login successful!"
    else
        print_error "Login failed. Please try again manually."
        exit 1
    fi
fi

echo ""
echo "=================================================="
echo "Step 2: Project Linking"
echo "=================================================="

# Check if project is already linked
if [ -f ".supabase/config.toml" ]; then
    print_warning "Project appears to be linked already"
    read -p "Do you want to re-link? (y/n): " relink
    if [ "$relink" != "y" ]; then
        print_info "Skipping project linking..."
    else
        echo ""
        print_info "Please enter your Supabase Project Reference ID:"
        print_info "(Find it at: https://app.supabase.com/project/_/settings/general)"
        read -p "Project Ref: " project_ref
        
        if [ -z "$project_ref" ]; then
            print_error "Project reference cannot be empty!"
            exit 1
        fi
        
        supabase link --project-ref $project_ref
        
        if [ $? -eq 0 ]; then
            print_success "Project linked successfully!"
        else
            print_error "Failed to link project. Please check your project reference."
            exit 1
        fi
    fi
else
    echo ""
    print_info "Please enter your Supabase Project Reference ID:"
    print_info "(Find it at: https://app.supabase.com/project/_/settings/general)"
    read -p "Project Ref: " project_ref
    
    if [ -z "$project_ref" ]; then
        print_error "Project reference cannot be empty!"
        exit 1
    fi
    
    supabase link --project-ref $project_ref
    
    if [ $? -eq 0 ]; then
        print_success "Project linked successfully!"
    else
        print_error "Failed to link project. Please check your project reference."
        exit 1
    fi
fi

echo ""
echo "=================================================="
echo "Step 3: Environment Secrets"
echo "=================================================="

print_info "Checking if secrets are already set..."
supabase secrets list

echo ""
read -p "Do you want to set/update environment secrets? (y/n): " set_secrets

if [ "$set_secrets" == "y" ]; then
    echo ""
    print_info "Enter your Supabase credentials (press Enter to skip):"
    
    read -p "SUPABASE_URL: " supabase_url
    if [ ! -z "$supabase_url" ]; then
        supabase secrets set SUPABASE_URL="$supabase_url"
    fi
    
    read -p "SUPABASE_ANON_KEY: " supabase_anon_key
    if [ ! -z "$supabase_anon_key" ]; then
        supabase secrets set SUPABASE_ANON_KEY="$supabase_anon_key"
    fi
    
    read -sp "SUPABASE_SERVICE_ROLE_KEY: " supabase_service_key
    echo ""
    if [ ! -z "$supabase_service_key" ]; then
        supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$supabase_service_key"
    fi
    
    read -p "NEWS_API_KEY (optional): " news_api_key
    if [ ! -z "$news_api_key" ]; then
        supabase secrets set NEWS_API_KEY="$news_api_key"
    fi
    
    print_success "Secrets updated!"
else
    print_info "Skipping secrets setup..."
fi

echo ""
echo "=================================================="
echo "Step 4: Deployment"
echo "=================================================="

print_info "Deploying Edge Function: make-server..."
echo ""

supabase functions deploy make-server --no-verify-jwt

if [ $? -eq 0 ]; then
    print_success "Deployment successful! 🎉"
    echo ""
    print_info "Your Edge Function is now live!"
    print_info "View logs with: supabase functions logs make-server"
else
    print_error "Deployment failed!"
    echo ""
    print_warning "Common solutions:"
    echo "1. Try using access token:"
    echo "   - Generate at: https://app.supabase.com/account/tokens"
    echo "   - Set: export SUPABASE_ACCESS_TOKEN=your_token"
    echo "   - Run this script again"
    echo ""
    echo "2. Check organization permissions"
    echo "3. Verify project reference ID"
    echo ""
    print_info "For detailed troubleshooting, see: EDGE_FUNCTIONS_DEPLOYMENT_FIX.md"
    exit 1
fi

echo ""
echo "=================================================="
echo "Step 5: Testing"
echo "=================================================="

print_info "Getting function URL..."
supabase functions list

echo ""
print_success "Deployment Complete!"
print_info "Next steps:"
echo "  1. Test your function endpoint"
echo "  2. Check logs: supabase functions logs make-server"
echo "  3. Update frontend API URLs if needed"
echo ""
echo "=================================================="
