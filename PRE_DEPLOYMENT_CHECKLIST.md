# Pre-Deployment Checklist

Since you're using the **same database** for dev and production, your data will persist automatically! However, follow these steps to ensure everything is ready:

---

## ✅ Step 1: Run Database Migrations

Ensure your database schema is up to date:

```bash
# Generate Prisma Client (ensures it's synced with schema)
npx prisma generate

# Push schema changes to database (or use migrate)
npx prisma db push

# OR if you have migrations, run them:
npx prisma migrate deploy
```

**What this does:**
- Ensures your database schema matches your Prisma schema
- Creates any new tables/columns if schema changed
- Won't delete existing data

---

## ✅ Step 2: Verify Your Data

Make sure all your data is in the database:

```bash
# Option 1: Use Prisma Studio (Visual Database Browser)
npx prisma studio
# Opens at http://localhost:5555
# Check: Users, Listings, BlogPosts

# Option 2: Check via your app
# Visit your local app and verify:
# - All users exist
# - All listings are there
# - All blogs are there
```

---

## ✅ Step 3: Test the Seed Script

The seed script will run on Netlify deployment. Test it locally:

```bash
npm run db:seed
```

**Expected behavior:**
- ✅ Creates 3 default users (if they don't exist)
- ✅ Does NOT delete existing users
- ✅ Does NOT touch listings or blogs
- ✅ Shows count of existing listings

---

## ✅ Step 4: Verify Environment Variables

### Local `.env` file should have:
```env
DATABASE_URL="postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Netlify Environment Variables should match:
- ✅ `DATABASE_URL` - Same as local (already confirmed!)
- ✅ `NEXTAUTH_SECRET` - Should be set (generate secure one)
- ✅ `NEXTAUTH_URL` - Your production URL (e.g., `https://yoursite.netlify.app`)
- ✅ `CLOUDINARY_*` - If using Cloudinary for images

**How to set in Netlify:**
1. Go to Netlify Dashboard → Site settings → Environment variables
2. Add/Update each variable
3. Set scope to "Production" (and "Deploy previews" if needed)

---

## ✅ Step 5: Test Build Locally

Simulate Netlify build to catch any issues:

```bash
npm run build:netlify
```

**What this does:**
- Simulates Netlify build environment
- Runs `npm run build`
- Tests if build will succeed on Netlify

---

## ✅ Step 6: Review Code Changes

Make sure nothing will break in production:

- ✅ Check for hardcoded localhost URLs
- ✅ Check for any local file paths
- ✅ Verify image uploads work (Cloudinary or local)
- ✅ Test login functionality

---

## ✅ Step 7: Security Check

Before deploying to production:

- ✅ Change default passwords (admin123, agent123, writer123)
- ✅ Verify `NEXTAUTH_SECRET` is secure (use: `openssl rand -base64 32`)
- ✅ Ensure sensitive data is in environment variables only
- ✅ Review user permissions/roles

---

## ✅ Step 8: Backup (Optional but Recommended)

Create a backup of your database before major deployments:

```bash
# If using Neon or similar cloud database, they usually have automatic backups
# But you can also:
# 1. Export your data using Prisma Studio
# 2. Use database export tools
# 3. Take a snapshot if your provider supports it
```

---

## 🚀 Step 9: Deploy!

Once all checks pass:

1. **Push to Git** (if using Git deployment):
   ```bash
   git add .
   git commit -m "Ready for production"
   git push
   ```
   Netlify will auto-deploy

2. **Or trigger manual deploy**:
   - Go to Netlify Dashboard → Deploys
   - Click "Trigger deploy"

3. **Monitor the build**:
   - Watch for build errors
   - Check deployment logs
   - Verify seed script runs successfully

---

## 📋 Quick Checklist

Before deploying, verify:

- [ ] Database migrations run successfully
- [ ] All data verified (users, listings, blogs)
- [ ] Seed script tested locally
- [ ] Environment variables set in Netlify
- [ ] Build test passed (`npm run build:netlify`)
- [ ] No hardcoded localhost URLs
- [ ] Default passwords changed
- [ ] NEXTAUTH_SECRET is secure
- [ ] NEXTAUTH_URL set to production URL

---

## 🎯 What Happens During Deployment

When Netlify builds your site:

1. ✅ **Install dependencies** (`npm install`)
2. ✅ **Build Next.js app** (`npm run build`)
3. ✅ **Run seed script** (`npm run db:seed`)
   - Creates default users (if missing)
   - Does NOT delete existing data
   - Does NOT modify listings/blogs
4. ✅ **Deploy** - Your site goes live

**Your data is safe!** The seed script only ensures default users exist.

---

## ⚠️ Important Notes

1. **Same Database = Data Persists**
   - All users, listings, blogs will be in production
   - No need to re-upload or migrate data
   - Seed script only creates missing default users

2. **First Deployment**
   - On first deploy, seed script creates the 3 default users
   - Your existing custom users remain untouched
   - All your data is already there

3. **Subsequent Deployments**
   - Seed script runs but does nothing (users already exist)
   - Your data remains intact
   - Only code changes are deployed

---

## 🆘 If Something Goes Wrong

1. **Check Netlify build logs**
   - Go to Deploys → Latest deploy → Deploy log
   - Look for errors

2. **Verify environment variables**
   - Ensure DATABASE_URL is correct
   - Check NEXTAUTH_SECRET is set

3. **Test database connection**
   - Use Prisma Studio locally with production DATABASE_URL
   - Verify you can connect

4. **Rollback if needed**
   - Netlify keeps previous deployments
   - You can rollback to a previous version

