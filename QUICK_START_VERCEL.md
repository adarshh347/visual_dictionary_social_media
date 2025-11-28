# Quick Start: Deploy Frontend to Vercel

## 🚀 3-Step Deployment

### 1️⃣ Push to GitHub
```bash
git add .
git commit -m "Prepare frontend for Vercel deployment"
git push origin main
```

### 2️⃣ Deploy on Vercel
1. Go to **[vercel.com](https://vercel.com)** → Sign in
2. Click **"Add New Project"**
3. Import **`huih77422-ai/sharirasutra`**
4. Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Vite (auto-detected)
5. Add **Environment Variable**:
   - `VITE_API_URL` = `https://sharirasutra.onrender.com`
6. Click **"Deploy"** 🎉

### 3️⃣ Update Backend CORS
Edit `backend/main.py` (line ~14):
```python
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sharirasutra.onrender.com",
    "http://localhost:3000",
    "http://localhost:5000",
    "https://YOUR-APP.vercel.app",  # ← Add your Vercel URL here
]
```

Then push:
```bash
git add backend/main.py
git commit -m "Update CORS for Vercel"
git push origin main
```

## ✅ Done!

Your app will be live at: `https://YOUR-APP.vercel.app`

---

📖 **Need detailed instructions?** See:
- `frontend/VERCEL_DEPLOYMENT.md` - Full deployment guide
- `BACKEND_CORS_UPDATE.md` - CORS configuration details
- `DEPLOYMENT_SUMMARY.md` - Complete summary of changes
