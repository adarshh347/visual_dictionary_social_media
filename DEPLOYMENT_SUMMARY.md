# Frontend Vercel Deployment - Summary

## ✅ Changes Made

### 1. **Centralized API Configuration**
- Created `frontend/src/config/api.js`
- Exports `API_URL` that uses environment variable `VITE_API_URL`
- Falls back to `http://127.0.0.1:5007` for local development

### 2. **Updated All Frontend Files**
The following files now import API_URL from the centralized config:
- `src/pages/GalleryPage.jsx`
- `src/pages/TextFeedPage.jsx`
- `src/pages/HighlightsPage.jsx`
- `src/components/UploadForm.jsx`
- `src/components/UntaggedImagesSidebar.jsx`
- `src/components/TagFilter.jsx`
- `src/components/StoryFlow.jsx`
- `src/components/PostSuggestionPanel.jsx`
- `src/components/PostDetailPage.jsx`
- `src/components/BoundingBoxEditor.jsx`

### 3. **Vercel Configuration**
- Created `frontend/vercel.json` for client-side routing support
- Configured rewrites to handle React Router

### 4. **Environment Variables**
- Created `frontend/.env.example` with documentation
- Updated `frontend/.gitignore` to exclude `.env` and `.env.local`

### 5. **Documentation**
- Created `frontend/VERCEL_DEPLOYMENT.md` - Complete deployment guide
- Created `BACKEND_CORS_UPDATE.md` - Backend CORS configuration guide

## 📋 Next Steps

### Step 1: Commit and Push Changes
```bash
cd "c:\Users\Anti_Neutrino\Desktop\Adarsh\Cloned Repo\sharirasutra"
git add .
git commit -m "Prepare frontend for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Vercel Dashboard (Recommended)**
1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import repository: `huih77422-ai/sharirasutra`
4. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://sharirasutra.onrender.com`
6. Click "Deploy"

**Option B: Vercel CLI**
```bash
cd frontend
npm install -g vercel
vercel login
vercel
# Follow prompts, then:
vercel env add VITE_API_URL production
# Enter: https://sharirasutra.onrender.com
vercel --prod
```

### Step 3: Update Backend CORS
After getting your Vercel URL (e.g., `https://sharirasutra.vercel.app`):

1. Edit `backend/main.py`
2. Add your Vercel URL to the `origins` list:
   ```python
   origins = [
       "http://localhost:5173",
       "http://127.0.0.1:5173",
       "https://sharirasutra.onrender.com",
       "http://localhost:3000",
       "http://localhost:5000",
       "https://sharirasutra.vercel.app",  # Add this line
   ]
   ```
3. Commit and push:
   ```bash
   git add backend/main.py
   git commit -m "Update CORS for Vercel frontend"
   git push origin main
   ```
4. Render will auto-redeploy with new CORS settings

### Step 4: Test Your Deployment
1. Open your Vercel URL
2. Test these features:
   - Gallery page loads
   - Images display correctly
   - Upload works
   - Tag filtering works
   - Story generation works
3. Check browser console for any errors

## 🎯 Key Points

- **Environment Variable**: `VITE_API_URL` must be set in Vercel to point to your backend
- **CORS**: Backend must allow requests from your Vercel domain
- **Automatic Deployments**: Vercel will auto-deploy on every push to main branch
- **Preview Deployments**: Vercel creates preview URLs for pull requests

## 📚 Documentation Files

- `frontend/VERCEL_DEPLOYMENT.md` - Detailed deployment instructions
- `BACKEND_CORS_UPDATE.md` - Backend CORS configuration guide
- `frontend/.env.example` - Environment variable template

## 🔧 Local Development

For local development, you can either:

1. **Use default** (no .env file needed):
   - API calls go to `http://127.0.0.1:5007`

2. **Create `.env.local`**:
   ```env
   VITE_API_URL=http://127.0.0.1:5007
   ```

## ⚠️ Important Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **CORS must be updated** after Vercel deployment
3. **Environment variables** in Vite must be prefixed with `VITE_`
4. **Redeploy** if you change environment variables in Vercel

---

**Ready to deploy!** Follow the steps above and refer to the detailed guides in the documentation files.
