# Complete Setup Guide: GitHub Pages + Railway Backend

This guide walks you through deploying the Prophet Dian app to GitHub Pages (frontend) and Railway (backend).

## Architecture Overview

```
GitHub Pages (Frontend)
    ↓ (API calls)
Railway Backend (Node.js + PostgreSQL)
    ↓ (PayPal API)
PayPal Payment Processing
```

## Part 1: Deploy Backend to Railway

### Step 1.1: Create Railway Account

1. Go to https://railway.app
2. Click "Start Building"
3. Sign up with GitHub (recommended)
4. Authorize Railway to access your GitHub account

### Step 1.2: Create New Railway Project

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Search for and select `prophetdian/prophetdian.github.io`
4. Click "Deploy Now"

Railway will automatically:
- Detect Node.js project
- Install dependencies
- Build the app
- Start the server

### Step 1.3: Add PostgreSQL Database

1. In your Railway project, click "Add Service"
2. Select "Database" → "PostgreSQL"
3. Railway creates a PostgreSQL instance
4. `DATABASE_URL` environment variable is automatically set

### Step 1.4: Configure Environment Variables

In Railway project dashboard:

1. Click on your service
2. Go to "Variables" tab
3. Add each variable (click "New Variable"):

**Authentication & Core:**
```
JWT_SECRET=generate_with: openssl rand -hex 32
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

### Step 1.5: Get Your Railway URL

1. In Railway project, go to "Deployments"
2. Click on the latest deployment
3. Find "Public URL" (e.g., `https://prophetdian-prod.up.railway.app`)
4. **Copy this URL** - you'll need it for the frontend

### Step 1.6: Run Database Migrations

Connect to Railway and run migrations:

**Option A: Using Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway link
railway run pnpm drizzle-kit push
```

**Option B: Using Railway Dashboard**
1. Go to PostgreSQL service
2. Click "Connect" tab
3. Use the connection string to connect with a database client
4. Run the SQL migrations manually

### Step 1.7: Verify Backend is Running

Test your backend:
```bash
curl https://your-railway-url.up.railway.app/api/trpc/auth.me
```

You should get a response (may be an error, but the server is responding).

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

### Step 2.4: Configure Frontend to Use Railway Backend

The frontend needs to know the Railway backend URL. Update the environment:

**In `client/src/lib/trpc.ts` or similar:**

Change the API URL from Manus to Railway:

```typescript
// Before (Manus)
const apiUrl = "https://prophetdia-jsyacvgb.manus.space";

// After (Railway)
const apiUrl = process.env.VITE_API_URL || "https://your-railway-url.up.railway.app";
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
3. Check browser console for errors

### Test Backend Connection
1. Try to log in
2. Check Network tab in DevTools
3. Verify API calls go to Railway URL

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

**Check Railway logs:**
1. Go to Railway project
2. Click on service
3. View "Logs" tab
4. Look for error messages

**Common issues:**
- Environment variables not set
- Database not initialized
- Port configuration issue

**Fix:**
```bash
railway logs -f  # Follow logs
railway run pnpm drizzle-kit push  # Run migrations
```

### API Calls Fail with CORS Error

**Issue:** Frontend can't reach backend

**Solution:**
1. Verify `VITE_API_URL` is set correctly
2. Check backend allows requests from GitHub Pages
3. Verify backend is running: `curl https://your-railway-url.up.railway.app`

### Payments Not Working

**Check PayPal configuration:**
1. Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set
2. Verify `PAYPAL_MODE=live` (not sandbox)
3. Check PayPal account is verified

**Test PayPal:**
```bash
railway run node -e "console.log(process.env.PAYPAL_CLIENT_ID)"
```

---

## Updating the App

### Update Frontend

1. Make changes locally
2. Rebuild: `pnpm build`
3. Deploy: `git subtree push --prefix dist origin gh-pages`
4. Visit https://prophetdian.github.io (may need to refresh)

### Update Backend

1. Make changes locally
2. Push to GitHub: `git push origin main`
3. Railway auto-redeploys from GitHub
4. Or manually trigger in Railway dashboard

### Update Database Schema

1. Update `drizzle/schema.ts`
2. Generate migration: `pnpm drizzle-kit generate`
3. Push to GitHub
4. Run on Railway: `railway run pnpm drizzle-kit push`

---

## Monitoring

### View Logs

**Frontend (GitHub Pages):**
- Browser DevTools → Console tab
- GitHub Actions → Deployments tab

**Backend (Railway):**
```bash
railway logs -f
```

### Monitor Performance

**Railway Dashboard:**
- CPU and memory usage
- Request count
- Error rates
- Response times

---

## Security Checklist

- [ ] All environment variables set in Railway
- [ ] PayPal credentials are production (not sandbox)
- [ ] JWT_SECRET is strong and random
- [ ] Database backups enabled
- [ ] CORS configured correctly
- [ ] No sensitive data in GitHub repository
- [ ] GitHub repository is private (if needed)

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Deploy frontend to GitHub Pages
3. ✅ Configure environment variables
4. ✅ Run database migrations
5. Test the full application
6. Monitor logs and performance
7. Set up automated backups
8. Configure custom domain (optional)

---

## Support & Resources

- Railway Docs: https://docs.railway.app
- GitHub Pages Docs: https://docs.github.com/en/pages
- GitHub CLI: https://cli.github.com
- PayPal Docs: https://developer.paypal.com

## Questions?

Check the logs first:
- Frontend: Browser console (F12)
- Backend: `railway logs -f`
- GitHub: Settings → Pages

Then review this guide's Troubleshooting section.
