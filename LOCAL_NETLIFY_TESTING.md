# Local Netlify Testing Guide - Save Build Minutes! 🎯

This guide helps you test everything locally **exactly as Netlify does** before deploying, saving your build minutes.

## Quick Start (5 Minutes)

### Step 1: Set Up Environment Variables

Create a `.env.local` file (or update your `.env`) with your **Netlify production values**:

```env
# Database (use your Netlify database URL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth (use your Netlify values)
NEXTAUTH_SECRET="your-netlify-secret-here"
NEXTAUTH_URL="https://your-site.netlify.app"

# Cloudinary (required for uploads on Netlify)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Set Netlify environment
NETLIFY=true
NODE_ENV=production
```

### Step 2: Test Build Process

```bash
# Test the build (simulates Netlify exactly)
npm run build:netlify-local
```

This will:
- ✅ Test database connection
- ✅ Test Cloudinary connection (if configured)
- ✅ Run Prisma generate
- ✅ Build the Next.js app
- ✅ Run database seed

**If this passes, your build will work on Netlify!**

### Step 3: Test Production Server Locally

```bash
# Start production server
npm run start
```

Then test:
1. **Login**: http://localhost:3000/login
2. **Upload**: Try uploading an image (if logged in)
3. **Database Health**: http://localhost:3000/api/health/database

---

## Comprehensive Testing Checklist

### ✅ Pre-Build Checks

#### 1. Environment Variables

```bash
# Windows PowerShell
$env:DATABASE_URL
$env:NEXTAUTH_SECRET
$env:NEXTAUTH_URL
$env:CLOUDINARY_CLOUD_NAME

# Should all show values (not empty)
```

#### 2. Database Connection

```bash
# Test database connection
npm run check:neon-db
# OR
npx prisma db pull
```

**Expected:** Connection successful, no errors

#### 3. Cloudinary Connection (if using uploads)

```bash
# Test Cloudinary (create a test script or check manually)
# Should be able to connect to Cloudinary API
```

---

### ✅ Build Testing

#### 1. Clean Build Test

```bash
# Remove old build
Remove-Item -Recurse -Force .next

# Test build
npm run build:netlify-local
```

**Check for:**
- ✅ No TypeScript errors
- ✅ No build errors
- ✅ Prisma client generated
- ✅ `.next` directory created

#### 2. Production Build Test

```bash
# Set production environment
$env:NODE_ENV="production"
$env:NETLIFY="true"

# Build
npm run build
```

**Check for:**
- ✅ Build completes successfully
- ✅ No runtime errors in build output
- ✅ All pages generated

---

### ✅ Runtime Testing (Production Mode)

#### 1. Start Production Server

```bash
# Set production environment
$env:NODE_ENV="production"
$env:NETLIFY="true"

# Start server
npm run start
```

#### 2. Test Login Flow

1. **Go to:** http://localhost:3000/login
2. **Enter credentials:**
   - Email: `admin@thespecialistrealty.com`
   - Password: `admin123`
3. **Expected:**
   - ✅ Login succeeds
   - ✅ Redirects to dashboard
   - ✅ Session persists on page reload
   - ✅ No console errors

**If login fails:**
- Check browser console for errors
- Check server logs for database errors
- Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are correct
- Test database connection: http://localhost:3000/api/health/database

#### 3. Test Upload Flow

1. **Login first** (see above)
2. **Go to:** Create listing or blog post page
3. **Upload an image**
4. **Expected:**
   - ✅ Upload succeeds
   - ✅ Image URL returned
   - ✅ Image accessible (if Cloudinary) or saved locally (if dev)

**If upload fails:**
- Check if Cloudinary is configured (required on Netlify)
- Check browser console for errors
- Check server logs for errors
- Verify user is authenticated

#### 4. Test Database Health

```bash
# Check health endpoint
curl http://localhost:3000/api/health/database
```

**Expected:**
```json
{
  "healthy": true,
  "message": "Database connection is healthy",
  "latency": 45
}
```

**If unhealthy:**
- Check `DATABASE_URL` is correct
- Verify database is accessible
- Check network/firewall settings

---

## Common Issues & Fixes

### Issue: Build Fails with "DATABASE_URL not set"

**Fix:**
```bash
# Set environment variable
$env:DATABASE_URL="your-database-url"
npm run build
```

### Issue: Login Works Locally but Fails on Netlify

**Check:**
1. `NEXTAUTH_SECRET` matches between local and Netlify
2. `NEXTAUTH_URL` matches your Netlify URL exactly
3. Database is accessible from Netlify (not blocked)
4. Test with production environment locally:
   ```bash
   $env:NODE_ENV="production"
   $env:NETLIFY="true"
   npm run start
   ```

### Issue: Upload Fails with "Cloudinary not configured"

**Fix:**
1. Sign up at https://cloudinary.com
2. Get credentials from dashboard
3. Add to `.env.local`:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
4. Restart server and test again

### Issue: "Database connection failed" in Production Mode

**Fix:**
1. Test database connection:
   ```bash
   npm run check:neon-db
   ```
2. Verify `DATABASE_URL` includes `?sslmode=require` for cloud databases
3. Check database is not paused (Neon free tier auto-pauses)
4. Test with the retry logic:
   ```bash
   curl http://localhost:3000/api/health/database
   ```

---

## Testing Scripts

### Quick Test Script

Create `test-netlify-local.ps1`:

```powershell
# Set Netlify environment
$env:NETLIFY="true"
$env:NODE_ENV="production"

# Test build
Write-Host "🔨 Testing build..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Test database health
Write-Host "`n💚 Testing database health..." -ForegroundColor Cyan
$health = Invoke-RestMethod -Uri "http://localhost:3000/api/health/database" -Method Get

if ($health.healthy) {
    Write-Host "✅ Database healthy (latency: $($health.latency)ms)" -ForegroundColor Green
} else {
    Write-Host "❌ Database unhealthy: $($health.message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ All tests passed! Ready for Netlify deployment." -ForegroundColor Green
```

Run it:
```bash
.\test-netlify-local.ps1
```

---

## Step-by-Step: Full Local Test

### 1. Prepare Environment

```bash
# Copy your Netlify environment variables to .env.local
# Make sure all required vars are set:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
# - CLOUDINARY_* (if using uploads)
```

### 2. Clean Previous Builds

```bash
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.prisma -ErrorAction SilentlyContinue
```

### 3. Test Build

```bash
npm run build:netlify-local
```

**Wait for:** ✅ Build completed successfully

### 4. Test Production Server

```bash
# In one terminal
$env:NODE_ENV="production"
$env:NETLIFY="true"
npm run start
```

### 5. Test Functionality

**In browser:**
1. Open http://localhost:3000
2. Test login
3. Test upload (if logged in)
4. Check console for errors

**In another terminal:**
```bash
# Test health endpoint
curl http://localhost:3000/api/health/database
```

### 6. If All Tests Pass

✅ **You're ready to deploy to Netlify!**

The build will work the same way on Netlify as it did locally.

---

## What to Check Before Deploying

- [ ] Build completes without errors (`npm run build:netlify-local`)
- [ ] Login works in production mode (`npm run start` then test login)
- [ ] Upload works (if Cloudinary configured)
- [ ] Database health check passes (`/api/health/database`)
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] All environment variables match Netlify settings

---

## Troubleshooting

### Build Succeeds but Runtime Fails

**Check:**
1. Environment variables are set correctly
2. Database is accessible
3. Cloudinary is configured (if using uploads)
4. Test with production mode locally first

### "Module not found" Errors

**Fix:**
```bash
# Clean install
Remove-Item -Recurse -Force node_modules
npm install
npm run build
```

### Database Connection Works Locally but Not on Netlify

**Check:**
1. `DATABASE_URL` in Netlify matches local
2. Database allows connections from Netlify IPs
3. SSL mode is set (`?sslmode=require`)
4. Database is not paused (Neon)

---

## Success Criteria

You're ready to deploy when:

✅ Build completes: `npm run build:netlify-local` succeeds  
✅ Login works: Can log in at http://localhost:3000/login  
✅ Upload works: Can upload images (if Cloudinary configured)  
✅ Health check passes: `/api/health/database` returns `healthy: true`  
✅ No errors: Browser console and server logs are clean  

**If all these pass locally, they will work on Netlify!** 🚀

---

## Next Steps

Once local testing passes:

1. **Deploy to Netlify** (build will succeed)
2. **Test on Netlify** (should work the same as local)
3. **Monitor logs** (check Netlify function logs if issues)

You've saved your build minutes by catching issues locally first! 💪

