# Complete Setup Guide: GitHub Pages + Render Backend

This guide walks you through deploying the Prophet Dian app to GitHub Pages (frontend) and Render (backend).

## Architecture Overview

```
GitHub Pages (Frontend)
    ↓ (API calls)
Render Backend (Node.js + PostgreSQL)
    ↓ (PayPal API)
PayPal Payment Processing
```

## Part 1: Deploy Backend to Render

### Step 1.1: Create Render Account

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your GitHub account

### Step 1.2: Create PostgreSQL Database

1. In Render dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure:
   - **Name**: `prophet-dian-db`
   - **Database**: `prophet_dian`
   - **User**: `prophet_user`
   - **Region**: Choose closest to you
   - **Plan**: Free tier
4. Click "Create Database"
5. Wait for initialization (2-3 minutes)
6. **Copy the Internal Database URL** - you'll need this

### Step 1.3: Create Web Service

1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repository:
   - Select `prophetdian/prophetdian.github.io`
   - Branch: `main`
4. Configure:
   - **Name**: `prophet-dian-api`
   - **Runtime**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `node server/_core/index.ts`
   - **Plan**: Free tier
5. Click "Create Web Service"

### Step 1.4: Add Environment Variables

In Render Web Service → Environment tab, add:

**Database (Required):**
```
DATABASE_URL=postgresql://prophet_user:PASSWORD@HOST:5432/prophet_dian
```
(Use the Internal Database URL from Step 1.2)

**Authentication:**
```
JWT_SECRET=your_secure_random_string
NODE_ENV=production
PORT=3000
```

**Manus OAuth:**
```
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Prophet Dian
```

**Manus APIs:**
```
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key
```

**PayPal (Production):**
```
PAYPAL_CLIENT_ID=your_paypal_live_id
PAYPAL_CLIENT_SECRET=your_paypal_live_secret
PAYPAL_MODE=live
```

**App Config:**
```
VITE_APP_TITLE=Prophet Dian
VITE_APP_LOGO=https://your-cdn.com/logo.png
```

Click "Save Changes" - Render will redeploy automatically.

### Step 1.5: Get Your Render URL

1. In Render Web Service dashboard
2. Find the **Service URL** at the top (e.g., `https://prophet-dian.onrender.com`)
3. **Copy this URL** - you'll need it for the frontend

### Step 1.6: Run Database Migrations

1. In Render Web Service, click "Shell" tab
2. Run:
```bash
pnpm drizzle-kit push
```

This initializes your database schema.

### Step 1.7: Verify Backend is Running

Test your backend:
```bash
curl https://your-render-url.onrender.com/api/trpc/auth.me
```

You should get a response from the server.

---

## Part 2: Deploy Frontend to GitHub Pages

### Step 2.1: Build the Frontend

Build the React app locally:

```bash
cd /path/to/prophetdian.github.io
pnpm install
pnpm build
```

This creates a `dist/` folder with the built frontend.

### Step 2.2: Deploy to GitHub Pages

**Option A: Using GitHub CLI**

```bash
# Install GitHub CLI if needed
brew install gh  # macOS
# or
sudo apt install gh  # Linux

# Login to GitHub
gh auth login

# Deploy dist folder to gh-pages branch
git subtree push --prefix dist origin gh-pages
```

**Option B: Manual Steps**

1. Create `gh-pages` branch:
```bash
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
git add .
git commit -m "Deploy frontend to GitHub Pages"
git push origin gh-pages
```

2. Go back to main branch:
```bash
git checkout main
```

### Step 2.3: Enable GitHub Pages

1. Go to repository Settings
2. Scroll to "Pages" section
3. Under "Build and deployment":
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click "Save"

GitHub will deploy the app to `https://prophetdian.github.io`

### Step 2.4: Configure Frontend to Use Render Backend

The frontend needs to know the Render backend URL.

**Update `client/src/lib/trpc.ts`:**

Change the API URL:

```typescript
// Before (Manus)
const apiUrl = "https://prophetdia-jsyacvgb.manus.space";

// After (Render)
const apiUrl = process.env.VITE_API_URL || "https://your-render-url.onrender.com";
```

Then rebuild and redeploy:
```bash
pnpm build
git subtree push --prefix dist origin gh-pages
```

---

## Part 3: Verify Everything Works

### Test Frontend
1. Visit https://prophetdian.github.io
2. App should load
3. Check browser console (F12) for errors

### Test Backend Connection
1. Try to log in
2. Open DevTools → Network tab
3. Verify API calls go to Render URL

### Test Payments
1. Register a user
2. Try to purchase a badge
3. Verify PayPal integration works

---

## Troubleshooting

### Frontend Won't Load

**Check GitHub Pages:**
1. Settings → Pages
2. Verify source is `gh-pages` branch
3. Wait 1-2 minutes for deployment

**Check browser console:**
- F12 → Console tab
- Look for error messages

### Backend Not Responding

**Check Render logs:**
1. Go to Render Web Service
2. Click "Logs" tab
3. Look for error messages

**Common issues:**
- Environment variables not set
- Database not initialized
- Build failed

**Fix:**
1. Verify all environment variables are set
2. Run migrations: `pnpm drizzle-kit push`
3. Click "Manual Deploy" in Render

### API Calls Fail with CORS Error

**Issue:** Frontend can't reach backend

**Solution:**
1. Verify `VITE_API_URL` is set correctly
2. Check backend allows requests from GitHub Pages
3. Test backend: `curl https://your-render-url.onrender.com`

### Payments Not Working

**Check PayPal configuration:**
1. Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set
2. Verify `PAYPAL_MODE=live` (not sandbox)
3. Check PayPal account is verified

**Test PayPal:**
```bash
# In Render Shell
node -e "console.log(process.env.PAYPAL_CLIENT_ID)"
```

---

## Updating the App

### Update Frontend

1. Make changes locally
2. Rebuild: `pnpm build`
3. Deploy: `git subtree push --prefix dist origin gh-pages`
4. Visit https://prophetdian.github.io (refresh browser)

### Update Backend

1. Make changes locally
2. Push to GitHub: `git push origin main`
3. Render auto-redeploys from GitHub
4. Or manually: Click "Manual Deploy" in Render

### Update Database Schema

1. Update `drizzle/schema.ts`
2. Generate migration: `pnpm drizzle-kit generate`
3. Push to GitHub
4. Run on Render: Use Shell tab → `pnpm drizzle-kit push`

---

## Monitoring

### View Logs

**Frontend (GitHub Pages):**
- Browser DevTools → Console tab
- GitHub Settings → Pages

**Backend (Render):**
- Render Web Service → Logs tab
- Or use Render CLI: `render logs`

### Monitor Performance

**Render Dashboard:**
- CPU and memory usage
- Request count
- Error rates
- Response times

---

## Security Checklist

- [ ] All environment variables set in Render
- [ ] PayPal credentials are production (not sandbox)
- [ ] JWT_SECRET is strong and random
- [ ] Database backups enabled
- [ ] CORS configured correctly
- [ ] No sensitive data in GitHub repository
- [ ] GitHub repository is private (if needed)

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to GitHub Pages
3. ✅ Configure environment variables
4. ✅ Run database migrations
5. Test the full application
6. Monitor logs and performance
7. Set up automated backups
8. Configure custom domain (optional)

---

## Support & Resources

- Render Docs: https://render.com/docs
- GitHub Pages Docs: https://docs.github.com/en/pages
- GitHub CLI: https://cli.github.com
- PayPal Docs: https://developer.paypal.com

## Quick Reference

| Component | Service | URL |
|-----------|---------|-----|
| Frontend | GitHub Pages | https://prophetdian.github.io |
| Backend | Render | https://your-render-url.onrender.com |
| Database | Render PostgreSQL | Internal only |
| Repository | GitHub | https://github.com/prophetdian/prophetdian.github.io |

---

## Questions?

1. Check the logs first (browser console or Render logs)
2. Review this guide's Troubleshooting section
3. See RENDER_DEPLOYMENT.md for detailed Render setup
4. See GITHUB_PAGES_DEPLOYMENT.md for GitHub Pages details
