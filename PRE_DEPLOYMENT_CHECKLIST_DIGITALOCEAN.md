# Pre-Deployment Checklist for DigitalOcean

## 🎯 Purpose
This checklist ensures your code will work on the server **before** you deploy. This prevents the "works locally but not on server" problem.

---

## ✅ Phase 1: Code Preparation

### 1.1 Test Production Build Locally
**This is the most important step!**

```bash
# Clean build (removes old build artifacts)
rm -rf .next
npm run build

# Test production server
npm start
```

**Then test in browser:**
- [ ] Visit `http://localhost:3000`
- [ ] Homepage loads correctly
- [ ] All pages accessible
- [ ] Login works
- [ ] Database queries work
- [ ] Images load
- [ ] No console errors
- [ ] No 404 errors

**If anything fails here, fix it before deploying!**

### 1.2 Check for Local-Only Code
Search your codebase for:

```bash
# Search for hardcoded localhost
grep -r "localhost:3000" src/

# Search for http:// (should be https:// in production)
grep -r "http://" src/ --exclude-dir=node_modules

# Search for absolute file paths
grep -r "C:\\\\Users" src/ --exclude-dir=node_modules
grep -r "/Users/" src/ --exclude-dir=node_modules
```

**Fix any issues found:**
- [ ] Replace `localhost:3000` with environment variable
- [ ] Use `https://` for production URLs
- [ ] Remove absolute file paths

### 1.3 Verify Environment Variables
Check your local `.env` file and document all variables:

**Required:**
- [ ] `DATABASE_URL` - Documented
- [ ] `NEXTAUTH_SECRET` - Documented
- [ ] `NEXTAUTH_URL` - Documented

**Optional (but check if you use them):**
- [ ] `CLOUDINARY_CLOUD_NAME` - Documented
- [ ] `CLOUDINARY_API_KEY` - Documented
- [ ] `CLOUDINARY_API_SECRET` - Documented
- [ ] `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` - Documented
- [ ] `NEXT_PUBLIC_EMAILJS_SERVICE_ID` - Documented
- [ ] `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` - Documented
- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Documented
- [ ] `RECAPTCHA_SECRET_KEY` - Documented

**Action:** Create a text file with all your environment variables (for easy copy-paste to server).

### 1.4 Check Dependencies
```bash
# Make sure all dependencies are in package.json
npm install

# Check for any missing dependencies
npm run build
```

- [ ] All dependencies installed
- [ ] No missing module errors
- [ ] Build completes successfully

### 1.5 Verify Git Repository
```bash
git status
```

- [ ] All changes committed
- [ ] Code pushed to remote repository
- [ ] Repository is accessible (for deployment script to clone)

---

## ✅ Phase 2: Database Preparation

### 2.1 Understand Database Setup
**Important:** On DigitalOcean, database will be on the same server.

**Your `DATABASE_URL` will be:**
```
postgresql://appuser:password@localhost:5432/thespecialistrealty?schema=public
```

**Not:**
- ❌ Your local database URL
- ❌ Neon database URL (unless you keep using Neon)

### 2.2 Test Database Connection Locally (Optional)
If you want to test with PostgreSQL locally first:

```bash
# Install PostgreSQL locally (or use Docker)
# Then test connection
psql -U postgres -d thespecialistrealty
```

- [ ] Can connect to PostgreSQL
- [ ] Database exists
- [ ] Migrations can run

**Note:** This is optional - the deployment script will set up the database automatically.

### 2.3 Backup Current Data (If Using External DB)
If you're currently using Neon or another external database:

- [ ] Data backed up (if needed)
- [ ] Know how to migrate data (if needed)
- [ ] Understand data will be on server (not external)

---

## ✅ Phase 3: Configuration Files

### 3.1 Verify next.config.ts
Check that `next.config.ts` has:

```typescript
output: 'standalone', // Required for server deployment
```

- [ ] `output: 'standalone'` is present
- [ ] No Netlify-specific configurations that might conflict

### 3.2 Check package.json Scripts
Verify these scripts exist:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

- [ ] `build` script exists
- [ ] `start` script exists
- [ ] No Netlify-specific build scripts that might conflict

### 3.3 Review netlify.toml (Optional)
If you have `netlify.toml`, it won't be used on DigitalOcean, but check:

- [ ] No hardcoded paths that might cause confusion
- [ ] Understand it's for Netlify only (not DigitalOcean)

---

## ✅ Phase 4: Security Preparation

### 4.1 Generate Secure Secrets
```bash
# Generate secure NEXTAUTH_SECRET
openssl rand -base64 32
```

- [ ] `NEXTAUTH_SECRET` generated (save securely)
- [ ] Will use different secret for production

### 4.2 Review Default Passwords
If your seed script creates default users:

- [ ] Know what default passwords are
- [ ] Plan to change them after deployment
- [ ] Understand seed script behavior

### 4.3 Check for Hardcoded Secrets
```bash
# Search for hardcoded secrets (should be in .env only)
grep -r "password.*=" src/ --exclude-dir=node_modules
grep -r "secret.*=" src/ --exclude-dir=node_modules
```

- [ ] No hardcoded passwords
- [ ] No hardcoded secrets
- [ ] All secrets in environment variables

---

## ✅ Phase 5: DigitalOcean Preparation

### 5.1 Create DigitalOcean Account
- [ ] Account created
- [ ] Payment method added
- [ ] Email verified

### 5.2 Prepare SSH Access
**Option A: SSH Keys (Recommended)**
- [ ] SSH key generated
- [ ] Public key added to DigitalOcean
- [ ] Can SSH into droplet

**Option B: Password**
- [ ] Root password saved securely
- [ ] Can SSH into droplet

### 5.3 Choose Domain (Optional but Recommended)
- [ ] Domain purchased (if using custom domain)
- [ ] DNS access available (for SSL setup)
- [ ] Domain ready to point to droplet

---

## ✅ Phase 6: Final Verification

### 6.1 Run Full Test Suite
```bash
# Clean install
rm -rf node_modules .next
npm install

# Build
npm run build

# Test production server
npm start
```

**Test everything:**
- [ ] All pages load
- [ ] Login works
- [ ] Database queries work
- [ ] Forms submit correctly
- [ ] Images load
- [ ] No errors in console
- [ ] No errors in terminal

### 6.2 Document Your Setup
Create a file with:
- [ ] All environment variables and their values
- [ ] Database connection details
- [ ] Domain name (if using)
- [ ] Any special configurations

**This will help you set up the server quickly.**

### 6.3 Review Deployment Scripts
- [ ] `setup-server.ps1` or `setup-server.sh` is executable
- [ ] `deploy.ps1` or `deploy.sh` is executable
- [ ] Understand what the scripts do

---

## 🚨 Critical Issues to Fix Before Deploying

### Must Fix:
- ❌ Build fails locally (`npm run build`)
- ❌ Production server won't start (`npm start`)
- ❌ Hardcoded `localhost` URLs
- ❌ Missing environment variables
- ❌ Database connection issues
- ❌ Missing dependencies

### Should Fix:
- ⚠️ Console errors (even if app works)
- ⚠️ Slow page loads
- ⚠️ Missing error handling
- ⚠️ Insecure default passwords

---

## 📋 Quick Pre-Deployment Test

Run this complete test:

```bash
# 1. Clean everything
rm -rf node_modules .next

# 2. Fresh install
npm install

# 3. Build
npm run build

# 4. Start production server
npm start

# 5. Test in browser
# Visit http://localhost:3000
# Test all functionality

# 6. Check for errors
# - Browser console
# - Terminal output
# - Network tab
```

**If all steps pass, you're ready to deploy!**

---

## ✅ Final Checklist

Before running deployment scripts:

- [ ] Production build works locally (`npm run build && npm start`)
- [ ] All pages tested and working
- [ ] Environment variables documented
- [ ] No hardcoded localhost URLs
- [ ] Code committed and pushed to Git
- [ ] DigitalOcean account ready
- [ ] SSH access configured
- [ ] Domain ready (if using)
- [ ] Deployment scripts reviewed

---

## 🎯 Next Steps

Once all checks pass:

1. **Create DigitalOcean Droplet** (see `DIGITALOCEAN_DEPLOYMENT.md`)
2. **Run Setup Script** (`.\scripts\setup-server.ps1`)
3. **Run Deployment Script** (`.\scripts\deploy.ps1`)
4. **Test Your Site** (visit your domain)

---

## 💡 Pro Tips

1. **Test production build locally first** - This catches 90% of issues
2. **Document everything** - Environment variables, passwords, etc.
3. **Start with a test deployment** - Deploy to a test domain first if possible
4. **Keep backups** - Backup your database before major changes
5. **Monitor logs** - Check `pm2 logs` after deployment

---

**Ready?** Go to `DEPLOYMENT_OVERVIEW.md` for step-by-step instructions!

