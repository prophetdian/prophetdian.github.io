# Railway Deployment Guide

This guide will help you deploy the Prophet Dian backend to Railway.app.

## Prerequisites

- GitHub account (repository already set up)
- Railway.app account (free tier available at https://railway.app)
- PayPal credentials (Client ID and Secret)
- Manus API credentials

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Start Building"
3. Sign up with GitHub (recommended for easy integration)
4. Authorize Railway to access your GitHub account

## Step 2: Create New Project

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Select the `prophetdian/prophetdian.github.io` repository
4. Click "Deploy Now"

Railway will automatically detect the Node.js project and start building.

## Step 3: Add PostgreSQL Database

1. In your Railway project, click "Add Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL instance
4. The `DATABASE_URL` environment variable will be set automatically

## Step 4: Configure Environment Variables

In your Railway project settings, add these environment variables:

### Required Variables

```env
# Database (auto-set by Railway)
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your_secure_random_string_here
NODE_ENV=production
PORT=3000

# Manus OAuth
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Prophet Dian

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=live

# App Configuration
VITE_APP_TITLE=Prophet Dian
VITE_APP_LOGO=https://your-cdn.com/logo.png
```

### How to Add Environment Variables

1. In Railway project, go to "Variables"
2. Click "Add Variable"
3. Enter key and value
4. Click "Add"
5. Repeat for each variable

## Step 5: Get Your Railway URL

1. In Railway project, go to "Deployments"
2. Click on the latest deployment
3. Find the "Public URL" (e.g., `https://prophetdian-production.up.railway.app`)
4. This is your backend URL

## Step 6: Update Frontend Configuration

The frontend needs to know the backend URL. Update your environment:

1. In GitHub repository settings, add this secret:
   - Go to Settings → Secrets and variables → Actions
   - Add `VITE_API_URL=https://your-railway-url.up.railway.app`

2. The GitHub Actions workflow will use this when building

## Step 7: Run Database Migrations

After deployment, you need to run database migrations:

1. In Railway, go to your project
2. Click on the PostgreSQL service
3. Open the "Connect" tab
4. Use the connection string to connect to the database

Or, connect via Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migrations
railway run pnpm drizzle-kit push
```

## Step 8: Verify Deployment

1. Check Railway deployment logs:
   - Go to your project → Deployments
   - Click on the latest deployment
   - View logs to ensure server started successfully

2. Test the backend:
   ```bash
   curl https://your-railway-url.up.railway.app/api/trpc/auth.me
   ```

3. Check GitHub Pages:
   - Visit https://prophetdian.github.io
   - Frontend should load and connect to Railway backend

## Troubleshooting

### Build Fails

**Error: "pnpm: command not found"**
- Railway should auto-detect pnpm from `package.json`
- If not, add to environment: `NIXPACKS_NODE_PACKAGE_MANAGER=pnpm`

**Error: "Database connection failed"**
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- Run migrations: `railway run pnpm drizzle-kit push`

### App Crashes After Deploy

**Check logs:**
```bash
railway logs
```

**Common issues:**
- Missing environment variables
- Database not initialized
- Port already in use (Railway handles this)

### Frontend Can't Connect to Backend

**Check CORS settings:**
- Backend should accept requests from `https://prophetdian.github.io`
- Verify `VITE_API_URL` is set correctly in GitHub Actions secrets

**Test connection:**
```bash
curl -H "Origin: https://prophetdian.github.io" \
  https://your-railway-url.up.railway.app/api/trpc/auth.me
```

## Monitoring

### View Logs

```bash
railway logs -f  # Follow logs in real-time
```

### Monitor Performance

In Railway dashboard:
- View CPU and memory usage
- Check request counts
- Monitor error rates

### Set Up Alerts

1. Go to project settings
2. Enable notifications for:
   - Deployment failures
   - High resource usage
   - Service crashes

## Scaling

### Increase Resources

1. Go to your service
2. Click "Settings"
3. Adjust CPU and memory
4. Railway will restart with new resources

### Multiple Replicas

1. In service settings
2. Set "Replicas" to > 1
3. Railway will load balance automatically

## Updating the App

### Deploy New Changes

1. Push changes to GitHub `main` branch
2. GitHub Actions automatically builds frontend
3. Frontend deploys to GitHub Pages
4. For backend changes:
   - Push to GitHub
   - Railway auto-redeploys from GitHub
   - Or manually trigger in Railway dashboard

### Database Migrations

After pushing schema changes:

```bash
railway run pnpm drizzle-kit generate
railway run pnpm drizzle-kit push
```

## Costs

**Free Tier Includes:**
- 5GB storage
- 100 hours/month compute
- PostgreSQL database
- Sufficient for most small projects

**Paid Plans:**
- Pay-as-you-go after free tier
- Typically $5-20/month for small apps

## Support

- Railway Docs: https://docs.railway.app
- Railway Community: https://railway.app/community
- GitHub Issues: https://github.com/prophetdian/prophetdian.github.io/issues

## Next Steps

1. Deploy backend to Railway ✓
2. Deploy frontend to GitHub Pages ✓
3. Configure environment variables ✓
4. Run database migrations
5. Test payment system
6. Monitor logs and performance
7. Set up automated backups
