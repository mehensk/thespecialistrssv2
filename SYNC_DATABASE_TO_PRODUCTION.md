# Database Sync to Production - Complete Guide

This guide will help you sync all your development data (Users, Listings, and Blogs) to your production database before deployment.

---

## 📋 Prerequisites

Before starting, ensure you have:

1. ✅ **Development database** running with your data
2. ✅ **Production database** connection string (from Netlify environment variables)
3. ✅ **Local `.env` file** pointing to your development database
4. ✅ **Production database** is accessible and has schema migrated

---

## 🔍 Step 1: Verify Your Database Connections

### Check Your Local Development Database

Your local `.env` file should point to your **development database**:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/thespecialistrealty?schema=public"
# OR your local database connection string
```

**Verify it's working:**
```bash
npx prisma studio
```

This should open Prisma Studio showing your dev data. Check that you have:
- Users
- Listings
- Blog Posts

### Get Your Production Database URL

1. Go to **Netlify Dashboard**: https://app.netlify.com/
2. Select your site
3. Go to: **Site settings** → **Environment variables**
4. Copy the `DATABASE_URL` value (this is your production database)

**Important:** Keep this URL secure and never commit it to git!

---

## 📊 Step 2: Export Data from Development

First, let's create a comprehensive export script that exports all your data.

### Option A: Use the Migration Script (Recommended)

The migration script will copy everything directly from dev to production:

```bash
npm run migrate:to-neon
```

**Note:** This script connects to both databases and copies data directly. Make sure your production database URL is set in the script or passed as an environment variable.

### Option B: Export to JSON Files (Backup Method)

If you want to create backup files first, we can create export scripts:

```bash
# Export listings
npm run export:listings

# This creates listings-export.json
```

---

## 🗄️ Step 3: Prepare Production Database Schema

Before importing data, ensure your production database has the correct schema:

### Run Migrations on Production Database

```bash
# Replace PRODUCTION_DATABASE_URL with your actual production database URL
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npx prisma migrate deploy
```

**Or use Prisma db push:**
```bash
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npx prisma db push
```

### Verify Schema Exists

```bash
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npx prisma studio
```

Open at `http://localhost:5555` and verify all tables exist (they should be empty).

---

## 🚀 Step 4: Sync Data to Production

### Method 1: Use the Sync Script (Recommended)

The sync script will copy all your data from development to production:

**First, get your production database URL:**
1. Go to Netlify Dashboard → Site settings → Environment variables
2. Copy the `DATABASE_URL` value

**Then run the sync:**

**Option A: Pass URL inline (Recommended)**
```bash
PRODUCTION_DATABASE_URL="your-production-database-url-here" npm run sync:to-production
```

**Option B: Add to .env file**
Add this line to your `.env` file:
```env
PRODUCTION_DATABASE_URL="your-production-database-url-here"
```

Then run:
```bash
npm run sync:to-production
```

**Option C: Export as environment variable**
```bash
export PRODUCTION_DATABASE_URL="your-production-database-url-here"
npm run sync:to-production
```

**What this does:**
1. ✅ Connects to your local database (from `.env` DATABASE_URL)
2. ✅ Connects to your production database (from PRODUCTION_DATABASE_URL)
3. ✅ Syncs all **Users** (preserves IDs, passwords, roles)
4. ✅ Syncs all **Listings** (preserves all data and relationships)
5. ✅ Syncs all **Blog Posts** (preserves all data and relationships)
6. ✅ Syncs recent **Activities** (last 1000 to avoid timeout)
7. ✅ Shows progress and final stats
8. ✅ Uses upsert (won't duplicate existing data)

### Method 2: Use Legacy Migration Script

If you're using Neon and have the URL hardcoded in the script:

```bash
npm run migrate:to-neon
```

---

## 📝 Step 5: Verify Sync Script is Ready

The sync script is already created at `scripts/sync-to-production.ts`. It:

1. ✅ Connects to both databases
2. ✅ Exports from dev
3. ✅ Imports to production
4. ✅ Handles relationships correctly (users first, then listings/blogs)
5. ✅ Shows progress with counters
6. ✅ Uses upsert to avoid duplicates
7. ✅ Preserves IDs and timestamps

**The script is ready to use!** Just make sure you have `PRODUCTION_DATABASE_URL` set.

---

## ✅ Step 6: Verify Data Sync

### Method 1: Prisma Studio (Production)

```bash
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npx prisma studio
```

Verify:
- ✅ All users are present
- ✅ All listings are present
- ✅ All blog posts are present
- ✅ Relationships are correct (listings linked to users, etc.)

### Method 2: Count Records

Compare counts between dev and production:

**Development:**
```bash
npx prisma studio
# Note the counts
```

**Production:**
```bash
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npx prisma studio
# Compare the counts
```

### Method 3: Test Production Site

1. Deploy to Netlify
2. Visit your production site
3. Log in with your admin credentials
4. Verify all data appears correctly

---

## 🔄 Step 7: Run Seed Script (Optional)

The seed script ensures default users exist. It won't delete your data:

```bash
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npm run db:seed
```

**What it does:**
- Creates default users if they don't exist (admin, agent, writer)
- Does NOT delete existing users
- Does NOT touch listings or blogs
- Only ensures default users are available

---

## 🚀 Step 8: Deploy to Production

Once sync is complete and verified:

1. **Push your code** (if using Git deployment):
   ```bash
   git add .
   git commit -m "Ready for production - database synced"
   git push
   ```

2. **Or trigger manual deploy**:
   - Go to Netlify Dashboard → Deploys
   - Click "Trigger deploy"

3. **Monitor the build**:
   - Watch for build errors
   - Check deployment logs
   - Verify seed script runs successfully

---

## 📋 Quick Sync Checklist

Before deploying to production:

- [ ] Step 1: Verified local `.env` points to development database
- [ ] Step 1: Verified production database URL is accessible
- [ ] Step 2: Exported/verified development data exists
- [ ] Step 3: Ran migrations on production database
- [ ] Step 3: Verified schema exists in production (Prisma Studio)
- [ ] Step 4: Set PRODUCTION_DATABASE_URL environment variable
- [ ] Step 4: Ran sync script: `PRODUCTION_DATABASE_URL="..." npm run sync:to-production`
- [ ] Step 4: Sync completed successfully
- [ ] Step 6: Verified data in production (Prisma Studio or production site)
- [ ] Step 7: Ran seed script (optional, ensures default users)
- [ ] Step 8: Ready to deploy to Netlify

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to production database"

**Solution:**
1. Verify production database URL is correct
2. Check if database requires SSL (add `?sslmode=require`)
3. Verify network access to production database
4. Check if database credentials are correct

### Issue: "User already exists" errors

**Solution:**
- The sync script uses `upsert`, so it won't duplicate
- If you see errors, data might already be synced
- Check production database with Prisma Studio to verify

### Issue: Missing relationships (listings without users)

**Solution:**
1. Ensure users are synced first
2. Check that user IDs match between dev and production
3. Re-run sync script (it's safe - uses upsert)

### Issue: Images not showing

**Solution:**
- Images are stored as URLs (Cloudinary or local paths)
- URLs should work if they're absolute URLs
- If using local paths, ensure images are uploaded to production storage

---

## 📊 What Gets Synced

The sync process copies:

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

**What's NOT synced:**
- Old activities beyond the last 1000 (to avoid performance issues)
- Temporary or cache data
- File uploads (images are already on Cloudinary, so URLs are preserved)

---

## 🎯 Quick Command Reference

```bash
# 1. Verify dev database
npx prisma studio

# 2. Run migrations on production
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npx prisma migrate deploy

# 3. Sync data to production
PRODUCTION_DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npm run sync:to-production

# 4. Verify production data
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npx prisma studio

# 5. Run seed script (optional)
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npm run db:seed

# 6. Deploy
git push
```

---

## 🔒 Security Notes

⚠️ **Important:**
- Never commit your `.env` file to git
- Never share your `DATABASE_URL` publicly (contains credentials)
- The sync script includes database URLs - only use in trusted environments
- Change default passwords after first production login

---

## 📝 Summary

1. **Verify connections** - Check both dev and production databases
2. **Prepare production** - Run migrations on production database
3. **Sync data** - Run `npm run sync:to-production`
4. **Verify** - Check data in production database
5. **Deploy** - Push to Netlify
6. **Done** - Your production site now has all your data!

---

**The sync script is ready!** Just follow the steps above to sync your data.

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Get production database URL from Netlify
#    Site settings → Environment variables → DATABASE_URL

# 2. Run migrations on production
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npx prisma migrate deploy

# 3. Sync data
PRODUCTION_DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npm run sync:to-production

# 4. Verify
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npx prisma studio

# 5. Deploy
git push
```

That's it! Your production database will have all your development data.

