# GitHub Pages Deployment Guide

This guide explains how the frontend is automatically deployed to GitHub Pages.

## How It Works

1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
   - Triggers on every push to `main` branch
   - Installs dependencies
   - Builds the React frontend
   - Deploys built files to GitHub Pages

2. **Automatic Deployment**
   - No manual steps required
   - Happens automatically after each push
   - Takes ~2-3 minutes

3. **GitHub Pages Settings**
   - Repository must be public
   - GitHub Pages enabled (automatic for `.github.io` repos)
   - Deployed from `gh-pages` branch (created by Actions)

## Setup Steps

### 1. Verify GitHub Pages is Enabled

1. Go to repository Settings
2. Scroll to "Pages" section
3. Verify "Source" is set to "Deploy from a branch"
4. Branch should be `gh-pages` with `/ (root)` folder

### 2. Add GitHub Secrets

The build process needs environment variables. Add them as GitHub Secrets:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:

```
VITE_API_URL=https://your-railway-url.up.railway.app
VITE_APP_ID=your_manus_app_id
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key
```

### 3. Verify Workflow

1. Go to Actions tab
2. Click "Build and Deploy to GitHub Pages"
3. Check that workflow runs on each push
4. View logs to ensure build succeeds

## Accessing the App

Once deployed, the app is available at:
```
https://prophetdian.github.io
```

## Troubleshooting

### Build Fails

**Check the Actions logs:**
1. Go to Actions tab
2. Click on the failed workflow
3. Click on "build" job
4. Scroll down to see error messages

**Common issues:**
- Missing environment variables (add to Secrets)
- Dependency installation failed (check pnpm-lock.yaml)
- TypeScript errors (fix in code)

### App Doesn't Load

**Check GitHub Pages settings:**
1. Settings → Pages
2. Ensure source is `gh-pages` branch
3. Wait 1-2 minutes for deployment

**Check browser console:**
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

### API Requests Fail

**Check CORS:**
- Backend must allow requests from `https://prophetdian.github.io`
- Verify `VITE_API_URL` points to correct Railway URL
- Check backend logs for CORS errors

**Test backend connection:**
```bash
curl https://your-railway-url.up.railway.app/api/trpc/auth.me
```

## Monitoring Deployments

### View Deployment History

1. Go to Settings → Environments
2. Click "github-pages"
3. View all deployments and their status

### View Build Logs

1. Go to Actions tab
2. Click on workflow run
3. Click on "build" job
4. Scroll through logs

### Automatic Notifications

GitHub sends notifications for:
- Workflow failures
- Deployment completions
- Status changes

## Updating the App

### Deploy New Changes

Simply push to `main` branch:
```bash
git add .
git commit -m "Update app"
git push origin main
```

The workflow automatically:
1. Builds the app
2. Deploys to GitHub Pages
3. Updates https://prophetdian.github.io

### Rollback to Previous Version

1. Go to Actions tab
2. Find the previous successful deployment
3. Click "Re-run all jobs"
4. Or revert the commit: `git revert <commit-hash>`

## Performance Optimization

### Cache Dependencies

The workflow caches pnpm dependencies to speed up builds:
- First build: ~2-3 minutes
- Subsequent builds: ~1-2 minutes (with cache)

### Optimize Build Size

Monitor build output:
1. Check Actions logs for bundle size
2. Look for large dependencies
3. Consider code splitting

## Security

### Secrets Management

- Never commit `.env` files
- Use GitHub Secrets for sensitive values
- Rotate secrets regularly
- Review who has access to secrets

### CORS Configuration

- Backend should only allow requests from GitHub Pages URL
- Don't allow `*` (all origins) in production
- Verify origin headers in requests

## Advanced Configuration

### Custom Domain

To use a custom domain (e.g., `prophetdian.com`):

1. Go to Settings → Pages
2. Under "Custom domain", enter your domain
3. Update DNS records (see GitHub instructions)
4. GitHub will auto-renew SSL certificate

### Branch Protection

To prevent accidental deployments:

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Require pull request reviews
4. Require status checks to pass

## Support

- GitHub Pages Docs: https://docs.github.com/en/pages
- GitHub Actions Docs: https://docs.github.com/en/actions
- Repository Issues: https://github.com/prophetdian/prophetdian.github.io/issues

## Next Steps

1. ✅ GitHub Actions workflow created
2. ✅ GitHub Pages configured
3. Add GitHub Secrets (see Setup Steps)
4. Deploy backend to Railway
5. Test the full application
6. Monitor deployments
