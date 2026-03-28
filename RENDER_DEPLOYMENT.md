# Render Deployment Guide

This guide will help you deploy the Prophet Dian backend to Render.com.

## Prerequisites

- GitHub account (repository already set up)
- Render.com account (free tier available at https://render.com)
- PayPal credentials (Client ID and Secret)
- Manus API credentials

## Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended for easy integration)
4. Authorize Render to access your GitHub account

## Step 2: Create PostgreSQL Database

1. In Render dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure:
   - **Name**: `prophet-dian-db`
   - **Database**: `prophet_dian`
   - **User**: `prophet_user`
   - **Region**: Choose closest to you
   - **Plan**: Free tier (sufficient for testing)
4. Click "Create Database"
5. Wait for database to initialize (2-3 minutes)
6. Note the **Internal Database URL** (you'll need this)

## Step 3: Create Web Service

1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Configure:
   - **Repository**: Select `prophetdian/prophetdian.github.io`
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `node server/_core/index.ts`
   - **Plan**: Free tier

4. Click "Create Web Service"

## Step 4: Configure Environment Variables

In your Render Web Service:

1. Go to "Environment" tab
2. Add each variable:

### Database (Required)
```
DATABASE_URL=postgresql://prophet_user:PASSWORD@HOST:5432/prophet_dian
```
Replace with the Internal Database URL from Step 2

### Authentication
```
JWT_SECRET=generate_with: openssl rand -hex 32
NODE_ENV=production
PORT=3000
```

### Manus OAuth
```
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Prophet Dian
```

### Manus APIs
```
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key
```

### PayPal (Production)
```
PAYPAL_CLIENT_ID=your_paypal_live_id
PAYPAL_CLIENT_SECRET=your_paypal_live_secret
PAYPAL_MODE=live
```

### App Configuration
```
VITE_APP_TITLE=Prophet Dian
VITE_APP_LOGO=https://your-cdn.com/logo.png
```

3. Click "Save Changes"
4. Render will automatically redeploy with new environment variables

## Step 5: Get Your Render URL

1. In Render Web Service dashboard
2. Find the **Service URL** at the top (e.g., `https://prophet-dian.onrender.com`)
3. **Copy this URL** - you'll need it for the frontend

## Step 6: Run Database Migrations

After deployment, initialize the database:

### Option A: Using Render Shell

1. In Render Web Service, click "Shell" tab
2. Run commands:
```bash
pnpm drizzle-kit push
```

### Option B: Using psql

Connect to PostgreSQL and run migrations:
```bash
psql postgresql://prophet_user:PASSWORD@HOST:5432/prophet_dian
```

Then run the SQL from `drizzle/` folder migrations.

## Step 7: Verify Deployment

1. Check Render logs:
   - Go to Web Service
   - Click "Logs" tab
   - Ensure server started successfully

2. Test the backend:
```bash
curl https://your-render-url.onrender.com/api/trpc/auth.me
```

3. Check GitHub Pages:
   - Visit https://prophetdian.github.io
   - Frontend should load and connect to Render backend

## Step 8: Connect Frontend to Render Backend

Update the frontend to use Render URL:

1. In `client/src/lib/trpc.ts`, change:
```typescript
// Before
const apiUrl = "https://prophetdia-jsyacvgb.manus.space";

// After
const apiUrl = process.env.VITE_API_URL || "https://your-render-url.onrender.com";
```

2. Rebuild and redeploy frontend:
```bash
pnpm build
git subtree push --prefix dist origin gh-pages
```

## Troubleshooting

### Build Fails

**Check Render logs:**
1. Go to Web Service
2. Click "Logs" tab
3. Look for error messages

**Common issues:**
- Missing environment variables
- Dependency installation failed
- TypeScript errors

**Solution:**
- Add missing environment variables
- Check `package.json` for correct scripts
- Fix TypeScript errors in code

### Database Connection Failed

**Error:** "could not connect to server"

**Solution:**
1. Verify DATABASE_URL is correct
2. Check PostgreSQL service is running
3. Verify IP whitelist (Render allows all by default)

**Test connection:**
```bash
psql DATABASE_URL
```

### App Crashes After Deploy

**Check logs:**
1. Go to Web Service → Logs
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Database not initialized
   - Port configuration

**Fix:**
1. Add missing environment variables
2. Run migrations: `pnpm drizzle-kit push`
3. Redeploy: Click "Manual Deploy" in Render

### Frontend Can't Connect to Backend

**Check CORS:**
- Backend must allow requests from `https://prophetdian.github.io`
- Verify `VITE_API_URL` is set correctly

**Test connection:**
```bash
curl -H "Origin: https://prophetdian.github.io" \
  https://your-render-url.onrender.com/api/trpc/auth.me
```

## Monitoring

### View Logs

In Render Web Service:
1. Click "Logs" tab
2. View real-time logs
3. Search for errors

### Monitor Performance

In Render dashboard:
- View CPU and memory usage
- Check request counts
- Monitor error rates
- See response times

### Set Up Alerts

1. Go to Web Service settings
2. Enable notifications for:
   - Deployment failures
   - High resource usage
   - Service crashes

## Scaling

### Increase Resources

1. Go to Web Service settings
2. Change "Plan" from Free to Paid
3. Select CPU/Memory tier
4. Render will restart with new resources

### Auto-scaling

Paid plans support auto-scaling:
1. Configure min/max replicas
2. Render scales based on traffic
3. Automatic load balancing

## Updating the App

### Deploy New Changes

1. Push changes to GitHub `main` branch
2. Render automatically redeploys
3. Or manually trigger: Click "Manual Deploy" in Render

### Database Migrations

After pushing schema changes:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

Or use Render Shell:
```bash
pnpm drizzle-kit push
```

## Costs

**Free Tier:**
- 1 web service
- 1 PostgreSQL database
- 750 hours/month (free tier sleeps after 15 minutes of inactivity)
- Sufficient for development/testing

**Paid Plans:**
- $7+/month for always-on service
- $15+/month for PostgreSQL
- Typical cost: $20-30/month for small app

## Backup & Recovery

### Backup Database

1. Go to PostgreSQL service
2. Click "Backups" tab
3. Click "Create Backup"
4. Backups are kept for 7 days (free tier)

### Restore from Backup

1. Go to PostgreSQL service
2. Click "Backups" tab
3. Select backup to restore
4. Click "Restore"

## Support

- Render Docs: https://render.com/docs
- Render Community: https://render.com/community
- GitHub Issues: https://github.com/prophetdian/prophetdian.github.io/issues

## Next Steps

1. ✅ Create Render account
2. ✅ Deploy backend to Render
3. ✅ Add PostgreSQL database
4. ✅ Configure environment variables
5. ✅ Run database migrations
6. ✅ Get Render URL
7. Update frontend to use Render URL
8. Deploy frontend to GitHub Pages
9. Test the full application
10. Monitor logs and performance
