# Quick Start: Deploy Prophet Dian to Netlify

## 🚀 5-Minute Setup

### Step 1: Create Netlify Account
Go to https://netlify.com and sign up (free)

### Step 2: Connect GitHub Repository
1. Click "New site from Git"
2. Select GitHub
3. Choose `prophetdian/prophetdian.github.io`
4. Click "Deploy site"

### Step 3: Add Environment Variables
In Netlify dashboard:
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add these variables:

```
SUPABASE_URL=https://rqlucgdeuvpkkrbnvjex.supabase.co
SUPABASE_ANON_KEY=sb_publishable_fLoSYy-c_Q76RxL3nlfb4A_2hcweUta
SUPABASE_SERVICE_ROLE_KEY=[Your Service Role Key]
DATABASE_URL=[Your PostgreSQL URL]
JWT_SECRET=[Random 32-char hex string]
VITE_APP_ID=[Your Manus App ID]
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
PAYPAL_CLIENT_ID=[Your PayPal ID]
PAYPAL_CLIENT_SECRET=[Your PayPal Secret]
PAYPAL_MODE=sandbox
```

### Step 4: Trigger Deploy
Push to main branch:
```bash
git push origin main
```

Netlify automatically builds and deploys!

### Step 5: Access Your App
Your app will be live at:
```
https://[your-site-name].netlify.app
```

## 📊 What Gets Deployed

✅ **Frontend** - React app with Tailwind CSS  
✅ **Backend API** - Node.js/Express server  
✅ **Database** - Supabase PostgreSQL  
✅ **Authentication** - Manus OAuth  
✅ **Payments** - PayPal integration  

## 🔧 Features

- **User Profiles** - Store in Supabase
- **Prophetic Feed** - Posts, comments, likes
- **Navi Society** - $500/month subscription
- **Badges** - 5 types (Pastor, Teacher, Evangelist, Apostle, Prophet)
- **Payments** - PayPal & bank transfers
- **Real-time** - Live notifications

## 📝 Important Notes

1. **Service Role Key** - Keep this secret! Don't commit to GitHub
2. **Database** - All data stored in Supabase (not local)
3. **Automatic Deploys** - Every push to `main` triggers a new build
4. **Build Time** - Usually 2-3 minutes per deployment

## 🆘 Troubleshooting

**Build fails?**
- Check environment variables are set
- Verify Supabase credentials
- Check build logs in Netlify dashboard

**App loads but API errors?**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check database migrations are applied
- Review Netlify function logs

**Can't log in?**
- Verify Manus OAuth credentials
- Check `OAUTH_SERVER_URL` is correct

## 📚 Full Documentation

See `NETLIFY_DEPLOYMENT.md` for detailed setup instructions.

## ✨ Next Steps

1. ✅ Deploy to Netlify
2. ✅ Test user registration
3. ✅ Verify Supabase data storage
4. ✅ Test payment flows
5. ✅ Set custom domain (optional)

**Questions?** Check the full deployment guide or contact support.
