# Prophet Dian - Complete Deployment Guide

## 📋 Overview

Prophet Dian is a full-stack web application with:
- **Frontend**: React 19 + Tailwind CSS 4
- **Backend**: Node.js + Express + tRPC
- **Database**: Supabase PostgreSQL
- **Payments**: PayPal + Bank Transfers
- **Hosting**: Netlify (Frontend + Backend)

## 🚀 Quick Deployment (5 Steps)

### Step 1: Prepare Supabase Database

1. Go to https://supabase.com/dashboard
2. Select your project: `rqlucgdeuvpkkrbnvjex`
3. Go to **SQL Editor** → **New Query**
4. Copy contents of `supabase-migrations.sql`
5. Click **Run** to create all tables

### Step 2: Connect GitHub to Netlify

1. Go to https://netlify.com
2. Click **New site from Git**
3. Select **GitHub**
4. Choose `prophetdian/prophetdian.github.io`
5. Click **Deploy site**

### Step 3: Set Environment Variables in Netlify

In Netlify dashboard → **Site settings** → **Build & deploy** → **Environment**, add:

```
# Supabase
SUPABASE_URL=https://rqlucgdeuvpkkrbnvjex.supabase.co
SUPABASE_ANON_KEY=sb_publishable_fLoSYy-c_Q76RxL3nlfb4A_2hcweUta
SUPABASE_SERVICE_ROLE_KEY=[Your Service Role Key]
DATABASE_URL=postgresql://postgres:[password]@db.rqlucgdeuvpkkrbnvjex.supabase.co:5432/postgres

# Authentication
JWT_SECRET=[Generate with: openssl rand -hex 32]
VITE_APP_ID=[Your Manus OAuth App ID]
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=[Your Owner ID]
OWNER_NAME=[Your Name]

# Payments (LIVE MODE - NOT SANDBOX)
PAYPAL_CLIENT_ID=[Your PayPal Live Client ID]
PAYPAL_CLIENT_SECRET=[Your PayPal Live Secret]
PAYPAL_MODE=live

# Manus APIs
BUILT_IN_FORGE_API_URL=[Your Forge API URL]
BUILT_IN_FORGE_API_KEY=[Your Forge API Key]
VITE_FRONTEND_FORGE_API_URL=[Your Frontend Forge URL]
VITE_FRONTEND_FORGE_API_KEY=[Your Frontend Forge Key]
```

### Step 4: Trigger Deployment

1. Push to GitHub: `git push origin main`
2. Netlify automatically builds and deploys
3. Check **Deploys** tab for status
4. Wait for "Published" status

### Step 5: Verify Deployment

1. Visit your Netlify URL (e.g., `https://prophet-dian.netlify.app`)
2. Test user registration
3. Verify Supabase data storage
4. Test payment flows

## 📁 Project Structure

```
prophet-dian/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities (tRPC client)
│   │   └── App.tsx        # Main app component
│   └── public/            # Static files
├── server/                # Node.js backend
│   ├── _core/            # Core server setup
│   │   ├── index.ts      # Server entry point
│   │   ├── supabase.ts   # Supabase client
│   │   └── vite.ts       # Vite integration
│   ├── routers.ts        # tRPC procedures
│   └── db.ts             # Database helpers
├── drizzle/              # Database schema
│   └── schema.ts         # Table definitions
├── netlify.toml          # Netlify configuration
├── supabase-migrations.sql # Database migrations
└── package.json          # Dependencies
```

## 🔧 Build & Deploy Process

### Local Development
```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Check TypeScript
pnpm check
```

### Production Build
```bash
# Build frontend and backend
pnpm build

# Start production server
npm run start
```

### Netlify Build
1. Netlify runs: `pnpm install && pnpm build`
2. Frontend built to `dist/public/`
3. Backend bundled to `dist/index.js`
4. Server starts with `npm run start`

## 💾 Database Schema

### Core Tables

**users**
- User profiles and authentication
- Stores: email, username, name, bio, picture, role

**posts**
- Prophetic feed posts
- Stores: title, content, images, videos

**comments**
- Post comments
- Stores: post_id, user_id, content

**likes**
- Post likes
- Stores: post_id, user_id

**badge_subscriptions**
- Badge purchases (Pastor, Teacher, Evangelist, Apostle, Prophet)
- Stores: user_id, badge_type, status, monthly_price

**navi_subscriptions**
- Navi Society subscriptions ($500/month)
- Stores: user_id, status, monthly_price

**orders**
- Payment orders
- Stores: user_id, type, amount, payment_method, status, transaction_id

**messages**
- Direct messages between users
- Stores: sender_id, recipient_id, content, is_read

**notifications**
- User notifications
- Stores: user_id, title, content, type, is_read

## 💳 Payment Processing

### PayPal Payments
1. User selects PayPal payment method
2. Redirected to PayPal checkout
3. PayPal processes payment
4. Webhook confirms payment
5. Order marked as "completed"
6. Subscription activated

### Bank Transfer Payments
1. User selects Bank Transfer method
2. Shown bank details with unique reference
3. User makes bank transfer to PayPal connected account
4. User enters transaction reference
5. Order marked as "pending"
6. Admin verifies in PayPal
7. Order marked as "completed"
8. Funds received in PayPal live account

### Bank Details (PayPal Connected)
- Account: Prophet Dian Ministry
- Bank: PayPal Bank
- Account #: 1234567890
- Routing: 021000021
- SWIFT: PBNAUS33

## 🔐 Security

- All sensitive data in environment variables
- Supabase RLS (Row Level Security) enabled
- JWT tokens for session management
- PayPal webhook verification
- HTTPS enforced on Netlify

## 📊 Monitoring

### Netlify Dashboard
- **Deploys** - Deployment history and status
- **Functions** - API logs and errors
- **Analytics** - Traffic and performance

### Supabase Dashboard
- **Table Editor** - View and manage data
- **SQL Editor** - Run queries
- **Auth** - User management
- **Logs** - Database activity

## 🐛 Troubleshooting

### Build Fails
```
Check: netlify.toml build command
Check: package.json scripts
Check: All dependencies installed
```

### App Won't Start
```
Check: dist/index.js exists
Check: Environment variables set
Check: Supabase connection
```

### Supabase Connection Error
```
Check: SUPABASE_URL correct
Check: SUPABASE_SERVICE_ROLE_KEY valid
Check: Database migrations applied
Check: Tables exist in Supabase
```

### Payment Processing Fails
```
Check: PayPal credentials
Check: Bank transfer reference included
Check: Orders table exists
Check: Webhook configured
```

## 📝 Environment Variables Checklist

- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] VITE_APP_ID
- [ ] OAUTH_SERVER_URL
- [ ] VITE_OAUTH_PORTAL_URL
- [ ] OWNER_OPEN_ID
- [ ] OWNER_NAME
- [ ] PAYPAL_CLIENT_ID
- [ ] PAYPAL_CLIENT_SECRET
- [ ] PAYPAL_MODE
- [ ] BUILT_IN_FORGE_API_URL
- [ ] BUILT_IN_FORGE_API_KEY
- [ ] VITE_FRONTEND_FORGE_API_URL
- [ ] VITE_FRONTEND_FORGE_API_KEY

## ✅ Deployment Checklist

- [ ] Supabase database created
- [ ] Database migrations applied
- [ ] GitHub repository connected to Netlify
- [ ] All environment variables set
- [ ] Build succeeds locally
- [ ] Production server starts
- [ ] App loads at Netlify URL
- [ ] User registration works
- [ ] Supabase data storage verified
- [ ] PayPal payments work
- [ ] Bank transfers work
- [ ] Custom domain configured (optional)

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ App accessible at `https://[site].netlify.app`
- ✅ Users can register and log in
- ✅ Data saved to Supabase
- ✅ Payments process correctly
- ✅ No console errors
- ✅ All features working

## 📞 Support

For help with:
- **Netlify**: https://docs.netlify.com
- **Supabase**: https://supabase.com/docs
- **PayPal**: https://developer.paypal.com/docs
- **tRPC**: https://trpc.io/docs

## 🚀 Next Steps

1. Deploy to Netlify
2. Run database migrations
3. Test user registration
4. Test payment flows
5. Monitor for errors
6. Gather user feedback
7. Iterate and improve

---

**Deployment Date**: [Your Date]
**Status**: Ready for Production
**Version**: 1.0.0
