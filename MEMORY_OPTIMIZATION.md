# Memory Optimization Guide for 1GB RAM Server

## ✅ Why 1GB RAM Works for Your App (With Database on Server)

Your setup works on a 1GB RAM server with PostgreSQL:

1. **PostgreSQL database** - Uses ~100-200MB RAM (optimized) ✅
2. **Images are external** (Cloudinary) - Uses 0MB server RAM ✅
3. **Next.js app runs on server** - Uses ~200-400MB RAM ✅
4. **Nginx is lightweight** - Uses ~10-20MB RAM ✅
5. **System overhead** - Uses ~200-300MB RAM ✅
6. **Swap file (1GB)** - Provides safety buffer ✅

**Total: ~600-900MB used out of 1GB** - Tight but workable with swap! ⚠️

**Note:** 1GB is sufficient for low-medium traffic. Consider upgrading to 2GB ($12/month) for better performance and headroom.

---

## 📊 Memory Breakdown

### What Uses RAM on Your Server:

```
┌─────────────────────────────────────┐
│ Ubuntu System                       │ ~200-300MB
│ ├─ Kernel                           │
│ ├─ System services                  │
│ └─ Base processes                   │
├─────────────────────────────────────┤
│ PostgreSQL Database                 │ ~100-200MB
│ ├─ Shared buffers (128MB)          │
│ ├─ Connections                      │
│ └─ Query cache                     │
├─────────────────────────────────────┤
│ Nginx (Reverse Proxy)               │ ~10-20MB
├─────────────────────────────────────┤
│ Next.js Application                 │ ~200-400MB
│ ├─ Node.js runtime                 │
│ ├─ Next.js server                  │
│ └─ Your app code                   │
├─────────────────────────────────────┤
│ PM2 (Process Manager)               │ ~10-20MB
├─────────────────────────────────────┤
│ Swap (when needed)                  │ Variable
└─────────────────────────────────────┘
Total: ~600-900MB / 1GB (10-40% free)
```

### What Doesn't Use RAM (External Services):

- ✅ **Neon Database** - Runs on Neon's servers
- ✅ **Cloudinary Images** - Stored on Cloudinary's CDN
- ✅ **EmailJS** - Runs on EmailJS servers
- ✅ **reCAPTCHA** - Runs on Google's servers

---

## 🛡️ Safety Features Already Configured

### 1. Swap File (1GB)
- Automatically created during setup
- Acts as "overflow" memory
- Prevents crashes if RAM fills up
- Check: `free -h` or `swapon --show`

### 2. PM2 Memory Limit (300MB)
- App auto-restarts if it exceeds 300MB
- Prevents memory leaks from crashing server
- Check: `pm2 monit`

### 3. Optimized Build
- Next.js standalone output (smaller footprint)
- No unnecessary dependencies
- Efficient memory usage

---

## 🔍 Monitoring Commands

### Check Overall Memory:
```bash
free -h
```

Output example:
```
              total        used        free      shared  buff/cache   available
Mem:           1.0Gi       650Mi       200Mi        10Mi       200Mi       400Mi
Swap:          1.0Gi        50Mi       950Mi
```

**What to watch:**
- `available` should be > 100MB (you're good!)
- If `Swap` is being used frequently, consider upgrading

### Check App Memory:
```bash
pm2 monit
```

Shows real-time memory usage of your app.

### Check Swap Usage:
```bash
swapon --show
```

If swap is being used a lot, you might want to upgrade.

### Check Top Memory Users:
```bash
ps aux --sort=-%mem | head -10
```

Shows which processes use the most memory.

---

## ⚠️ Warning Signs (When to Upgrade)

### Upgrade to 2GB if you see:

1. **High Swap Usage**
   ```bash
   swapon --show  # Shows swap is frequently used
   ```
   - Swap is slow (disk-based)
   - Frequent swap usage = performance degradation

2. **App Crashes**
   ```bash
   pm2 logs thespecialistrealty | grep -i "out of memory"
   ```
   - OOM (Out of Memory) errors
   - App restarts frequently

3. **Slow Response Times**
   - Pages load slowly
   - API responses are delayed
   - Memory pressure causes slowdowns

4. **High Traffic**
   - >1000 visitors/day
   - Multiple concurrent users
   - Heavy database queries

---

## 🚀 How to Upgrade (If Needed)

Upgrading is **super easy** and takes ~1 minute:

1. Go to DigitalOcean dashboard
2. Click on your droplet
3. Click **"Resize"**
4. Choose **2GB RAM** ($12/month)
5. Click **"Resize Droplet"**
6. Wait 1 minute
7. Done! ✅

**No code changes needed!** Your app will automatically use more RAM.

---

## 💡 Optimization Tips

### Already Optimized:
- ✅ Using external database (Neon)
- ✅ Using external image storage (Cloudinary)
- ✅ Next.js standalone build
- ✅ PM2 memory limits
- ✅ Swap file configured
- ✅ Nginx (lightweight reverse proxy)

### Additional Optimizations (Optional):

1. **Disable Unused Services:**
   ```bash
   # Check what's running
   systemctl list-units --type=service --state=running
   
   # Disable unused services (be careful!)
   systemctl disable service-name
   ```

2. **Clear Logs Regularly:**
   ```bash
   # PM2 already configured to rotate logs
   # But you can manually clear old logs:
   pm2 flush
   ```

3. **Monitor Build Size:**
   ```bash
   # Check .next folder size
   du -sh /var/www/thespecialistrealty/.next
   ```

---

## 📈 Expected Performance

### With 1GB RAM:
- ✅ **Up to 50 concurrent users** - Smooth
- ✅ **Up to 1000 visitors/day** - No issues
- ✅ **Fast page loads** - <2 seconds
- ✅ **Stable uptime** - 99.9%+

### Traffic Estimates:
- **Low traffic**: 0-100 visitors/day → 1GB is perfect ✅
- **Medium traffic**: 100-500 visitors/day → 1GB still works ✅
- **High traffic**: 500-1000 visitors/day → 1GB might need upgrade ⚠️
- **Very high traffic**: 1000+ visitors/day → Upgrade to 2GB+ 📈

---

## ✅ Summary

**1GB RAM is perfect for your setup because:**
- Database is external (Neon) ✅
- Images are external (Cloudinary) ✅
- Only Next.js app uses RAM ✅
- Swap file provides safety buffer ✅
- PM2 prevents memory leaks ✅

**You can start with $6/month and upgrade later if needed!**

---

## 🎯 Quick Checklist

- [x] Swap file configured (1GB)
- [x] PM2 memory limit set (300MB)
- [x] External database (Neon)
- [x] External images (Cloudinary)
- [x] Optimized Next.js build
- [x] Monitoring commands ready

**You're all set!** 🚀

