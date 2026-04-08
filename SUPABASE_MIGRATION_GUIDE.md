# How to Run Supabase Migrations - Step by Step

## What are Migrations?

Migrations are SQL scripts that create database tables and set up your database structure. They must be run once to initialize your database.

---

## ✅ Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Log in with your account
3. Select your project (Prophet Dian)

---

## ✅ Step 2: Open SQL Editor

1. In your Supabase project, click **SQL Editor** (left sidebar)
2. Click **New Query** button (top right)
3. You should see a blank SQL editor

---

## ✅ Step 3: Copy Migration SQL

1. Go to your GitHub repository: https://github.com/prophetdian/prophetdian.github.io
2. Find the file **`supabase-migrations-fixed.sql`**
3. Click on it to open
4. Click the **Raw** button (top right)
5. Select all the text (Ctrl+A or Cmd+A)
6. Copy it (Ctrl+C or Cmd+C)

---

## ✅ Step 4: Paste into Supabase

1. Go back to your Supabase SQL Editor
2. Click in the text area
3. Paste the SQL (Ctrl+V or Cmd+V)
4. You should see the entire migration script

---

## ✅ Step 5: Run the Migration

1. Click the **Run** button (bottom right, or Ctrl+Enter)
2. Wait for it to complete (usually 5-10 seconds)
3. You should see a success message

---

## ✅ Step 6: Verify Tables Were Created

1. Click **Table Editor** (left sidebar)
2. You should see these tables created:
   - `users`
   - `posts`
   - `comments`
   - `likes`
   - `badge_subscriptions`
   - `navi_subscriptions`
   - `orders`
   - `messages`
   - `notifications`
   - `blocked_users`

If you see all these tables, **migrations were successful!** ✅

---

## ❌ If Something Goes Wrong

### Error: "Syntax error"
- The SQL script might have formatting issues
- Try copying from the raw GitHub file again
- Make sure you copied the ENTIRE file

### Error: "Table already exists"
- The tables were already created in a previous run
- This is OK - you can ignore this error
- Check Table Editor to verify tables exist

### Error: "Permission denied"
- Make sure you're using the correct Supabase project
- Check that your account has admin access
- Try logging out and logging back in

### No tables appear in Table Editor
- The migration might not have run
- Try running it again
- Check the SQL Editor for error messages

---

## 📝 Alternative Method (If Copy-Paste Doesn't Work)

If copy-paste is having issues:

1. In Supabase SQL Editor, click **New Query**
2. Type this command to create the users table:

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  bio TEXT,
  picture_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. Click **Run**
4. Repeat for other tables as needed

---

## ✅ Verification Checklist

After running migrations, verify:

- [ ] All 10 tables appear in Table Editor
- [ ] `users` table has columns: id, email, username, name, bio, picture_url, role, created_at, updated_at
- [ ] `posts` table has columns: id, user_id, title, content, image_url, video_url, created_at, updated_at
- [ ] `orders` table has columns: id, user_id, order_type, amount, currency, status, payment_method, created_at, updated_at
- [ ] All tables have proper indexes

If all checks pass, your Supabase database is ready! ✅

---

## 🚀 Next Steps

Once migrations are complete:

1. **Deploy to Netlify:**
   - Go to https://app.netlify.com
   - Click **Deploys** → **Trigger deploy** → **Deploy site**
   - Wait 2-3 minutes

2. **Your app will be live!**
   - Visit your Netlify URL (e.g., https://prophet-dian.netlify.app)
   - Test user registration
   - Test profile creation
   - Test payments

---

## 📞 Need Help?

If migrations still aren't working:
1. Screenshot the error message
2. Share your Supabase project URL (without credentials)
3. Share the exact error text
4. I can help debug

---

**Remember:** Migrations only need to be run ONCE. After that, your database is ready for the app to use!
