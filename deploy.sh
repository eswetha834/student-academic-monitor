#!/bin/bash

echo "🚀 Academic Monitor Deployment Script"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "client" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build frontend
echo "📦 Building frontend..."
cd client
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend build completed"

# Deploy based on argument
if [ "$1" = "vercel" ]; then
    echo "🌐 Deploying to Vercel..."
    vercel --prod
elif [ "$1" = "netlify" ]; then
    echo "🌐 Deploying to Netlify..."
    netlify deploy --prod --dir=build
elif [ "$1" = "railway" ]; then
    echo "🚂 Deploying to Railway..."
    cd ..
    railway up
elif [ "$1" = "heroku" ]; then
    echo "🔧 Deploying to Heroku..."
    cd ..
    git add .
    git commit -m "Production deploy - $(date)"
    git push heroku main
else
    echo "❌ Please specify deployment platform: vercel, netlify, railway, or heroku"
    echo "Usage: ./deploy.sh [platform]"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo "🎉 Deployment completed successfully!"
    echo "📊 Don't forget to:"
    echo "   1. Update your frontend API URL in production"
    echo "   2. Set environment variables on your hosting platform"
    echo "   3. Test all functionality"
    echo "   4. Monitor your deployment"
else
    echo "❌ Deployment failed"
    exit 1
fi
