# DigitalOcean Deployment - Complete Overview

## 📁 Files Created for DigitalOcean Deployment

### 📚 Documentation Files
1. **`DIGITALOCEAN_DEPLOYMENT.md`** - Complete deployment guide (main reference)
2. **`DEPLOY_QUICK_REFERENCE.md`** - Quick command reference
3. **`DATABASE_SETUP_SERVER.md`** - Database setup and management guide
4. **`MEMORY_OPTIMIZATION.md`** - Memory optimization guide for 1GB RAM
5. **`DEPLOYMENT_OVERVIEW.md`** - This file (overview and checklist)

### ⚙️ Configuration Files
6. **`ecosystem.config.js`** - PM2 process manager configuration
7. **`nginx/thespecialistrealty.conf`** - Nginx reverse proxy configuration
8. **`next.config.ts`** - Updated with `output: 'standalone'` (only code change)

### 🚀 Deployment Scripts
9. **`scripts/setup-server.sh`** - Linux/Mac server setup script
10. **`scripts/setup-server.ps1`** - Windows PowerShell server setup script
11. **`scripts/deploy.sh`** - Linux/Mac deployment script
12. **`scripts/deploy.ps1`** - Windows PowerShell deployment script

---

## 🎯 Step-by-Step Deployment Process

### Phase 1: Pre-Deployment Preparation (Do This First!)

#### Step 1.1: Test Production Build Locally
**This is critical!** Test your build exactly as it will run on the server:

```bash
# Test production build (simulates server environment)
npm run build

# Test production server locally
npm start

# Visit http://localhost:3000 and test:
# - Homepage loads
# - Login works
# - Database queries work
# - Images load
# - All pages accessible
```

**Why this matters:** Catches issues before deploying to server.

#### Step 1.2: Verify Environment Variables
Create a checklist of all environment variables you need:

```env
# Required
DATABASE_URL="postgresql://appuser:password@localhost:5432/thespecialistrealty?schema=public"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="https://yourdomain.com"

# Optional (but recommended)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="your-key"
NEXT_PUBLIC_EMAILJS_SERVICE_ID="your-service-id"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="your-template-id"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-site-key"
RECAPTCHA_SECRET_KEY="your-secret-key"
NODE_ENV="production"
```

**Action:** Copy your local `.env` values - you'll need them for the server.

#### Step 1.3: Check Code for Local-Only References
Search your codebase for:
- ❌ `localhost:3000` hardcoded URLs
- ❌ `http://` instead of `https://` in production
- ❌ Local file paths (e.g., `C:\Users\...`)
- ❌ Development-only code that shouldn't run in production

**Fix any issues found before deploying.**

#### Step 1.4: Verify Git Repository
Make sure your code is committed and pushed:

```bash
git status
git add .
git commit -m "Ready for DigitalOcean deployment"
git push origin main
```

**Why:** The deployment script will clone from Git.

---

### Phase 2: DigitalOcean Setup

#### Step 2.1: Create DigitalOcean Account
1. Go to https://www.digitalocean.com
2. Sign up for account
3. Add payment method (required for droplets)

#### Step 2.2: Create Droplet
1. Go to https://cloud.digitalocean.com/droplets/new
2. Choose:
   - **Image**: Ubuntu 22.04 (LTS)
   - **Plan**: Basic - Regular Intel - **$6/month** (1GB RAM, 1 CPU, 25GB SSD)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH keys (recommended) OR root password
3. Click **"Create Droplet"**
4. Wait 1-2 minutes
5. **Copy your droplet's IP address** (you'll need this)

#### Step 2.3: Set Up SSH Access
**If using SSH keys:**
```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096

# Copy public key to DigitalOcean
# Go to: Settings → Security → SSH Keys → Add SSH Key
```

**If using password:**
- DigitalOcean will email you the root password
- Save it securely

---

### Phase 3: Server Setup (One-Time)

#### Step 3.1: Run Server Setup Script
**On Windows (PowerShell):**
```powershell
.\scripts\setup-server.ps1 -ServerIP YOUR_DROPLET_IP
```

**On Mac/Linux:**
```bash
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh YOUR_DROPLET_IP
```

**What this does:**
- Installs Node.js 20
- Installs PostgreSQL (optimized for 1GB RAM)
- Installs Nginx
- Installs PM2
- Sets up firewall
- Creates swap file (1GB)
- Creates app directory

**Time:** ~5-10 minutes

---

### Phase 4: Deploy Your App

#### Step 4.1: Prepare Environment Variables
Before deploying, prepare your `.env` file content. You'll need to create this on the server.

**Create a file locally with your environment variables** (for easy copy-paste):
```
DATABASE_URL=postgresql://appuser:your-password@localhost:5432/thespecialistrealty?schema=public
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
... (other variables)
```

#### Step 4.2: Run Deployment Script
**On Windows (PowerShell):**
```powershell
.\scripts\deploy.ps1 -ServerIP YOUR_DROPLET_IP -Domain yourdomain.com
```

**On Mac/Linux:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh YOUR_DROPLET_IP yourdomain.com
```

**What this does:**
1. Clones your Git repository
2. Installs dependencies
3. **Prompts you to create `.env` file** (you'll SSH in and create it)
4. Creates database and user
5. Runs migrations
6. Builds the app
7. Starts with PM2
8. Sets up Nginx
9. Configures SSL (if domain provided)

**Time:** ~5-10 minutes

#### Step 4.3: Create Environment Variables on Server
When the script prompts you, SSH into the server:

```bash
ssh root@YOUR_DROPLET_IP
cd /var/www/thespecialistrealty
nano .env
```

Paste your environment variables and save (Ctrl+X, then Y, then Enter).

**Important:** 
- Use `localhost` for `DATABASE_URL` (database is on same server)
- Use your actual domain for `NEXTAUTH_URL`
- Use production values for all variables

#### Step 4.4: Continue Deployment
After creating `.env`, press Enter in the deployment script to continue.

---

### Phase 5: Post-Deployment

#### Step 5.1: Verify App is Running
```bash
ssh root@YOUR_DROPLET_IP
pm2 list
pm2 logs thespecialistrealty
```

Should show app is running.

#### Step 5.2: Test Your Site
Visit `https://yourdomain.com` (or `http://YOUR_DROPLET_IP:3000` if no domain)

Test:
- ✅ Homepage loads
- ✅ Login works
- ✅ Database queries work
- ✅ Images load
- ✅ All pages accessible

#### Step 5.3: Change Database Password
The deployment script creates a default password. Change it:

```bash
ssh root@YOUR_DROPLET_IP
sudo -u postgres psql
ALTER USER appuser WITH PASSWORD 'your-secure-password';
\q

# Update .env file
cd /var/www/thespecialistrealty
nano .env
# Update DATABASE_URL with new password

# Restart app
pm2 restart thespecialistrealty
```

---

## 🔍 Pre-Deployment Checklist

### Code Preparation
- [ ] Code is committed and pushed to Git
- [ ] `npm run build` succeeds locally
- [ ] `npm start` works locally (production mode)
- [ ] No hardcoded `localhost` URLs
- [ ] No local file paths in code
- [ ] All environment variables documented

### Environment Variables
- [ ] `DATABASE_URL` prepared (for localhost PostgreSQL)
- [ ] `NEXTAUTH_SECRET` generated (use: `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] All optional variables documented (Cloudinary, EmailJS, etc.)

### Testing
- [ ] Production build tested locally (`npm run build && npm start`)
- [ ] All pages load correctly
- [ ] Login functionality works
- [ ] Database queries work
- [ ] Image uploads work (if applicable)
- [ ] No console errors

### Security
- [ ] Default passwords changed (if using seed script)
- [ ] `NEXTAUTH_SECRET` is secure
- [ ] No sensitive data in code (all in environment variables)
- [ ] SSH keys set up (or root password saved securely)

### DigitalOcean
- [ ] Account created
- [ ] Payment method added
- [ ] Droplet created ($6/month plan)
- [ ] IP address copied
- [ ] SSH access tested

---

## ⚠️ Common Issues & Solutions

### Issue: Build Fails on Server
**Cause:** Missing dependencies or environment variables

**Solution:**
```bash
ssh root@YOUR_DROPLET_IP
cd /var/www/thespecialistrealty
npm install
npm run build
# Check error messages
```

### Issue: Database Connection Fails
**Cause:** Wrong `DATABASE_URL` or PostgreSQL not running

**Solution:**
```bash
ssh root@YOUR_DROPLET_IP
systemctl status postgresql
# Check .env file
cat /var/www/thespecialistrealty/.env | grep DATABASE_URL
```

### Issue: App Won't Start
**Cause:** Port in use or environment variables missing

**Solution:**
```bash
ssh root@YOUR_DROPLET_IP
pm2 logs thespecialistrealty
# Check for error messages
```

### Issue: 502 Bad Gateway
**Cause:** App not running or Nginx misconfigured

**Solution:**
```bash
ssh root@YOUR_DROPLET_IP
pm2 list  # Check if app is running
systemctl status nginx  # Check Nginx
nginx -t  # Test Nginx config
```

---

## 📊 What's Different: Local vs Production

### Local Development
- Database: Your local PostgreSQL or Neon
- URL: `http://localhost:3000`
- Environment: `NODE_ENV=development`
- Build: Development mode
- Hot reload: Enabled

### Production (DigitalOcean)
- Database: PostgreSQL on same server (`localhost:5432`)
- URL: `https://yourdomain.com`
- Environment: `NODE_ENV=production`
- Build: Production mode (optimized)
- Hot reload: Disabled
- Process manager: PM2 (keeps app running)
- Reverse proxy: Nginx (handles HTTPS)

### Key Differences to Watch For:
1. **Database URL:** `localhost:5432` on server (not external Neon)
2. **NEXTAUTH_URL:** Must be your production domain
3. **File paths:** All relative (no absolute paths)
4. **Environment variables:** Must be set on server
5. **Build output:** `standalone` mode (smaller, optimized)

---

## 🚀 Quick Start Commands

### First Time Setup
```bash
# 1. Setup server (one-time)
.\scripts\setup-server.ps1 -ServerIP YOUR_IP

# 2. Deploy app
.\scripts\deploy.ps1 -ServerIP YOUR_IP -Domain yourdomain.com
```

### Update App (After Code Changes)
```bash
.\scripts\deploy.ps1 -ServerIP YOUR_IP
```

### Manual Update
```bash
ssh root@YOUR_IP
cd /var/www/thespecialistrealty
git pull origin main
npm install
npm run build
pm2 restart thespecialistrealty
```

---

## 📚 Additional Resources

- **Full Guide:** `DIGITALOCEAN_DEPLOYMENT.md`
- **Quick Reference:** `DEPLOY_QUICK_REFERENCE.md`
- **Database Setup:** `DATABASE_SETUP_SERVER.md`
- **Memory Optimization:** `MEMORY_OPTIMIZATION.md`

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ App is running (`pm2 list` shows status "online")
- ✅ Site is accessible at `https://yourdomain.com`
- ✅ Homepage loads correctly
- ✅ Login works
- ✅ Database queries work
- ✅ No errors in logs (`pm2 logs thespecialistrealty`)
- ✅ SSL certificate is valid (green lock in browser)

---

## 🆘 Need Help?

1. Check deployment logs: `pm2 logs thespecialistrealty`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`
4. Review troubleshooting section in `DIGITALOCEAN_DEPLOYMENT.md`

---

**Ready to deploy?** Start with Phase 1 (Pre-Deployment Preparation)!

