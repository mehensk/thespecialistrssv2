# Migrate Development Database to Production (Neon)

Complete guide to upload your existing development data to your production Neon database.

---

## 📋 Prerequisites

Before starting, verify you have:

1. ✅ **Development database** with your data (localhost)
2. ✅ **Neon database** connection string (from `seed-neon.js`)
3. ✅ **Local `.env` file** pointing to localhost database
4. ✅ **Netlify `DATABASE_URL`** already set to Neon (confirmed earlier)

---

## 🔍 Step 1: Verify Your Setup

### Check Your Local `.env` File

Your local `.env` should point to your **development database** (localhost):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/thespecialistrealty?schema=public"
# OR whatever your local database connection string is
```

### Check Your Neon Database URL

Your Neon database URL (from `seed-neon.js` line 7):
```
postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Verify Netlify Environment Variables

1. Go to: https://app.netlify.com/
2. Select your site
3. Go to: **Site settings** → **Environment variables**
4. Verify `DATABASE_URL` is set to your Neon database URL

---

## 🗄️ Step 2: Prepare Neon Database Schema

Before migrating data, ensure Neon database has the correct schema.

### Option A: Run Migrations on Neon (Recommended)

```bash
# Temporarily point to Neon for migrations
DATABASE_URL="postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma migrate deploy
```

This creates all tables in your Neon database.

### Option B: Push Schema Directly

```bash
# Temporarily point to Neon for schema push
DATABASE_URL="postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma db push
```

### Option C: Use the Seed Script (Faster)

The migration script will create the schema if needed, but running migrations first is recommended.

**After running migrations/push, verify:**
```bash
DATABASE_URL="postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma studio
```

This opens Prisma Studio pointing to Neon. Check that tables exist (they should be empty).

---

## 🚀 Step 3: Migrate Data to Neon

Now run the migration script to copy all your data from localhost to Neon:

```bash
npm run migrate:to-neon
```

### What This Does:

1. ✅ Connects to your local database (from `.env`)
2. ✅ Connects to your Neon database (from `seed-neon.js`)
3. ✅ Copies all **Users** (preserves IDs and passwords)
4. ✅ Copies all **Listings** (preserves all data and relationships)
5. ✅ Copies all **Blogs** (preserves all data and relationships)
6. ✅ Copies recent **Activities** (last 1000 to avoid timeout)
7. ✅ Shows progress and final stats

### Expected Output:

```
🚀 Starting migration from localhost to Neon...

📡 Testing local database connection...
✅ Local database connected

📡 Testing Neon database connection...
✅ Neon database connected

📊 Local database stats:
   Users: 5
   Listings: 15
   Blogs: 8
   Activities: 150

📊 Neon database stats (before migration):
   Users: 0
   Listings: 0
   Blogs: 0
   Activities: 0

👥 Migrating users...
   ✅ Migrated 5 users

🏠 Migrating listings...
   ✅ Migrated 15 listings

📝 Migrating blogs...
   ✅ Migrated 8 blogs

📋 Migrating activities (this may take a while)...
   ✅ Migrated 150 activities

📊 Migration completed!

Final Neon database stats:
   Users: 5
   Listings: 15
   Blogs: 8
   Activities: 150

✅ Migration complete! Your Neon database now has all your data.
```

---

## ✅ Step 4: Verify Migration

### Method 1: Use Prisma Studio

```bash
DATABASE_URL="postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma studio
```

Open at `http://localhost:5555` and verify:
- ✅ All users are there
- ✅ All listings are there
- ✅ All blogs are there

### Method 2: Test via Your Production Site

1. Deploy to Netlify (or redeploy)
2. Visit your production site
3. Try logging in with your admin credentials
4. Check that all data appears correctly

### Method 3: Check via Seed Script

The seed script will show counts:

```bash
DATABASE_URL="postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npm run db:seed
```

Expected output:
```
Created admin user: admin@thespecialistrealty.com
Created agent user: agent@thespecialistrealty.com
Created writer user: writer@thespecialistrealty.com

ℹ️  15 listings already exist in database
```

---

## 🎯 Step 5: Run Seed Script (Optional)

The seed script ensures default users exist. It won't delete your data:

```bash
DATABASE_URL="postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npm run db:seed
```

**What it does:**
- Creates default users if they don't exist (admin, agent, writer)
- Does NOT delete existing users
- Does NOT touch listings or blogs
- Only ensures default users are available

---

## 🔄 Step 6: Deploy to Netlify

Once migration is complete and verified:

1. **Push your code** (if using Git deployment):
   ```bash
   git add .
   git commit -m "Ready for production with data migration"
   git push
   ```

2. **Or trigger manual deploy**:
   - Go to Netlify Dashboard → Deploys
   - Click "Trigger deploy"

3. **Monitor the build**:
   - Watch for build errors
   - Check deployment logs
   - Verify seed script runs successfully (it will show existing data counts)

---

## 💡 Step 7: Optional - Switch Local Dev to Neon (Recommended)

After successful migration, you can optionally switch your local development to use Neon too:

### Update Local `.env`

Change your `.env` file:
```env
# OLD (localhost):
# DATABASE_URL="postgresql://postgres:password@localhost:5432/thespecialistrealty?schema=public"

# NEW (Neon - same as production):
DATABASE_URL="postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**Benefits:**
- ✅ Same data for dev and production
- ✅ No need to sync data manually
- ✅ Easier development workflow

**Note:** Be careful with test data - changes in dev will affect production!

---

## 🔧 Troubleshooting

### Issue: Migration Script Fails

**Error:** "Connection refused" or "Cannot connect to database"

**Solution:**
1. Verify your local `.env` has correct localhost database URL
2. Verify your local database is running
3. Check Neon database URL is correct in `seed-neon.js`

### Issue: "User already exists" errors

**Error:** Database constraint errors during migration

**Solution:**
- The migration script uses `upsert`, so it won't duplicate
- If you see errors, the data might already be migrated
- Check Neon database with Prisma Studio to verify

### Issue: Missing Data After Migration

**Solution:**
1. Check migration script output for errors
2. Verify both databases are accessible
3. Re-run migration (it's safe - uses `upsert`)
4. Check Prisma Studio for both databases to compare

### Issue: Schema Mismatch

**Error:** "Table doesn't exist" or schema errors

**Solution:**
1. Run migrations on Neon first (Step 2)
2. Ensure Prisma schema is up to date: `npx prisma generate`
3. Push schema: `npx prisma db push`

---

## 📊 What Gets Migrated

The migration script copies:

✅ **Users**
- All users with their IDs
- Passwords (hashed, so they work immediately)
- Roles (ADMIN, AGENT, WRITER)
- Creation and update timestamps

✅ **Listings**
- All listings with complete data
- Images (URLs are preserved)
- Relationships to users
- Approval status
- All fields (price, location, bedrooms, etc.)

✅ **Blog Posts**
- All blog posts with complete content
- Images (URLs are preserved)
- Relationships to users
- Approval status
- Slugs and excerpts

✅ **Activities** (Limited)
- Last 1000 activities to avoid timeout
- User actions, logs, timestamps

**What's NOT migrated:**
- Old activities beyond the last 1000 (to avoid performance issues)
- Temporary or cache data
- File uploads (images are already on Cloudinary, so URLs are preserved)

---

## ✅ Quick Checklist

Before deploying to production:

- [ ] Step 1: Verified local `.env` points to localhost
- [ ] Step 1: Verified Netlify `DATABASE_URL` points to Neon
- [ ] Step 2: Ran migrations on Neon database
- [ ] Step 2: Verified schema exists in Neon (Prisma Studio)
- [ ] Step 3: Ran migration script: `npm run migrate:to-neon`
- [ ] Step 3: Migration completed successfully
- [ ] Step 4: Verified data in Neon (Prisma Studio or production site)
- [ ] Step 5: Ran seed script (optional, ensures default users)
- [ ] Step 6: Ready to deploy to Netlify

---

## 🎯 Quick Command Reference

```bash
# 1. Run migrations on Neon
DATABASE_URL="postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma migrate deploy

# 2. Migrate data
npm run migrate:to-neon

# 3. Verify with Prisma Studio (Neon)
DATABASE_URL="postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma studio

# 4. Run seed script (optional)
DATABASE_URL="postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npm run db:seed

# 5. Verify local database (optional)
npx prisma studio
```

---

## 🔒 Security Note

⚠️ **Important:**
- Never commit your `.env` file to git
- Never share your `DATABASE_URL` publicly (contains credentials)
- The migration script includes database URLs - only use in trusted environments

---

## 📝 Summary

1. **Prepare Neon schema** - Run migrations
2. **Migrate data** - Run `npm run migrate:to-neon`
3. **Verify** - Check data in Neon
4. **Deploy** - Push to Netlify
5. **Done** - Your production site now has all your data!

---

**Questions?** Check the migration script output for any errors and refer to the Troubleshooting section above.

