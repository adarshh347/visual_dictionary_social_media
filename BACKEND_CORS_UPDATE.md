# Backend CORS Configuration for Vercel Frontend

## ⚠️ IMPORTANT: Update Required After Vercel Deployment

After you deploy your frontend to Vercel, you need to update the backend CORS configuration to allow requests from your Vercel domain.

## Steps to Update CORS

### 1. Get Your Vercel URL

After deploying to Vercel, you'll get a URL like:
- `https://sharirasutra.vercel.app` (production)
- `https://sharirasutra-<hash>.vercel.app` (preview deployments)

### 2. Update `backend/main.py`

Find the `origins` list (around line 13-18) and update it to:

```python
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sharirasutra.onrender.com",
    "http://localhost:3000",
    "http://localhost:5000",
    # Add your Vercel URLs here
    "https://sharirasutra.vercel.app",  # Replace with your actual Vercel URL
    "https://sharirasutra-git-main-your-username.vercel.app",  # Git branch deployments
]
```

### 3. Alternative: Allow All Vercel Domains (Less Secure)

If you want to allow all Vercel preview deployments, you can use:

```python
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sharirasutra.onrender.com",
    "http://localhost:3000",
    "http://localhost:5000",
]

# Then modify the CORS middleware to use allow_origin_regex
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allows all Vercel domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. Deploy Backend Changes

After updating the CORS configuration:

```bash
git add backend/main.py
git commit -m "Update CORS for Vercel frontend"
git push origin main
```

Render will automatically redeploy your backend with the new CORS settings.

### 5. Test the Connection

1. Open your Vercel-deployed frontend
2. Open browser DevTools (F12) → Console
3. Try to fetch data from the gallery or any other page
4. If you see CORS errors, double-check:
   - Your Vercel URL is correctly added to the `origins` list
   - The backend has been redeployed with the changes
   - There are no typos in the URLs

## Troubleshooting

### CORS Error Still Appears

If you still see CORS errors after updating:

1. **Check the exact error message** in browser console
2. **Verify the origin** - The error will show which origin was blocked
3. **Add that exact origin** to the `origins` list
4. **Clear browser cache** and try again
5. **Check Render logs** to see if the backend is receiving the requests

### Using Environment Variables (Recommended for Production)

For better security, use environment variables:

```python
import os

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

origins = ALLOWED_ORIGINS
```

Then in Render dashboard, set environment variable:
```
ALLOWED_ORIGINS=http://localhost:5173,https://sharirasutra.vercel.app
```

## Quick Reference

**Current backend CORS location**: `backend/main.py` lines 13-18

**After Vercel deployment, add**:
```python
"https://your-app-name.vercel.app",
```

**Redeploy backend**: Push changes to GitHub, Render auto-deploys

---

**Note**: This update is required for your frontend to communicate with the backend. Without it, all API calls from Vercel will be blocked by CORS policy.
