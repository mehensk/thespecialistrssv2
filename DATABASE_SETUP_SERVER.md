# Database Setup on DigitalOcean Server

## 🎯 Quick Setup Guide

This guide shows you how to set up PostgreSQL on your DigitalOcean server.

---

## ✅ Automatic Setup (During Deployment)

The deployment script (`deploy.sh` or `deploy.ps1`) automatically:
- ✅ Creates database `thespecialistrealty`
- ✅ Creates user `appuser` with password `changeme123`
- ✅ Grants all privileges
- ✅ Runs migrations

**⚠️ Important:** After first deployment, **change the default password!**

---

## 🔧 Manual Setup (If Needed)

### Step 1: SSH into Server

```bash
ssh root@YOUR_DROPLET_IP
```

### Step 2: Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE thespecialistrealty;

# Create user with secure password
CREATE USER appuser WITH PASSWORD 'your-secure-password-here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE thespecialistrealty TO appuser;

# Allow user to create databases (needed for migrations)
ALTER USER appuser CREATEDB;

# Exit psql
\q
```

**⚠️ Security:** Use a strong password! Generate one with:
```bash
openssl rand -base64 32
```

### Step 3: Update Environment Variables

Edit your `.env` file:

```bash
cd /var/www/thespecialistrealty
nano .env
```

Add/update:

```env
DATABASE_URL="postgresql://appuser:your-secure-password-here@localhost:5432/thespecialistrealty?schema=public"
```

### Step 4: Run Migrations

```bash
cd /var/www/thespecialistrealty
npx prisma generate
npx prisma migrate deploy
```

### Step 5: Seed Database (Optional)

```bash
npm run db:seed
```

---

## 🔐 Change Database Password

If you want to change the password after initial setup:

```bash
# Connect as postgres user
sudo -u postgres psql

# Change password
ALTER USER appuser WITH PASSWORD 'new-secure-password';

# Exit
\q

# Update .env file
cd /var/www/thespecialistrealty
nano .env
# Update DATABASE_URL with new password

# Restart app (to reload .env)
pm2 restart thespecialistrealty
```

---

## 📊 Database Management

### Connect to Database

```bash
# As postgres superuser
sudo -u postgres psql -d thespecialistrealty

# As appuser
psql -U appuser -d thespecialistrealty -h localhost
```

### Check Database Size

```bash
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('thespecialistrealty'));"
```

### List All Tables

```bash
sudo -u postgres psql -d thespecialistrealty -c "\dt"
```

### Check Connection Count

```bash
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'thespecialistrealty';"
```

---

## 💾 Backup Database

### Manual Backup

```bash
# Create backup
sudo -u postgres pg_dump thespecialistrealty > /var/backups/thespecialistrealty_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip /var/backups/thespecialistrealty_*.sql
```

### Automated Daily Backup

Create a cron job:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * sudo -u postgres pg_dump thespecialistrealty | gzip > /var/backups/thespecialistrealty_$(date +\%Y\%m\%d).sql.gz

# Keep only last 7 days
0 3 * * * find /var/backups -name "thespecialistrealty_*.sql.gz" -mtime +7 -delete
```

### Restore from Backup

```bash
# Uncompress if needed
gunzip backup_file.sql.gz

# Restore
sudo -u postgres psql thespecialistrealty < backup_file.sql
```

---

## 🔍 Troubleshooting

### Database Connection Fails

```bash
# Check if PostgreSQL is running
systemctl status postgresql

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log

# Test connection
psql -U appuser -d thespecialistrealty -h localhost
```

### Permission Denied

```bash
# Check user permissions
sudo -u postgres psql -c "\du appuser"

# Grant permissions again
sudo -u postgres psql << PSQL
GRANT ALL PRIVILEGES ON DATABASE thespecialistrealty TO appuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO appuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO appuser;
PSQL
```

### Database Full / Out of Space

```bash
# Check disk usage
df -h

# Check database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('thespecialistrealty'));"

# Check table sizes
sudo -u postgres psql -d thespecialistrealty -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### Reset Database (⚠️ Deletes All Data!)

```bash
# ⚠️ WARNING: This deletes all data!
sudo -u postgres psql << PSQL
DROP DATABASE IF EXISTS thespecialistrealty;
CREATE DATABASE thespecialistrealty;
GRANT ALL PRIVILEGES ON DATABASE thespecialistrealty TO appuser;
PSQL

# Run migrations again
cd /var/www/thespecialistrealty
npx prisma migrate deploy
npm run db:seed
```

---

## ⚙️ PostgreSQL Optimization for 1GB RAM

PostgreSQL is already optimized during server setup with these settings:

```conf
shared_buffers = 128MB          # Memory for caching
effective_cache_size = 256MB     # Estimated OS cache
maintenance_work_mem = 32MB      # Memory for maintenance
work_mem = 4MB                   # Memory per query
max_connections = 20              # Max concurrent connections
```

These settings ensure PostgreSQL uses minimal RAM while still performing well.

### View Current Settings

```bash
sudo -u postgres psql -c "SHOW shared_buffers;"
sudo -u postgres psql -c "SHOW max_connections;"
```

### Adjust Settings (If Needed)

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/14/main/postgresql.conf

# After editing, restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 🔒 Security Best Practices

1. **Use Strong Passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   ```

2. **Limit Network Access**
   - PostgreSQL only listens on localhost (default)
   - Don't expose port 5432 to internet

3. **Regular Backups**
   - Set up automated daily backups
   - Test restore process

4. **Keep PostgreSQL Updated**
   ```bash
   apt update && apt upgrade postgresql
   ```

5. **Monitor Logs**
   ```bash
   tail -f /var/log/postgresql/postgresql-*.log
   ```

---

## 📈 Performance Monitoring

### Check Query Performance

```bash
sudo -u postgres psql -d thespecialistrealty -c "
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
"
```

### Check Index Usage

```bash
sudo -u postgres psql -d thespecialistrealty -c "
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;
"
```

---

## ✅ Summary

**Database Setup Checklist:**
- [x] PostgreSQL installed (automatic)
- [x] Database created: `thespecialistrealty`
- [x] User created: `appuser`
- [x] Permissions granted
- [x] Migrations run
- [x] Password changed from default
- [x] Backups configured (optional but recommended)

**Your database is ready!** 🎉

