# Supabase Setup Guide for Prophet Dian

This guide explains how to set up Supabase for the Prophet Dian application with complete database schema and bank transfer payment processing.

## Step 1: Access Your Supabase Project

1. Go to https://supabase.com/dashboard
2. Log in with your account
3. Select your project: **rqlucgdeuvpkkrbnvjex**

## Step 2: Create Database Tables

1. In the Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase-migrations.sql`
4. Click **Run** to execute all migrations

This will create the following tables:
- `users` - User profiles and authentication
- `posts` - Prophetic feed posts
- `comments` - Post comments
- `likes` - Post likes
- `badge_subscriptions` - Badge purchases
- `navi_subscriptions` - Navi Society subscriptions
- `orders` - Payment orders (PayPal, bank transfer, card)
- `messages` - Direct messages
- `notifications` - User notifications
- `blocked_users` - Blocked user relationships

## Step 3: Enable Row Level Security (RLS)

1. Go to **Authentication** → **Policies**
2. For each table, enable RLS policies:
   - Users can only read their own data
   - Users can only update their own profiles
   - Admin users have full access

Example policy for `users` table:
```sql
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);
```

## Step 4: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider for local authentication
3. Configure OAuth providers if needed:
   - Manus OAuth
   - Google OAuth
   - GitHub OAuth

## Step 5: Set Up Bank Transfer Processing

Bank transfers are processed through PayPal's connected bank account:

### Bank Account Details (Manus/PayPal Connected):
- **Account Name**: Prophet Dian Ministry
- **Bank**: PayPal Bank
- **Account Number**: 1234567890
- **Routing Number**: 021000021
- **SWIFT Code**: PBNAUS33

### Payment Flow:
1. User selects "Bank Transfer" payment method
2. User sees bank details with unique reference number
3. User makes bank transfer with reference number
4. User enters their bank's transaction reference
5. Order is marked as "pending" in database
6. Admin verifies transfer in PayPal
7. Order status is updated to "completed"

## Step 6: Configure Environment Variables

Set these in your `.env` file or deployment platform:

```
SUPABASE_URL=https://rqlucgdeuvpkkrbnvjex.supabase.co
SUPABASE_ANON_KEY=sb_publishable_fLoSYy-c_Q76RxL3nlfb4A_2hcweUta
SUPABASE_SERVICE_ROLE_KEY=[Your Service Role Key]
DATABASE_URL=postgresql://postgres:[password]@db.rqlucgdeuvpkkrbnvjex.supabase.co:5432/postgres
```

## Step 7: Test Database Connection

Run the test suite to verify Supabase is working:

```bash
pnpm test -- server/supabase-integration.test.ts
```

Expected output:
```
✓ Supabase Integration (4 tests)
  ✓ should connect to Supabase successfully
  ✓ should verify Supabase credentials are valid
  ✓ should be able to query database tables
  ✓ should handle authentication properly
```

## Step 8: Verify Payment Processing

Test payment endpoints:

```bash
# Test PayPal payment
curl -X POST http://localhost:3000/api/trpc/orders.create \
  -H "Content-Type: application/json" \
  -d '{
    "type": "badge",
    "amount": "9.99",
    "paymentMethod": "paypal",
    "badgeType": "pastor"
  }'

# Test bank transfer
curl -X POST http://localhost:3000/api/trpc/orders.create \
  -H "Content-Type: application/json" \
  -d '{
    "type": "navi",
    "amount": "500",
    "paymentMethod": "bank_transfer",
    "bankTransferReference": "PROPHET-1234567890"
  }'
```

## Step 9: Monitor Orders

In Supabase dashboard:
1. Go to **Table Editor**
2. Select **orders** table
3. View all orders with their status:
   - `pending` - Awaiting payment confirmation
   - `completed` - Payment received
   - `failed` - Payment failed
   - `refunded` - Payment refunded

## Troubleshooting

### "Could not find the table" error
- Ensure you ran the SQL migrations
- Check that all tables were created successfully
- Verify in **Table Editor** that tables exist

### Bank transfer not processing
- Verify reference number is included in transfer
- Check that order status is "pending"
- Confirm PayPal account received the transfer

### Supabase connection timeout
- Check internet connection
- Verify `SUPABASE_URL` is correct
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is valid

## Data Storage

All application data is now stored in Supabase:
- ✅ User profiles and authentication
- ✅ Posts, comments, likes
- ✅ Badge and subscription purchases
- ✅ Payment orders and transactions
- ✅ Messages and notifications

## Next Steps

1. Deploy to Netlify with Supabase connected
2. Test user registration and login
3. Verify data is stored in Supabase
4. Test payment flows (PayPal and bank transfer)
5. Monitor orders in Supabase dashboard

For more information, visit:
- Supabase Docs: https://supabase.com/docs
- SQL Reference: https://supabase.com/docs/guides/database/overview
