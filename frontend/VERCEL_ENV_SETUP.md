# Setting Up Environment Variables in Vercel

## Problem
Your Vercel frontend can't connect to the Render backend because the `VITE_API_URL` environment variable is not set.

## Solution

### Step 1: Go to Vercel Dashboard
1. Open your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (sharirasutra frontend)

### Step 2: Add Environment Variable
1. Click on **Settings** tab
2. Click on **Environment Variables** in the left sidebar
3. Add a new environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://sharirasutra.onrender.com`
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**

### Step 3: Redeploy
After adding the environment variable, you need to trigger a new deployment:

**Option A: Redeploy from Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**

**Option B: Push a new commit**
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push origin main
```

## Verification
After redeployment, your frontend should be able to connect to the backend at `https://sharirasutra.onrender.com`.

You can verify by:
1. Opening browser DevTools (F12)
2. Going to the Network tab
3. Checking if API requests are going to the correct URL
4. Checking for any CORS errors in the Console tab

## Important Notes
- Vite environment variables MUST start with `VITE_` prefix
- Changes to environment variables require a new deployment to take effect
- The `.env.example` file is just a template - it doesn't affect production deployments
