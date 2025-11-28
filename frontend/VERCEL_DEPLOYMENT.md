# Sharirasutra Frontend - Vercel Deployment Guide

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Backend deployed at: `https://sharirasutra.onrender.com`

## 🚀 Deployment Steps

### 1. Push Your Code to GitHub

Make sure all your latest changes are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "Prepare frontend for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended for first-time)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `huih77422-ai/sharirasutra`
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `dist` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)

5. **Add Environment Variable**:
   - Click on "Environment Variables"
   - Add the following:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://sharirasutra.onrender.com`
     - **Environment**: Production (and Preview if you want)

6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? sharirasutra (or your preferred name)
# - In which directory is your code located? ./
# - Want to override settings? Yes
#   - Build Command: npm run build
#   - Output Directory: dist
#   - Development Command: npm run dev

# Add environment variable
vercel env add VITE_API_URL production
# When prompted, enter: https://sharirasutra.onrender.com

# Deploy to production
vercel --prod
```

### 3. Verify Deployment

Once deployed, Vercel will provide you with a URL (e.g., `https://sharirasutra.vercel.app`).

1. Open the URL in your browser
2. Test the following:
   - Gallery page loads
   - Images are fetched from backend
   - Upload functionality works
   - Tag filtering works
   - Story generation works

## 🔧 Configuration Files

The following files have been configured for Vercel deployment:

- **`vercel.json`**: Handles client-side routing for React Router
- **`src/config/api.js`**: Centralized API configuration
- **`.env.example`**: Example environment variables
- **`.gitignore`**: Updated to exclude `.env` files

## 🌍 Environment Variables

### Production (Vercel)
Set in Vercel dashboard or via CLI:
- `VITE_API_URL=https://sharirasutra.onrender.com`

### Local Development
Create a `.env.local` file in the `frontend` directory:
```env
VITE_API_URL=http://127.0.0.1:5007
```

Or leave it unset to use the default localhost URL.

## 🔄 Updating Your Deployment

### Automatic Deployments
Vercel automatically deploys when you push to your main branch:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

### Manual Deployments
```bash
cd frontend
vercel --prod
```

## 🐛 Troubleshooting

### Issue: API calls failing
- **Check**: Ensure `VITE_API_URL` is set correctly in Vercel environment variables
- **Check**: Backend CORS settings allow requests from your Vercel domain
- **Fix**: Add your Vercel URL to backend CORS allowed origins

### Issue: 404 on page refresh
- **Check**: Ensure `vercel.json` exists with the rewrite rules
- **Fix**: The `vercel.json` file should handle all routes by redirecting to `index.html`

### Issue: Environment variables not working
- **Check**: Environment variables in Vite must be prefixed with `VITE_`
- **Check**: Redeploy after adding/changing environment variables
- **Fix**: Go to Vercel dashboard → Your Project → Settings → Environment Variables

## 📝 Custom Domain (Optional)

To use a custom domain:

1. Go to your Vercel project dashboard
2. Click on "Settings" → "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## 🔐 Backend CORS Configuration

Make sure your backend (Render) allows requests from your Vercel domain. Update your backend CORS settings to include:

```python
# In your backend Flask/FastAPI app
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Local development
    "http://127.0.0.1:5173",  # Local development
    "https://sharirasutra.vercel.app",  # Your Vercel domain
    "https://*.vercel.app",  # All Vercel preview deployments
]
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and linked to repository
- [ ] Root directory set to `frontend`
- [ ] Environment variable `VITE_API_URL` added
- [ ] Deployment successful
- [ ] Application loads correctly
- [ ] API calls working
- [ ] Backend CORS configured for Vercel domain
- [ ] All features tested in production

---

**Need help?** Check the Vercel deployment logs in your project dashboard for detailed error messages.
