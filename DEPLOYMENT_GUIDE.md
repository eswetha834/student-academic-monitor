# 🚀 Academic Monitor - Deployment Guide

This guide covers multiple deployment options for your Academic Performance Monitoring System.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
  - [Option 1: Vercel (Recommended for Frontend)](#option-1-vercel-recommended-for-frontend)
  - [Option 2: Netlify (Alternative Frontend)](#option-2-netlify-alternative-frontend)
  - [Option 3: Railway (Full Stack)](#option-3-railway-full-stack)
  - [Option 4: Heroku (Full Stack)](#option-4-heroku-full-stack)
  - [Option 5: AWS/Google Cloud (Production)](#option-5-awsgoogle-cloud-production)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Production Checklist](#production-checklist)

## 🎯 Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account (for cloud database)
- Git repository (GitHub/GitLab)
- Domain name (optional, for custom URLs)

## ⚙️ Environment Setup

### 1. Prepare Frontend for Production

```bash
cd client
npm install
npm run build
```

### 2. Update API URLs

In `client/src/App.js` or wherever your API base URL is defined:

```javascript
// Change from localhost to your deployed backend URL
const apiBase = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.herokuapp.com' 
  : 'http://localhost:5000';
```

### 3. Create Production Environment Files

Create `.env.production` in client folder:
```
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
REACT_APP_MONGO_URL=your_mongodb_atlas_connection_string
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Frontend)

**Pros:** Easy setup, automatic deployments, free tier, great performance
**Best for:** Frontend deployment

#### Steps:
1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from client folder**
```bash
cd client
vercel --prod
```

4. **Configure vercel.json** (create in client folder):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Option 2: Netlify (Alternative Frontend)

**Pros:** Drag-and-drop deployment, free SSL, form handling
**Best for:** Quick frontend deployment

#### Steps:
1. **Build the frontend**
```bash
cd client
npm run build
```

2. **Deploy via drag-and-drop**
   - Go to netlify.com
   - Drag the `build` folder to the deploy area
   - Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build
```

### Option 3: Railway (Full Stack)

**Pros:** Deploy both frontend and backend together, free tier
**Best for:** Full stack deployment

#### Steps:
1. **Create railway.json** in root:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm install && npm start",
    "healthcheckPath": "/api/health"
  }
}
```

2. **Create Procfile** in root:
```
web: cd server && npm start
```

3. **Deploy via Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option 4: Heroku (Full Stack)

**Pros:** Reliable, good documentation, add-ons
**Best for:** Traditional deployment

#### Steps:
1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Create Heroku app**
```bash
heroku create your-app-name
```

3. **Add buildpacks**
```bash
heroku buildpacks:add heroku/nodejs
```

4. **Set environment variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URL=your_mongodb_atlas_url
heroku config:set JWT_SECRET=your_jwt_secret
```

5. **Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Option 5: AWS/Google Cloud (Production)

**Pros:** Scalable, enterprise features, full control
**Best for:** Large-scale production

#### AWS Setup:
1. **Use AWS Amplify** for frontend
2. **Use AWS EC2** or **Elastic Beanstalk** for backend
3. **Use MongoDB Atlas** for database

#### Google Cloud Setup:
1. **Use Firebase Hosting** for frontend
2. **Use Cloud Run** for backend
3. **Use MongoDB Atlas** for database

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Atlas Account**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create free cluster

2. **Configure Network Access**
   - Add IP: `0.0.0.0/0` (for cloud deployment)
   - Or specific server IPs

3. **Create Database User**
   - Username: `admin` (or your choice)
   - Password: Generate strong password
   - Permissions: Read and Write

4. **Get Connection String**
   - Go to Cluster → Connect → Connect your application
   - Copy the connection string

### Environment Variables for Database

```bash
# MongoDB Atlas
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/academic_monitor?retryWrites=true&w=majority

# Local MongoDB (alternative)
MONGO_URL=mongodb://localhost:27017/academic_monitor
```

---

## 🔧 Environment Variables

### Backend (.env)
```bash
# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/academic_monitor

# Server
PORT=5000
NODE_ENV=production

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Firebase (if using)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Email (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
REACT_APP_ENV=production
```

---

## ✅ Production Checklist

### Security
- [ ] Change all default passwords
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Set up environment variables
- [ ] Remove console.log statements

### Performance
- [ ] Optimize images and assets
- [ ] Enable gzip compression
- [ ] Set up caching headers
- [ ] Monitor bundle size
- [ ] Test load times

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up logging
- [ ] Monitor database performance

### Backup
- [ ] Set up database backups
- [ ] Back up environment variables
- [ ] Document recovery process

---

## 🚀 Quick Deploy Script

Create `deploy.sh` in root:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Build frontend
echo "📦 Building frontend..."
cd client
npm run build

# Deploy to Vercel (if using Vercel)
echo "🌐 Deploying to Vercel..."
vercel --prod

# Deploy backend to Heroku (if using Heroku)
echo "🔧 Deploying backend..."
cd ..
git add .
git commit -m "Production deploy"
git push heroku main

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

---

## 📞 Support

If you encounter issues during deployment:

1. Check logs: `heroku logs --tail` (for Heroku)
2. Verify environment variables
3. Check CORS settings
4. Ensure MongoDB is accessible
5. Test API endpoints individually

---

## 🔄 CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy Frontend
      run: |
        cd client
        npm install
        npm run build
        vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
    
    - name: Deploy Backend
      run: |
        git subtree push --prefix server heroku main
```

---

## 📈 Post-Deployment

1. **Test all user flows**
2. **Monitor performance**
3. **Set up analytics**
4. **Configure SSL certificates**
5. **Set up domain names**
6. **Test mobile responsiveness**
7. **Verify all API endpoints**

Your Academic Monitor is now live! 🎉
