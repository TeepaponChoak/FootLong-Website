# FootLong Blog - Deployment Guide

This guide explains how to deploy the FootLong Blog application with a backend server to run 24/7 on free cloud services.

## Architecture Overview

- **Frontend**: React + Vite (TypeScript)
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT tokens
- **Database**: MongoDB Atlas (free tier)

## Prerequisites

1. Node.js 18+ installed
2. GitHub account
3. MongoDB Atlas account (free)
4. Render.com or Railway.app account (for free hosting)

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (free tier M0)
3. Create a database user with read/write permissions
4. Whitelist IP: `0.0.0.0/0` (allow access from anywhere)
5. Get the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`)

## Step 2: Configure Backend Server

### Update server/.env

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_secure_random_secret_key_here
CLIENT_URL=https://your-frontend-url.onrender.com
```

### Install Dependencies

```bash
cd server
npm install
```

### Test Locally

```bash
npm start
```

## Step 3: Deploy Backend to Render.com

1. Push your code to GitHub
2. Go to [Render.com](https://render.com) and sign up
3. Create a new **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: footlong-blog-api
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**: Add all variables from `.env`

6. Deploy! Render will give you a URL like: `https://footlong-blog-api.onrender.com`

## Step 4: Configure Frontend

### Update src/api.ts

Change the API URL to point to your deployed backend:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://footlong-blog-api.onrender.com";
```

Or create a `.env` file in the frontend root:

```env
VITE_API_URL=https://footlong-blog-api.onrender.com
```

### Build Frontend

```bash
npm run build
```

## Step 5: Deploy Frontend

### Option A: Render.com (Same as Backend)

1. In the same Render service, add a **Static Site** 
2. Connect your GitHub repository
3. Configure:
   - **Name**: footlong-blog
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

### Option B: Vercel (Recommended for Frontend)

1. Go to [Vercel](https://vercel.com) and sign up
2. Import your GitHub repository
3. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Add `VITE_API_URL`

4. Deploy!

### Option C: Netlify

1. Go to [Netlify](https://netlify.com) and sign up
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**: Add `VITE_API_URL`

## Step 6: Update CORS Settings

Make sure your backend's CORS settings allow your frontend URL:

In `server/index.js`, update the CORS configuration:

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
```

## Environment Variables Summary

### Backend (.env)
```
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/footlong
JWT_SECRET=your-256-bit-secret-key
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com
```

## Testing the Deployment

1. Visit your frontend URL
2. Try registering a new account
3. Create a blog post
4. Verify the post appears in the list
5. Try logging out and back in

## Troubleshooting

### Backend Issues

- **MongoDB Connection Error**: Check your connection string and whitelist IP
- **CORS Error**: Ensure CLIENT_URL matches your frontend URL exactly
- **Port Issues**: Render assigns ports automatically, use `process.env.PORT`

### Frontend Issues

- **API Connection Error**: Check VITE_API_URL is correct
- **Build Errors**: Ensure all TypeScript errors are fixed

## Free Tier Limitations

- **MongoDB Atlas**: 512MB storage, shared RAM
- **Render.com**: 750 hours/month free (web service may sleep after inactivity)
- **Vercel**: 100GB bandwidth/month, serverless functions

## Alternative: Railway.app

Railway offers a simpler deployment process:

1. Connect GitHub repository
2. Deploy with one click
3. Add MongoDB from Railway's marketplace
4. Environment variables are auto-configured

## Maintenance

- Monitor your MongoDB storage usage
- Check Render/Railway dashboard for any issues
- Keep dependencies updated

## Support

For issues, check:
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Vercel Documentation](https://vercel.com/docs)