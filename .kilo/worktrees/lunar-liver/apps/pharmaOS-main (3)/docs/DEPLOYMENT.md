# Deployment Guide: Render & Netlify

This guide covers deploying PharmaOS with the backend on Render and the frontend on Netlify.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step 1: Deploy Backend on Render](#step-1-deploy-backend-on-render)
- [Step 2: Deploy Frontend on Netlify](#step-2-deploy-frontend-on-netlify)
- [Step 3: Connect Frontend to Backend](#step-3-connect-frontend-to-backend)
- [Step 4: Verify Deployment](#step-4-verify-deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Architecture
```
Frontend (Netlify)  →  Backend API (Render)  →  Database (Render PostgreSQL)
   https://               https://                  PostgreSQL
```

### Deployment Strategy
This is a **monorepo** deployment where:
- **Backend** (`/backend`) deploys to Render as a web service
- **Frontend** (`/frontend`) deploys to Netlify as a static site
- Both services are deployed independently from the same codebase

---

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
4. **Database**: Render provides PostgreSQL databases (or use external provider)

---

## Step 1: Deploy Backend on Render

### 1.1 Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select the branch you want to deploy (e.g., `main` or `deploy/render-vercel`)

### 1.2 Configure Web Service
Fill in the following settings:

**Basic Settings:**
- **Name**: `pharmaos-backend`
- **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch**: `main` or your deployment branch
- **Root Directory**: Leave blank (we use `cd backend` in commands)

**Build & Start:**
- **Build Command**: `cd backend && npm install && npx prisma generate`
- **Start Command**: `cd backend && chmod +x start.sh && bash start.sh`

**Instance Type:**
- **Plan**: Starter (free tier available) or higher

### 1.3 Environment Variables
Add these environment variables in Render dashboard:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `DATABASE_URL` | `postgresql://...` | **Get from Render PostgreSQL database** |
| `PORT` | `3000` | Render will set this automatically |
| `CLIENT_URL` | `https://your-app.vercel.app` | Update after frontend deployment |
| `JWT_SECRET` | `<random-string>` | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `LOW_STOCK_THRESHOLD` | `10` | Optional |
| `NEAR_EXPIRY_DAYS` | `7` | Optional |

**To get DATABASE_URL:**
1. In Render dashboard, create a new PostgreSQL database
2. Copy the connection string
3. Paste it as the `DATABASE_URL` environment variable

### 1.4 Deploy
Click **Create Web Service** and wait for deployment to complete.

**Verify:**
- Visit `https://pharmaos-backend.onrender.com/health`
- You should see: `{"status":"ok","timestamp":"..."}`

---

## Step 2: Deploy Frontend on Netlify

### 2.1 Import Project
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **Add new site** → **Import an existing project**
3. Connect your GitHub account
4. Select your repository: `pharmaOS`
5. Select the branch: `main`

### 2.2 Configure Build Settings
Netlify should auto-detect from `frontend/netlify.toml`. Verify these settings:

**Base directory**: `frontend`

**Build command**: `npm run build`

**Publish directory**: `frontend/dist`

### 2.3 Environment Variables
Add this environment variable in Netlify:

Go to **Site configuration** → **Environment variables** → **Add a variable**:

| Key | Value | Notes |
|----------|-------|-------|
| `VITE_API_URL` | `https://pharmaos-backend.onrender.com/api` | **Update with your actual Render URL** |

### 2.4 Deploy
Click **Deploy site** and wait for the build to complete.

**Verify:**
- Visit your Netlify URL (e.g., `https://your-app.netlify.app`)
- You should see the PharmaOS login page

---

## Step 3: Connect Frontend to Backend

### 3.1 Update Backend CORS
After frontend deployment, update the `CLIENT_URL` environment variable on Render:

1. Go to Render Dashboard → Your backend service → **Environment**
2. Update `CLIENT_URL` to your Netlify URL: `https://your-app.netlify.app`
3. Click **Save Changes** (this will trigger a redeployment)

### 3.2 Verify API Connection
1. Open browser console on your Netlify site
2. Try logging in
3. Check Network tab for API calls to your Render backend

---

## Step 4: Verify Deployment

### Backend Checks
- [ ] Health endpoint responds: `https://your-backend.onrender.com/health`
- [ ] API endpoints require authentication
- [ ] Database migrations ran successfully
- [ ] CORS allows requests from your Vercel domain

### Frontend Checks
- [ ] Site loads on Netlify
- [ ] Can navigate to all pages
- [ ] Login/registration works
- [ ] API calls succeed (check browser console)
- [ ] Static assets load properly

### Database Checks
- [ ] Database is accessible
- [ ] Tables exist (Prisma migrations ran)
- [ ] Can create/read data through the app

---

## Troubleshooting

### Backend Issues

**Problem**: 500 error on health check
- **Solution**: Check Render logs for database connection errors
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL database is created and running

**Problem**: CORS errors in browser console
- **Solution**: Update `CLIENT_URL` environment variable on Render to match your Vercel URL exactly (include `https://`)

**Problem**: Prisma migration errors
- **Solution**: Check Render logs. You may need to manually run migrations:
  ```bash
  # In Render shell or locally with production DATABASE_URL
  cd backend && npx prisma migrate deploy
  ```

**Problem**: JWT authentication errors
- **Solution**: Ensure `JWT_SECRET` is set in Render environment variables

### Frontend Issues

**Problem**: Build fails on Netlify
- **Solution**: Check Netlify build logs
- Ensure Base directory is set to `frontend`
- Verify all dependencies are in `frontend/package.json`

**Problem**: API calls fail with 404
- **Solution**: Verify `VITE_API_URL` environment variable on Netlify points to your Render backend
- Should be: `https://your-backend.onrender.com/api` (NOT just the domain)

**Problem**: Blank page after deployment
- **Solution**: Check browser console for errors
- Verify `VITE_API_URL` is set correctly before building

### Database Issues

**Problem**: Database connection timeout
- **Solution**: Render free-tier databases may sleep. Check Render database dashboard
- Consider upgrading to paid tier for production

**Problem**: Schema mismatch after updates
- **Solution**: Run migrations:
  ```bash
  cd backend && npx prisma migrate deploy
  ```

---

## Post-Deployment Checklist

- [ ] SSL certificates active (both Render & Netlify provide HTTPS automatically)
- [ ] Environment variables secured (no secrets in code)
- [ ] Database backups configured (Render provides automatic backups on paid plans)
- [ ] Monitoring set up (Render & Netlify both provide logs)
- [ ] Custom domain configured (optional, in both Render & Netlify settings)

---

## Updating Your Deployment

### Deploy New Changes

**Backend (Render)**:
1. Push changes to your deployment branch
2. Render will auto-deploy (if auto-deploy is enabled)
3. Or manually trigger deploy from Render dashboard

**Frontend (Netlify)**:
1. Push changes to your deployment branch
2. Netlify will auto-deploy
3. Or manually trigger deploy from Netlify dashboard

**Important**: If you change the database schema:
- Backend will automatically run `prisma db push --accept-data-loss` on startup
- This is configured in `backend/start.sh`
- The database schema will sync with your Prisma schema on every deployment

---

## Costs Estimate

**Render (Backend)**:
- Web Service (Starter): Free tier available, ~$7/month for basic
- PostgreSQL Database: Free tier available (90 days), ~$7/month after
- **Total**: ~$14/month minimum for production

**Netlify (Frontend)**:
- Team Plan: Free
- Pro Plan: $19/month (optional, for team features)
- **Total**: Free for most use cases

**Estimated Total**: $14-34/month depending on Render plan

---

## Support

For issues not covered here:
- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com
- Prisma Docs: https://www.prisma.io/docs

---

## Quick Reference

### Render Backend URL
```
https://pharmaos-backend.onrender.com
```

### Netlify Frontend URL
```
https://your-app.netlify.app
```

### Key Environment Variables
```
Backend (Render):
  DATABASE_URL - PostgreSQL connection string
  CLIENT_URL - Vercel frontend URL
  JWT_SECRET - Secret key for JWT tokens
  NODE_ENV - production

Frontend (Vercel):
  VITE_API_URL - Backend API URL + /api
```
