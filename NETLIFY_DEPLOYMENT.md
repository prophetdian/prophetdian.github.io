# Netlify Deployment Guide

This guide will help you deploy Prophet Dian to Netlify with Supabase database integration.

## Prerequisites

- GitHub account with the repository connected
- Netlify account (free at https://netlify.com)
- Supabase project with credentials

## Step 1: Connect GitHub to Netlify

1. Go to https://netlify.com and sign in
2. Click **"New site from Git"**
3. Select **GitHub** as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select the **prophetdian/prophetdian.github.io** repository
6. Click **Deploy site**

## Step 2: Configure Environment Variables

1. In Netlify dashboard, go to your site
2. Click **Site settings** → **Build & deploy** → **Environment**
3. Click **Edit variables** and add the following:

```
SUPABASE_URL=https://rqlucgdeuvpkkrbnvjex.supabase.co
SUPABASE_ANON_KEY=sb_publishable_fLoSYy-c_Q76RxL3nlfb4A_2hcweUta
SUPABASE_SERVICE_ROLE_KEY=[Your Service Role Key - keep this secret]
DATABASE_URL=[Your PostgreSQL connection string]
JWT_SECRET=[Generate a random secret]
VITE_APP_ID=[Your Manus OAuth App ID]
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=[Your Owner Open ID]
OWNER_NAME=[Your Name]
PAYPAL_CLIENT_ID=[Your PayPal Live Client ID]
PAYPAL_CLIENT_SECRET=[Your PayPal Live Secret]
PAYPAL_MODE=live
BUILT_IN_FORGE_API_URL=[Your Forge API URL]
BUILT_IN_FORGE_API_KEY=[Your Forge API Key]
VITE_FRONTEND_FORGE_API_URL=[Your Frontend Forge API URL]
VITE_FRONTEND_FORGE_API_KEY=[Your Frontend Forge API Key]
```

## Step 3: Configure Build Settings

1. In **Site settings** → **Build & deploy** → **Build settings**
2. Verify:
   - **Build command**: `pnpm install && pnpm build`
   - **Publish directory**: `dist/public`
   - **Node version**: 22.13.0

## Step 4: Deploy

1. Netlify will automatically deploy whenever you push to the `main` branch
2. Check the **Deploys** tab to see deployment status
3. Once deployed, your site will be available at: `https://[your-site-name].netlify.app`

## Step 5: Set Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., prophetdian.com)
4. Follow the DNS configuration instructions

## Environment Variables Explained

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Public key for client-side Supabase access |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key for server-side Supabase access |
| `DATABASE_URL` | PostgreSQL connection string from Supabase |
| `JWT_SECRET` | Secret for signing JWT tokens (generate with `openssl rand -hex 32`) |
| `PAYPAL_*` | PayPal sandbox credentials for testing payments |

## Troubleshooting

### Build fails with "pnpm: command not found"
- Netlify should auto-detect pnpm, but you can set `PNPM_VERSION=10.4.1` in environment variables

### Supabase connection errors
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check that your Supabase database is running
- Ensure database migrations have been applied

### API routes not working
- Check that the server is properly bundled in `dist/index.js`
- Verify environment variables are set in Netlify
- Check Netlify function logs for errors

## Automatic Deployments

Every time you push to the `main` branch:
1. Netlify automatically triggers a build
2. The app is built with `pnpm build`
3. Frontend files are deployed to the CDN
4. API routes are deployed as Netlify Functions

## Monitoring

- **Netlify Analytics**: View traffic and performance in the Netlify dashboard
- **Build logs**: Check the Deploys tab for build output
- **Error tracking**: Use browser console (F12) to see client-side errors

## Next Steps

1. Test the deployed app at your Netlify URL
2. Verify Supabase connection by checking user data
3. Test payment flows with PayPal sandbox
4. Set up custom domain if desired
5. Enable automatic deploys on every push

For more help, visit:
- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs
