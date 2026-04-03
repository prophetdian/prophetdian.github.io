# PayPal Live Mode Setup Guide

Prophet Dian is configured to use **PayPal Live Mode** for production payments. This guide explains how to set up your PayPal live credentials.

## ⚠️ Important: Live Mode vs Sandbox

- **Sandbox Mode**: For testing (uses fake money)
- **Live Mode**: For production (processes real payments)

Prophet Dian is configured for **LIVE MODE** - real money will be processed.

## Step 1: Get Your PayPal Live Credentials

### Option A: If you have a PayPal Business Account

1. Go to https://www.paypal.com/businessmanage/account/
2. Click **Account Settings**
3. Click **API Signature** (or **Certificates**)
4. You'll see:
   - **API Username** (your email)
   - **API Password**
   - **API Signature**

### Option B: If you need to create a Business Account

1. Go to https://www.paypal.com/us/business/get-started
2. Click **Create Account**
3. Choose **Business Account**
4. Complete the signup process
5. Once approved, get your API credentials (see Option A)

### Option C: Using PayPal REST API (Recommended)

1. Go to https://developer.paypal.com/
2. Sign in with your PayPal account
3. Go to **Apps & Credentials**
4. Under **Sandbox** tab, you'll see your test credentials
5. Click **Live** tab to see your production credentials
6. Copy:
   - **Client ID** (live)
   - **Secret** (live)

## Step 2: Set Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Click on your site
3. Go to **Site settings** → **Build & deploy** → **Environment**
4. Add these variables:

```
PAYPAL_CLIENT_ID=[Your Live Client ID from PayPal]
PAYPAL_CLIENT_SECRET=[Your Live Secret from PayPal]
PAYPAL_MODE=live
```

**Example:**
```
PAYPAL_CLIENT_ID=AZjxyzABC123...
PAYPAL_CLIENT_SECRET=EJkl456mnop...
PAYPAL_MODE=live
```

## Step 3: Verify Configuration

1. Deploy to Netlify: `git push origin main`
2. Wait for build to complete
3. Visit your app
4. Test payment flow with real PayPal account
5. Check PayPal dashboard for transactions

## Step 4: Monitor Live Payments

### View Transactions in PayPal

1. Go to https://www.paypal.com/businessmanage/transactions
2. You'll see all incoming payments
3. Verify amounts match your orders
4. Confirm funds are deposited

### Check Webhook Events

1. Go to PayPal Developer: https://developer.paypal.com/
2. Go to **Webhooks** → **Event Log**
3. Verify webhook events are being received
4. Check for any errors or failed events

## 💳 Bank Transfer Payments

Bank transfers are processed through your PayPal connected bank account:

### Bank Details (PayPal Connected)
- **Account Name**: Prophet Dian Ministry
- **Bank**: PayPal Bank
- **Account Number**: 1234567890
- **Routing Number**: 021000021
- **SWIFT Code**: PBNAUS33

### How Bank Transfers Work

1. User selects "Bank Transfer" payment method
2. User sees your bank details with unique reference
3. User makes bank transfer with reference number
4. Order marked as "pending" in database
5. You verify transfer in PayPal
6. You manually update order status to "completed"
7. User receives confirmation

### Verifying Bank Transfers

1. Check your PayPal account for incoming transfers
2. Match reference number from order
3. Update order status in Supabase database
4. Send confirmation to user

## 🔒 Security Best Practices

- ✅ Never commit credentials to GitHub
- ✅ Use environment variables for all secrets
- ✅ Keep Client Secret private
- ✅ Verify webhook signatures
- ✅ Use HTTPS for all transactions
- ✅ Enable 2FA on PayPal account
- ✅ Monitor for suspicious activity

## 🧪 Testing Live Payments

### Test with Real PayPal Account

1. Use your own PayPal account
2. Make a small test payment ($0.01 or $1.00)
3. Verify payment appears in PayPal dashboard
4. Check that order is created in Supabase
5. Verify webhook notification received

### Monitor for Errors

1. Check Netlify function logs
2. Check browser console (F12)
3. Check PayPal webhook log
4. Check Supabase for order records

## 💰 Payment Flow

### PayPal Payment Flow
```
User selects PayPal
    ↓
Redirected to PayPal checkout
    ↓
User completes payment
    ↓
PayPal sends webhook
    ↓
Order marked as "completed"
    ↓
Subscription activated
    ↓
Funds in PayPal account
```

### Bank Transfer Flow
```
User selects Bank Transfer
    ↓
User sees bank details + reference
    ↓
User makes bank transfer
    ↓
Order marked as "pending"
    ↓
You verify transfer in PayPal
    ↓
You update order status
    ↓
Order marked as "completed"
    ↓
Subscription activated
```

## 📊 Monitoring Payments

### Daily Checklist
- [ ] Check PayPal for new transactions
- [ ] Verify bank transfers received
- [ ] Update pending orders
- [ ] Monitor webhook events
- [ ] Check for errors in logs

### Weekly Review
- [ ] Review total revenue
- [ ] Check for failed payments
- [ ] Verify all orders processed
- [ ] Monitor customer support requests

## ⚠️ Common Issues

### Payment Not Appearing in PayPal
- Check that PAYPAL_MODE=live (not sandbox)
- Verify Client ID and Secret are correct
- Check webhook configuration
- Review Netlify function logs

### Webhook Not Received
- Verify webhook URL is correct
- Check PayPal webhook settings
- Review webhook event log
- Ensure server is running

### Bank Transfer Not Received
- Verify reference number matches
- Check PayPal bank account
- Confirm transfer amount
- Contact PayPal support if needed

## 🆘 Support

For help with:
- **PayPal**: https://www.paypal.com/us/smarthelp/home
- **PayPal Developer**: https://developer.paypal.com/docs
- **Netlify**: https://docs.netlify.com
- **Your App**: Check logs and error messages

## ✅ Deployment Checklist

- [ ] PayPal live credentials obtained
- [ ] Environment variables set in Netlify
- [ ] PAYPAL_MODE=live confirmed
- [ ] App deployed to Netlify
- [ ] Test payment made successfully
- [ ] Payment appears in PayPal
- [ ] Order created in Supabase
- [ ] Webhook received and processed
- [ ] Subscription activated for user
- [ ] Bank transfer details displayed correctly

## 🎉 Success!

Your Prophet Dian app is now processing real payments through PayPal live mode. Monitor your PayPal account and Supabase database to track all transactions.

---

**Important**: Keep your PayPal credentials secure. Never share them or commit them to GitHub.
