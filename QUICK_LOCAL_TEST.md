# Quick Local Test - 3 Steps to Save Build Minutes ⚡

## Step 1: Set Environment Variables (1 minute)

Copy your Netlify environment variables to `.env.local`:

```env
DATABASE_URL="your-netlify-database-url"
NEXTAUTH_SECRET="your-netlify-secret"
NEXTAUTH_URL="https://your-site.netlify.app"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NETLIFY=true
NODE_ENV=production
```

## Step 2: Test Build (2 minutes)

```bash
npm run build:netlify-local
```

**✅ If this passes, your build will work on Netlify!**

## Step 3: Test Runtime (2 minutes)

```bash
# Start production server
$env:NODE_ENV="production"
$env:NETLIFY="true"
npm run start
```

Then test:
1. **Login**: http://localhost:3000/login (admin@thespecialistrealty.com / admin123)
2. **Upload**: Try uploading an image
3. **Health**: http://localhost:3000/api/health/database

**✅ If all work, you're ready to deploy!**

---

## What Each Test Checks

### Build Test (`npm run build:netlify-local`)
- ✅ Database connection
- ✅ Cloudinary connection (if configured)
- ✅ Prisma client generation
- ✅ Next.js build
- ✅ Database seed

### Runtime Test (`npm run start` in production mode)
- ✅ Login functionality
- ✅ Upload functionality
- ✅ Database queries
- ✅ Session management

---

## Common Issues

### Build Fails
- Check environment variables are set
- Check database is accessible
- Check Prisma client generates

### Login Fails
- Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- Check database connection
- Check browser console for errors

### Upload Fails
- Check Cloudinary is configured (required on Netlify)
- Check user is logged in
- Check browser console for errors

---

## Full Guide

For detailed testing, see [LOCAL_NETLIFY_TESTING.md](./LOCAL_NETLIFY_TESTING.md)

