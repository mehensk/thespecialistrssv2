# Start Here: Local Testing Before Netlify 🎯

**Goal:** Test everything locally first to save Netlify build minutes!

## Quick Start (5 Minutes)

### 1. Set Your Netlify Environment Variables

Add to `.env.local` (or your `.env` file):

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

### 2. Run the Test

```bash
# Option A: Use the test script (easiest)
npm run test:netlify-local

# Option B: Manual test
npm run build:netlify-local
```

### 3. Test Runtime

```bash
# Start production server
$env:NODE_ENV="production"
$env:NETLIFY="true"
npm run start
```

Then test:
- **Login**: http://localhost:3000/login
- **Upload**: Try uploading an image
- **Health**: http://localhost:3000/api/health/database

---

## What Was Fixed

### ✅ Database Issues
- Added automatic retry logic (3 retries)
- Connection health checks
- Optimized connection pooling
- Better error messages

### ✅ Login Issues on Netlify
- Fixed serverless authentication
- Added database retry to auth
- Fixed JWT callback for Netlify
- Disabled debug mode in production

### ✅ Upload Issues on Netlify
- Better Cloudinary detection
- Clear error messages
- Database retry in upload route
- Required Cloudinary on Netlify

---

## Testing Guides

1. **Quick Test** (5 min): [QUICK_LOCAL_TEST.md](./QUICK_LOCAL_TEST.md)
2. **Full Guide** (15 min): [LOCAL_NETLIFY_TESTING.md](./LOCAL_NETLIFY_TESTING.md)
3. **Netlify Fixes**: [NETLIFY_FIX.md](./NETLIFY_FIX.md)
4. **Database Fixes**: [DATABASE_FIX.md](./DATABASE_FIX.md)

---

## Success Checklist

Before deploying to Netlify, verify:

- [ ] Build test passes: `npm run build:netlify-local`
- [ ] Login works: Can log in at http://localhost:3000/login
- [ ] Upload works: Can upload images (if Cloudinary configured)
- [ ] Health check passes: `/api/health/database` returns `healthy: true`
- [ ] No errors: Browser console and server logs are clean

**If all pass locally, they will work on Netlify!** ✅

---

## Next Steps

1. **Run local tests** (see guides above)
2. **Fix any issues** found locally
3. **Deploy to Netlify** (build will succeed)
4. **Test on Netlify** (should work the same as local)

You've saved your build minutes! 💪

---

## Need Help?

- **Build fails?** Check [LOCAL_NETLIFY_TESTING.md](./LOCAL_NETLIFY_TESTING.md) troubleshooting
- **Login fails?** Check [NETLIFY_FIX.md](./NETLIFY_FIX.md)
- **Database issues?** Check [DATABASE_FIX.md](./DATABASE_FIX.md)
- **Upload issues?** Check Cloudinary setup in [NETLIFY_FIX.md](./NETLIFY_FIX.md)

