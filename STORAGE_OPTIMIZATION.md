# Database Storage Optimization Guide

## Current Situation
- **Neon Free Tier**: 500 MB total
- **Current Usage**: ~60 MB (12%)
- **Problem**: High usage with minimal data

## Why This Happens

### 1. Multiple Neon Branches ⚠️
**Each branch uses separate storage!**
- If you have a "production" and "development" branch, each uses ~30-60 MB
- **Solution**: Delete unused branches in Neon dashboard

### 2. PostgreSQL Overhead
- Indexes: ~40-50 MB (you have many indexes)
- WAL files: Write-Ahead Logging files
- System tables and metadata
- **This is normal but can be optimized**

### 3. Activity Logging
- Currently logging every login/logout
- **Solution**: Disable with environment variables

## Immediate Actions

### Step 1: Check Neon Branches
1. Go to Neon Dashboard
2. Check "Child branch overview"
3. **Delete any unused branches** (each uses storage!)
4. Keep only the branch you're actively using

### Step 2: Disable Activity Logging
Add to your `.env` file (and Neon environment variables):

```env
# Disable login/logout logging (saves ~94% of activity records)
LOG_AUTH_ACTIONS=false

# Disable update logging (saves routine edit logs)
LOG_UPDATE_ACTIONS=false

# Optional: Disable ALL activity logging
# ENABLE_ACTIVITY_LOGGING=false
```

**For Neon:**
1. Go to Neon Dashboard → Your Project → Settings
2. Add these as environment variables
3. Or add them to Netlify environment variables (they'll be used at runtime)

### Step 3: Clean Up Existing Activities
```bash
# Preview what will be deleted
npm run cleanup:activities -- --dry-run

# Delete activities older than 7 days, keep 50 most recent
npm run cleanup:activities -- --days 7 --keep 50
```

### Step 4: Optimize Indexes (Optional)
You have several composite indexes that might be redundant:

**Current indexes:**
- `Listing`: userId, isPublished, userId+isPublished (composite)
- `BlogPost`: userId, slug, isPublished, userId+isPublished (composite)

**For small teams**, you might not need the composite indexes. But **be careful** - removing them might slow down queries.

**To remove a composite index:**
```sql
-- Only do this if you're sure you don't need it
DROP INDEX IF EXISTS "Listing_userId_isPublished_idx";
DROP INDEX IF EXISTS "BlogPost_userId_isPublished_idx";
```

**⚠️ Warning**: Only remove indexes if you understand the performance impact!

### Step 5: Run VACUUM (Reclaim Space)
```bash
npm run optimize:db -- --vacuum
```

This reclaims space from deleted/updated rows.

## Long-term Strategy

### 1. Use Single Branch
- Use only one Neon branch (production)
- Don't create development branches unless necessary
- Each branch = separate storage

### 2. Minimal Activity Logging
- Only log important actions (CREATE, DELETE, APPROVE)
- Don't log routine actions (LOGIN, LOGOUT, UPDATE)

### 3. Regular Cleanup
- Set up periodic cleanup of old activity logs
- Keep only recent activities (last 30-90 days)

### 4. Monitor Storage
```bash
npm run analyze:db
```

Run this periodically to track storage usage.

## Expected Storage After Optimization

**Before:**
- Data: ~8 MB
- Overhead: ~52 MB
- **Total: ~60 MB**

**After optimization:**
- Data: ~5 MB (after cleanup)
- Overhead: ~25-30 MB (after VACUUM, fewer indexes)
- **Total: ~30-35 MB** (saves ~50%!)

## Neon Branch Management

### Check Your Branches
1. Go to Neon Dashboard
2. Look at "Child branch overview"
3. Count how many branches you have

### Delete Unused Branches
1. In Neon Dashboard → Branches
2. Click on unused branch
3. Click "Delete branch"
4. **⚠️ Warning**: This deletes all data in that branch!

### Best Practice
- **Use only 1 branch** for free tier
- Use local development database for testing
- Only use Neon branch for production

## Environment Variables Setup

### Local `.env`
```env
DATABASE_URL="your-neon-url"
LOG_AUTH_ACTIONS=false
LOG_UPDATE_ACTIONS=false
```

### Neon Environment Variables
Neon doesn't directly support runtime environment variables, but you can:
1. Set them in Netlify (for your app)
2. Or modify the code to read from Neon's connection parameters

### Netlify Environment Variables
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add:
   - `LOG_AUTH_ACTIONS=false`
   - `LOG_UPDATE_ACTIONS=false`

## Monitoring

### Check Storage Regularly
```bash
npm run analyze:db
```

### Set Up Alerts
- Monitor Neon dashboard for storage usage
- Set up alerts at 80% usage (400 MB)

## If You Hit the Limit

### Option 1: Upgrade to Paid Tier
- Neon paid tier: $19/month for 10 GB

### Option 2: Optimize Further
- Remove more indexes
- Archive old data
- Use external storage for large files (images → Cloudinary)

### Option 3: Switch Providers
- Supabase: 500 MB free (similar)
- Railway: 5 GB free
- Render: 1 GB free

## Summary

**Quick Wins:**
1. ✅ Delete unused Neon branches
2. ✅ Disable login/logout logging
3. ✅ Clean up old activities
4. ✅ Run VACUUM

**Expected Result:**
- Reduce from 60 MB → ~30-35 MB
- Save ~50% of current usage
- Much more headroom for growth

