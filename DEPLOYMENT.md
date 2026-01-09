# Deployment Guide - Weather Dashboard Application

Complete guide for deploying the Weather Dashboard to production using **Render** (backend), **Neon.tech** (PostgreSQL), and **Vercel** (frontend).

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup (Neon.tech)](#1-database-setup-neontech)
3. [Backend Deployment (Render)](#2-backend-deployment-render)
4. [Frontend Deployment (Vercel)](#3-frontend-deployment-vercel)
5. [Post-Deployment](#4-post-deployment)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account with your code pushed to a repository
- ✅ [Neon.tech](https://neon.tech) account (free tier available)
- ✅ [Render](https://render.com) account (free tier available)
- ✅ [Vercel](https://vercel.com) account (free tier available)
- ✅ OpenWeatherMap API key
- ✅ Email service credentials (Gmail, SendGrid, etc.)

---

## 1. Database Setup (Neon.tech)

### Step 1.1: Create Neon Database

1. **Sign up/Login** to [Neon.tech](https://neon.tech)

2. **Create a New Project**
   - Click "Create Project"
   - Name: `weatherapp-db`
   - Region: Choose closest to your users (e.g., US East, EU West)
   - PostgreSQL version: Latest (16.x)
   - Click "Create Project"

3. **Get Connection String**
   - After creation, you'll see the connection string
   - Copy the **Connection String** (starts with `postgresql://`)
   - Format: `postgresql://username:password@hostname/database?sslmode=require`
   - **Save this securely** - you'll need it for Render

### Step 1.2: Initialize Database Schema

1. **Connect to Neon Console**
   - In Neon dashboard, click "SQL Editor"
   - Or use any PostgreSQL client with your connection string

2. **Run the Schema**
   - Copy content from `backend/src/config/schema.sql`
   - Paste into SQL Editor
   - Execute the script

3. **Verify Tables Created**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   Should show: `users`, `favorite_cities`, `refresh_tokens`, `otps`

### Step 1.3: Configure Connection Pooling

Neon provides connection pooling automatically. For backend connection:
- Use the **pooled connection string** (with `-pooler` in hostname)
- This is better for serverless/Node.js applications

---

## 2. Backend Deployment (Render)

### Step 2.1: Prepare Backend for Deployment

1. **Update `package.json`** (already configured)
   ```json
   {
     "scripts": {
       "build": "tsc",
       "start": "node dist/server.js"
     }
   }
   ```

2. **Ensure `.gitignore` is correct**
   - `.env` should NOT be committed
   - `node_modules/` excluded
   - `dist/` can be excluded (Render will build it)

### Step 2.2: Deploy to Render

1. **Sign up/Login** to [Render](https://render.com)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository
   - If monorepo, set **Root Directory**: `backend`

3. **Configure Build Settings**
   - **Name**: `weatherapp-backend`
   - **Region**: Choose same as Neon.tech database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or upgrade for production)

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable"
   
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<your-neon-connection-string>
   JWT_SECRET=<generate-strong-secret-key>
   JWT_REFRESH_SECRET=<generate-another-strong-secret>
   OPENWEATHER_API_KEY=<your-openweathermap-api-key>
   
   # CORS (will be your Vercel URL)
   CORS_ORIGIN=https://your-app.vercel.app
   
   # Email Configuration (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=<your-app-password>
   EMAIL_FROM=Weather Dashboard <your-email@gmail.com>
   
   # Logging
   LOG_LEVEL=info
   ```

   **Generate Strong Secrets:**
   ```bash
   # In terminal:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Wait for deployment to complete (~3-5 minutes)
   - Your backend will be available at: `https://weatherapp-backend.onrender.com`

### Step 2.3: Test Backend

1. **Check Health Endpoint**
   ```bash
   curl https://devroom-weatherapp.onrender.com/health
   ```
   Should return: `{"status": "OK", "message": "Weather Dashboard API is running"}`

2. **Test API Endpoints**
   ```bash
   # Test registration
   curl -X POST https://devroom-weatherapp.onrender.com/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","type":"registration","username":"testuser","password":"Test123456"}'
   ```

---

## 3. Frontend Deployment (Vercel)

### Step 3.1: Prepare Frontend

1. **Update Environment Variable**
   - Create/update `frontend/.env.production`
   ```env
   VITE_API_URL=https://devroom-weatherapp.onrender.com/api
   ```

2. **Verify Build Works Locally**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

### Step 3.2: Deploy to Vercel

1. **Sign up/Login** to [Vercel](https://vercel.com)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (if monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add variable:
     ```
     VITE_API_URL=https://devroom-weatherapp.onrender.com/api
     ```
   - Apply to: Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (~2 minutes)
   - Your app will be available at: `https://your-app.vercel.app`

### Step 3.3: Configure Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to your project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update CORS in Render**
   - Go back to Render dashboard
   - Update `CORS_ORIGIN` environment variable
   - Add your custom domain

---

## 4. Post-Deployment

### Step 4.1: Update CORS Origin

1. **Get Your Vercel URL**
   - Copy the deployment URL from Vercel dashboard

2. **Update Render Environment Variable**
   - Go to Render dashboard → Your service → Environment
   - Update `CORS_ORIGIN` to your Vercel URL
   - Example: `https://weatherapp-123abc.vercel.app`
   - Save changes (Render will automatically redeploy)

### Step 4.2: Test Full Application

1. **Open Frontend**
   - Visit your Vercel URL

2. **Test User Registration**
   - Register a new account
   - Verify OTP email received
   - Complete registration

3. **Test Weather Search**
   - Search for a city
   - Verify weather data loads

4. **Test Favorites**
   - Add cities to favorites
   - Remove from favorites
   - Verify persistence

### Step 4.3: Enable PWA

1. **Install Prompt**
   - Open your app on mobile browser
   - Look for "Add to Home Screen" prompt
   - Install and test offline functionality

2. **Test Offline Mode**
   - Search for cities while online
   - Turn off internet
   - Try viewing previously searched cities
   - Verify offline banner appears

---

## Environment Variables

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | Neon PostgreSQL connection | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | JWT signing secret | `<64-char-hex-string>` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `<64-char-hex-string>` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | `<your-api-key>` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://your-app.vercel.app` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_SECURE` | Use TLS | `false` |
| `EMAIL_USER` | Email account | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Email password/app password | `<app-password>` |
| `EMAIL_FROM` | From address | `Weather App <email@gmail.com>` |
| `LOG_LEVEL` | Logging level | `info` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://backend.onrender.com/api` |

---

## Troubleshooting

### Backend Issues

#### Build Fails
```bash
# Check TypeScript errors locally
cd backend
npm run build
```

#### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Ensure Neon database is active
- Check if IP allowlist is configured (Neon allows all by default)

#### CORS Errors
- Verify `CORS_ORIGIN` matches your frontend URL exactly
- Include protocol (`https://`)
- No trailing slash

#### Email Not Sending
- For Gmail: Use App Password, not regular password
- Enable "Less secure app access" (or use OAuth2)
- Check EMAIL_HOST and EMAIL_PORT settings

### Frontend Issues

#### API Calls Failing
- Check browser console for CORS errors
- Verify `VITE_API_URL` is correct
- Ensure backend is running on Render

#### PWA Not Installing
- Manifest must be served over HTTPS (Vercel does this)
- Check browser console for manifest errors
- Verify icons exist in `public/icons/`

#### Environment Variables Not Working
- Must start with `VITE_` for Vite
- Redeploy after adding variables
- Check build logs for variable replacement

### Database Issues

#### Tables Not Created
```sql
-- Verify schema in Neon SQL Editor:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

#### Connection Pool Exhausted
- Use Neon's pooled connection string
- Increase pool size in backend/src/config/database.ts

---

## Monitoring & Maintenance

### Render Monitoring
- Check service logs: Dashboard → Your Service → Logs
- Set up notifications: Settings → Notifications
- Monitor resource usage: Metrics tab

### Database Monitoring
- Neon dashboard shows connection count
- Monitor query performance
- Set up usage alerts

### Vercel Monitoring
- Check deployment logs
- Monitor build times
- Set up custom analytics

---

## Scaling Considerations

### Free Tier Limitations

**Render Free:**
- Sleeps after 15 min inactivity (30s cold start)
- 750 hours/month
- Upgrade to prevent sleep: $7/month

**Neon Free:**
- 0.5 GB storage
- 10 GB data transfer
- Upgrade for production: ~$19/month

**Vercel Free:**
- 100 GB bandwidth
- Unlimited sites
- Commercial use allowed

### Upgrade Path
1. **First**: Upgrade Render to prevent backend sleep
2. **Second**: Upgrade database if storage/connections limited
3. **Third**: Consider CDN for frontend assets

---

## Security Checklist

- [ ] All secrets are in environment variables (not committed)
- [ ] Strong JWT secrets generated (64+ characters)
- [ ] CORS properly configured
- [ ] HTTPS enforced (automatic with Render/Vercel)
- [ ] Rate limiting enabled (already in code)
- [ ] Database uses SSL (Neon enforces this)
- [ ] Email credentials secure (app passwords)
- [ ] Regular dependency updates

---

## Support & Resources

- **Neon Docs**: https://neon.tech/docs
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **OpenWeatherMap API**: https://openweathermap.org/api

---

## Quick Deploy Checklist

- [ ] Neon database created and schema loaded
- [ ] Render backend service created
- [ ] All backend environment variables configured
- [ ] Backend health check passes
- [ ] Vercel frontend deployed
- [ ] Frontend environment variable set
- [ ] CORS origin updated in Render
- [ ] Full user registration flow tested
- [ ] Weather search working
- [ ] Favorites persistence working
- [ ] PWA installation tested on mobile

**Congratulations! Your Weather Dashboard is now live! 🚀**
