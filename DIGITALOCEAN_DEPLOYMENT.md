# DigitalOcean Droplet Deployment Guide

## 🎯 Goal: Deploy with Minimal Code Changes & Easy Uploads

This guide will help you deploy your Next.js app to a DigitalOcean droplet with:
- ✅ **Minimal code changes** (just 1 line in `next.config.ts`)
- ✅ **Easy deployment** (one command to upload)
- ✅ **Same environment** (local and production work identically)
- ✅ **Automatic restarts** (PM2 keeps your app running)
- ✅ **SSL/HTTPS** (automatic with Let's Encrypt)

---

## 📋 Prerequisites

1. **DigitalOcean Account** (sign up at https://www.digitalocean.com)
2. **Domain name** (optional, but recommended - ~$12/year)
3. **Git repository** (your code should be on GitHub/GitLab)

---

## 💰 Cost Estimate

### Budget Option (Recommended for Low Traffic)
| Item | Monthly Cost | Annual Cost |
|------|--------------|-------------|
| **DigitalOcean Droplet** (1GB RAM, 1 CPU, 25GB SSD) | $6/month | $72/year |
| **Domain** (.com) | ~$1/month | ~$12/year |
| **Total** | **~$7/month** | **~$84/year** |

### Standard Option (For Higher Traffic)
| Item | Monthly Cost | Annual Cost |
|------|--------------|-------------|
| **DigitalOcean Droplet** (2GB RAM, 1 CPU, 50GB SSD) | $12/month | $144/year |
| **Domain** (.com) | ~$1/month | ~$12/year |
| **Total** | **~$13/month** | **~$156/year** |

**Note:** 
- ✅ **$6/month is perfect for starting out** (1GB RAM is sufficient since you're using external Neon database and Cloudinary)
- ✅ Much cheaper than Netlify Pro ($19/month)
- ✅ You can upgrade anytime if traffic grows
- ✅ Full control over your server

---

## 🚀 Quick Start (5 Steps)

### Step 1: Create DigitalOcean Droplet

1. Go to https://cloud.digitalocean.com/droplets/new
2. Choose:
   - **Image**: Ubuntu 22.04 (LTS)
   - **Plan**: Basic - Regular Intel - **$6/month** (1GB RAM, 1 CPU, 25GB SSD) ✅ **Perfect for starting out!**
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH keys (recommended) OR root password
3. Click **"Create Droplet"**
4. Wait 1-2 minutes for droplet to be created
5. **Copy your droplet's IP address** (you'll need this)

**💡 Memory Usage with Database on Server:**
- PostgreSQL database: ~100-200MB RAM (optimized for 1GB)
- Next.js app: ~200-400MB RAM
- Nginx: ~10-20MB RAM
- System: ~200-300MB RAM
- **Total: ~600-900MB used** - Works with 1GB + swap! ✅
- **Note:** With database on server, 1GB is tight but workable. Consider 2GB ($12/month) for better performance.

### Step 2: Initial Server Setup (One-Time)

Run this script on your **local computer** (it will SSH into your server):

```bash
# On Windows PowerShell
.\scripts\setup-server.ps1 -ServerIP YOUR_DROPLET_IP

# On Mac/Linux
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh YOUR_DROPLET_IP
```

**What this does:**
- Installs Node.js 20
- Installs PostgreSQL (optimized for 1GB RAM)
- Configures PostgreSQL for low-memory usage
- Installs Nginx (reverse proxy)
- Installs PM2 (process manager)
- Sets up firewall
- Creates app directory
- **Sets up swap file** (1GB - prevents out-of-memory issues)

**OR manually:**

```bash
# SSH into your server
ssh root@YOUR_DROPLET_IP

# Run the setup commands
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt update && apt install -y nodejs postgresql nginx
npm install -g pm2
ufw allow 22,80,443/tcp
ufw --force enable
mkdir -p /var/www/thespecialistrealty
```

### Step 3: Configure Your App

**Only ONE code change needed:**

Update `next.config.ts` to add `output: 'standalone'`:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // ← Add this line (for server deployment)
  reactCompiler: true,
  // ... rest of config
};
```

That's it! No other code changes needed.

### Step 4: Deploy Your App

**Easy deployment script** (runs from your local computer):

```bash
# On Windows PowerShell
.\scripts\deploy.ps1 -ServerIP YOUR_DROPLET_IP -Domain yourdomain.com

# On Mac/Linux
chmod +x scripts/deploy.sh
./scripts/deploy.sh YOUR_DROPLET_IP yourdomain.com
```

**OR manually:**

```bash
# SSH into server
ssh root@YOUR_DROPLET_IP

# Clone your repo (first time only)
cd /var/www
git clone https://github.com/yourusername/your-repo.git thespecialistrealty
cd thespecialistrealty

# Install dependencies
npm install

# Create .env file
nano .env
# Paste your environment variables (same as local .env)

# Set up database
npx prisma generate
npx prisma migrate deploy

# Build
npm run build

# Start with PM2
pm2 start npm --name "thespecialistrealty" -- start
pm2 save
pm2 startup
```

### Step 5: Set Up Nginx & SSL

The deployment script does this automatically, but if doing manually:

```bash
# Create Nginx config
nano /etc/nginx/sites-available/thespecialistrealty
```

Paste this (replace `yourdomain.com` with your domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and get SSL:

```bash
ln -s /etc/nginx/sites-available/thespecialistrealty /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Install Certbot and get SSL certificate
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Done!** Your site should be live at `https://yourdomain.com`

---

## 🔄 Updating Your App (Easy!)

After making changes to your code:

```bash
# Option 1: Use deployment script (easiest)
.\scripts\deploy.ps1 -ServerIP YOUR_DROPLET_IP

# Option 2: Manual update
ssh root@YOUR_DROPLET_IP
cd /var/www/thespecialistrealty
git pull origin main
npm install
npm run build
pm2 restart thespecialistrealty
```

That's it! Your changes are live.

---

## 📁 Project Structure on Server

```
/var/www/thespecialistrealty/
├── .env                    # Your environment variables
├── .next/                  # Build output
├── node_modules/           # Dependencies
├── prisma/                 # Database schema
├── public/                 # Static files
├── src/                    # Your source code
└── package.json
```

---

## 🔐 Environment Variables

Create `/var/www/thespecialistrealty/.env` on your server with:

```env
# Database (PostgreSQL on same server)
DATABASE_URL="postgresql://appuser:your-password@localhost:5432/thespecialistrealty?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="https://yourdomain.com"

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# EmailJS (optional)
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="your-key"
NEXT_PUBLIC_EMAILJS_SERVICE_ID="your-service-id"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="your-template-id"

# reCAPTCHA (optional)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-site-key"
RECAPTCHA_SECRET_KEY="your-secret-key"

# Node Environment
NODE_ENV="production"
```

**Important:** Use the **same values** as your local `.env` to avoid differences!

---

## 🗄️ Database Setup (PostgreSQL on Server)

PostgreSQL is automatically installed and optimized during server setup. Now you need to create the database:

### Step 1: Create Database and User

SSH into your server and run:

```bash
ssh root@YOUR_DROPLET_IP

# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE thespecialistrealty;
CREATE USER appuser WITH PASSWORD 'your-secure-password-here';
GRANT ALL PRIVILEGES ON DATABASE thespecialistrealty TO appuser;
ALTER USER appuser CREATEDB;  # Allow creating databases (for migrations)
\q
```

**⚠️ Important:** Replace `'your-secure-password-here'` with a strong password!

### Step 2: Update Environment Variables

Update `/var/www/thespecialistrealty/.env`:

```env
# Database (PostgreSQL on same server)
DATABASE_URL="postgresql://appuser:your-secure-password-here@localhost:5432/thespecialistrealty?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="https://yourdomain.com"

# ... other variables
```

### Step 3: Run Migrations

```bash
cd /var/www/thespecialistrealty
npx prisma generate
npx prisma migrate deploy
npm run db:seed  # Optional: seed initial data
```

### Step 4: Verify Database Connection

```bash
# Test connection
npx prisma db pull

# Or using psql
psql -U appuser -d thespecialistrealty -h localhost
```

**✅ Done!** Your database is now set up on the server.

---

## 🔄 Alternative: Using External Database (Neon)

If you prefer to keep using Neon (external database):

1. **Skip PostgreSQL installation** (modify setup script)
2. **Use Neon connection string** in `.env`:
   ```env
   DATABASE_URL="postgresql://user:pass@neon-host/db?sslmode=require"
   ```

**Benefits of external database:**
- ✅ Less RAM usage on server
- ✅ Automatic backups
- ✅ Easier to scale
- ✅ Free tier available

**Benefits of database on server:**
- ✅ Everything in one place
- ✅ Lower latency (same server)
- ✅ Full control
- ✅ No external dependencies

---

## 🛠️ Useful Commands

### Check if app is running:
```bash
pm2 list
pm2 logs thespecialistrealty
pm2 status
```

### Restart app:
```bash
pm2 restart thespecialistrealty
```

### Stop app:
```bash
pm2 stop thespecialistrealty
```

### View logs:
```bash
pm2 logs thespecialistrealty --lines 100
```

### Check Nginx status:
```bash
systemctl status nginx
nginx -t  # Test config
```

### Check database connection:
```bash
cd /var/www/thespecialistrealty
npx prisma db pull
```

### PostgreSQL commands:
```bash
# Connect to database
sudo -u postgres psql -d thespecialistrealty

# Or as appuser
psql -U appuser -d thespecialistrealty -h localhost

# Check database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('thespecialistrealty'));"

# List all databases
sudo -u postgres psql -l

# Backup database
sudo -u postgres pg_dump thespecialistrealty > backup_$(date +%Y%m%d).sql

# Restore database
sudo -u postgres psql thespecialistrealty < backup_20240101.sql
```

---

## 🔍 Troubleshooting

### App won't start

```bash
# Check PM2 logs
pm2 logs thespecialistrealty

# Check if port 3000 is in use
lsof -i :3000

# Check environment variables
cd /var/www/thespecialistrealty
cat .env
```

### 502 Bad Gateway

```bash
# Check if app is running
pm2 list

# Check Nginx config
nginx -t

# Check if app is listening on port 3000
curl http://localhost:3000
```

### Database connection fails

```bash
# Test connection
cd /var/www/thespecialistrealty
npx prisma db pull

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### SSL certificate issues

```bash
# Renew certificate
certbot renew --dry-run

# Check certificate status
certbot certificates
```

### Can't access server

```bash
# Check firewall
ufw status

# Check if SSH is allowed
ufw allow 22/tcp
```

---

## 🔄 Automated Deployments (Optional)

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/thespecialistrealty
            git pull origin main
            npm install
            npm run build
            pm2 restart thespecialistrealty
```

Add secrets in GitHub:
- `DROPLET_IP`: Your droplet IP
- `SSH_PRIVATE_KEY`: Your SSH private key

---

## 📊 Monitoring (Optional)

### PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Uptime Monitoring

Use free services:
- **UptimeRobot** (https://uptimerobot.com) - Free 50 monitors
- **Pingdom** - Free tier available

---

## 🔒 Security Best Practices

1. **Keep system updated:**
   ```bash
   apt update && apt upgrade -y
   ```

2. **Use SSH keys** (not passwords)

3. **Firewall rules:**
   ```bash
   ufw allow 22/tcp   # SSH
   ufw allow 80/tcp   # HTTP
   ufw allow 443/tcp  # HTTPS
   ufw enable
   ```

4. **Regular backups:**
   ```bash
   # Backup database (if on server)
   pg_dump thespecialistrealty > backup_$(date +%Y%m%d).sql
   ```

5. **Keep Node.js updated:**
   ```bash
   npm install -g n
   n stable
   ```

---

## 💾 Memory Optimization for 1GB RAM Servers

Since you're using a 1GB RAM server with PostgreSQL, here are optimizations already in place:

### ✅ Already Optimized:
- **Swap file**: 1GB swap automatically created (prevents out-of-memory crashes)
- **PM2 memory limit**: Set to 300MB (auto-restarts if app uses too much)
- **PostgreSQL optimized**: Tuned for 1GB RAM (128MB shared_buffers, 20 max connections)
- **Images external**: Cloudinary doesn't use server RAM
- **Nginx**: Lightweight reverse proxy (~10-20MB RAM)

### 📊 Expected Memory Usage (With Database on Server):
```
System (Ubuntu):        ~200-300MB
PostgreSQL:             ~100-200MB (optimized)
Nginx:                  ~10-20MB
Next.js App:            ~200-400MB
PM2:                    ~10-20MB
Swap (when needed):     Variable
─────────────────────────────────
Total:                  ~600-900MB / 1GB ⚠️
```

**Note:** 1GB is tight but workable with swap. Consider 2GB ($12/month) for better performance.

### 🔍 Monitor Memory Usage:
```bash
# Check memory usage
free -h

# Check swap usage
swapon --show

# Check app memory
pm2 monit

# Check what's using memory
ps aux --sort=-%mem | head -10
```

### ⚠️ When to Upgrade to 2GB:
Upgrade if you see:
- Swap being used frequently (`swapon --show` shows high usage)
- App crashes due to memory (`pm2 logs` shows OOM errors)
- Slow response times (memory pressure)
- Traffic increases significantly (>1000 visitors/day)

**Upgrading is easy:** Just resize droplet in DigitalOcean dashboard (takes ~1 minute)

---

## 💡 Tips

1. **Database on server** = Everything in one place, easier management
2. **PostgreSQL optimized** = Tuned for 1GB RAM servers
3. **Use Cloudinary** = No image storage issues
4. **PM2 auto-restarts** = App stays running
5. **Nginx handles HTTPS** = Free SSL with Let's Encrypt
6. **1GB RAM works** = With swap file and optimizations (~600-900MB used)
7. **Easy upgrade** = Can resize to 2GB anytime if needed

---

## 📞 Need Help?

Common issues:
- **"Cannot connect to database"** → Check `DATABASE_URL` in `.env`, verify PostgreSQL is running: `systemctl status postgresql`
- **"502 Bad Gateway"** → Check if app is running: `pm2 list`
- **"Port already in use"** → Kill process: `lsof -i :3000` then `kill -9 PID`
- **"Build fails"** → Check Node.js version: `node -v` (should be 20+)
- **"Out of memory"** → Check memory: `free -h`, consider upgrading to 2GB
- **"Database connection refused"** → Check PostgreSQL: `systemctl status postgresql`, check firewall: `ufw status`

---

## ✅ Summary

**Code Changes:** Just 1 line (`output: 'standalone'` in `next.config.ts`)

**Deployment:** One command (`.\scripts\deploy.ps1`)

**Environment:** Same as local (same `.env` variables)

**Cost:** ~$7/month (1GB) or ~$13/month (2GB) - vs $19/month for Netlify Pro

**Control:** Full control over your server

**Maintenance:** Minimal (PM2 auto-restarts, Nginx handles HTTPS)

---

## 🎉 You're Done!

Your app is now running on DigitalOcean with:
- ✅ HTTPS/SSL (automatic)
- ✅ Auto-restart on crash (PM2)
- ✅ Easy updates (git pull + restart)
- ✅ Same environment as local
- ✅ Full control over server

Enjoy your new deployment! 🚀

