#!/bin/bash

echo "🧪 Setting up local SSO testing environment..."

# Use local env file
cp .env.local .env

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migration locally (optional - test on a local DB)
echo "🗄️ Running migrations..."
echo "Skipping migration for local test - using existing database"

# Start the development server
echo "🚀 Starting development server..."
echo ""
echo "======================================"
echo "Local SSO Testing Instructions:"
echo "======================================"
echo ""
echo "1. The app will start at http://localhost:3000"
echo ""
echo "2. To test without real OAuth providers:"
echo "   - Click SSO buttons to see the flow"
echo "   - You'll get errors (expected) but can see the UI"
echo ""
echo "3. To test with real OAuth (recommended):"
echo "   a) Create test apps on Facebook/LinkedIn"
echo "   b) Set callback URLs to http://localhost:3000/api/auth/[provider]/callback"
echo "   c) Update .env.local with real test credentials"
echo ""
echo "4. Use ngrok for public URL testing:"
echo "   ngrok http 3000"
echo "   Then update APP_URL in .env to the ngrok URL"
echo ""
echo "======================================"
echo ""

# Start dev server
npm run dev