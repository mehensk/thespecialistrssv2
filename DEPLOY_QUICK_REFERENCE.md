# Quick Deployment Reference

## 🚀 One-Time Setup

### 1. Create DigitalOcean Droplet
- Go to: https://cloud.digitalocean.com/droplets/new
- Choose: Ubuntu 22.04, **$6/month plan** (1GB RAM) ✅ Perfect for starting out!
- Copy IP address

### 2. Run Setup Script
```powershell
# Windows
.\scripts\setup-server.ps1 -ServerIP YOUR_DROPLET_IP

# Mac/Linux
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh YOUR_DROPLET_IP
```

### 3. Deploy Your App
```powershell
# Windows
.\scripts\deploy.ps1 -ServerIP YOUR_DROPLET_IP -Domain yourdomain.com

# Mac/Linux
chmod +x scripts/deploy.sh
./scripts/deploy.sh YOUR_DROPLET_IP yourdomain.com
```

---

## 🔄 Update Your App (After Code Changes)

### Option 1: Use Deployment Script (Easiest)
```powershell
# Windows
.\scripts\deploy.ps1 -ServerIP YOUR_DROPLET_IP

# Mac/Linux
./scripts/deploy.sh YOUR_DROPLET_IP
```

### Option 2: Manual Update
```bash
ssh root@YOUR_DROPLET_IP
cd /var/www/thespecialistrealty
git pull origin main
npm install
npm run build
pm2 restart thespecialistrealty
```

---

## 📋 Code Changes Summary

**Only 1 change needed:**
- ✅ Added `output: 'standalone'` to `next.config.ts`

**No other code changes required!**

---

## 🔑 Environment Variables

Create `/var/www/thespecialistrealty/.env` on server with:

```env
# Database (PostgreSQL on same server)
DATABASE_URL="postgresql://appuser:your-password@localhost:5432/thespecialistrealty?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Node Environment
NODE_ENV="production"

# ... other variables (Cloudinary, EmailJS, etc.)
```

**Note:** Database is automatically created during deployment. Change default password after first deploy!

---

## 🛠️ Useful Commands

```bash
# Check app status
ssh root@YOUR_DROPLET_IP 'pm2 list'

# View logs
ssh root@YOUR_DROPLET_IP 'pm2 logs thespecialistrealty'

# Restart app
ssh root@YOUR_DROPLET_IP 'pm2 restart thespecialistrealty'

# Check Nginx
ssh root@YOUR_DROPLET_IP 'systemctl status nginx'
```

---

## 💡 Tips

1. **Database on server** = Everything in one place
2. **PostgreSQL optimized** = Tuned for 1GB RAM
3. **PM2 auto-restarts** = App stays running
4. **Nginx handles HTTPS** = Free SSL with Let's Encrypt
5. **1GB RAM works** = With swap file and optimizations

---

## 📖 Full Guide

See `DIGITALOCEAN_DEPLOYMENT.md` for complete documentation.

