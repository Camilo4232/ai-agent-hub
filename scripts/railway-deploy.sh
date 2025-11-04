#!/bin/bash

# Railway Deployment Script for AI Agent Hub
# Usage: ./scripts/railway-deploy.sh

set -e

echo "🚂 AI Agent Hub - Railway Deployment Script"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found!${NC}"
    echo ""
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
    echo -e "${GREEN}✅ Railway CLI installed${NC}"
fi

# Check if logged in to Railway
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo "Please login..."
    railway login
else
    echo -e "${GREEN}✅ Authenticated with Railway${NC}"
fi

# Check if project is initialized
echo ""
echo "📦 Checking project initialization..."
if [ ! -f ".railway" ] && [ ! -d ".railway" ]; then
    echo -e "${YELLOW}⚠️  Project not initialized${NC}"
    echo "Initializing Railway project..."
    railway init
else
    echo -e "${GREEN}✅ Project initialized${NC}"
fi

# Display current configuration
echo ""
echo "📋 Current Configuration:"
echo "========================"
echo "Project: $(railway status 2>/dev/null || echo 'Not set')"
echo ""

# Ask for confirmation
echo -e "${YELLOW}⚠️  This will deploy to Railway using current configuration${NC}"
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Check environment variables
echo ""
echo "🔍 Checking environment variables..."
REQUIRED_VARS=(
    "NODE_ENV"
    "RPC_URL"
    "PRIVATE_KEY"
    "AGENT_REGISTRY_ADDRESS"
    "PAYMENT_PROCESSOR_ADDRESS"
    "USDC_ADDRESS"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if ! railway variables get "$var" &> /dev/null; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please set them using:"
    echo "  railway variables set VARIABLE_NAME=value"
    echo ""
    echo "Or import from .env file:"
    echo "  railway variables set --from-env-file .env"
    exit 1
else
    echo -e "${GREEN}✅ All required variables set${NC}"
fi

# Run build locally to check for errors
echo ""
echo "🔨 Testing build locally..."
if npm install; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Please fix errors before deploying"
    exit 1
fi

# Deploy to Railway
echo ""
echo "🚀 Deploying to Railway..."
railway up

# Wait for deployment
echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 10

# Get deployment URL
echo ""
echo "🌐 Getting deployment URL..."
RAILWAY_URL=$(railway domain 2>/dev/null || echo "")

if [ -n "$RAILWAY_URL" ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "🎉 Your application is live at:"
    echo "   $RAILWAY_URL"
    echo ""
    echo "📊 Health check:"
    echo "   curl $RAILWAY_URL/health"
    echo ""
    echo "🌐 Frontend:"
    echo "   $RAILWAY_URL/"
    echo ""
    echo "📈 View logs:"
    echo "   railway logs"
else
    echo -e "${YELLOW}⚠️  Could not get deployment URL${NC}"
    echo "View your deployment at: https://railway.app/dashboard"
fi

echo ""
echo "✨ Deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Test health endpoint: railway run curl http://localhost:3000/health"
echo "  2. View logs: railway logs"
echo "  3. Monitor deployment: railway status"
echo ""
