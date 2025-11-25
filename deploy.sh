#!/bin/bash

# SmartPipeX Vercel Deployment Script
# Run this script to deploy your application to Vercel

echo "🚀 Starting SmartPipeX deployment process..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Next.js project
if ! grep -q "next" package.json; then
    echo "❌ Error: This doesn't appear to be a Next.js project."
    exit 1
fi

echo "✅ Project validation passed"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

echo "✅ Dependencies ready"

# Run type check
echo "🔍 Running TypeScript type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Please fix them before deploying."
    exit 1
fi

echo "✅ TypeScript check passed"

# Run production build
echo "🔨 Running production build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

echo "✅ Production build successful"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing globally..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
echo "📝 Note: First deployment will require authentication and project setup"

vercel --prod

echo "🎉 Deployment process completed!"
echo ""
echo "📋 Post-deployment checklist:"
echo "  1. Verify dashboard loads correctly"
echo "  2. Test real-time data streaming"
echo "  3. Check PWA installation prompt"
echo "  4. Test offline functionality"
echo "  5. Validate API endpoints"
echo ""
echo "🔗 Your SmartPipeX application should now be live on Vercel!"
