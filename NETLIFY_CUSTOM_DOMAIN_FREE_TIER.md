# Using Custom Domain on Netlify Free Tier

## ✅ Short Answer: YES, You Can Use a Custom Domain for FREE!

**Netlify allows custom domains on their free plan.** You can buy a domain and connect it to your Netlify site without upgrading to a paid plan.

---

## What's Included in Netlify Free Tier

### ✅ What You Get for FREE:

1. **Custom Domain Support** ✅
   - Connect your own domain (e.g., `thespecialistrealty.com`)
   - SSL/HTTPS certificate (automatic, free)
   - DNS management
   - Multiple domains per site

2. **Hosting Limits** (Free Tier):
   - **100 GB bandwidth/month** - Usually enough for small to medium sites
   - **300 build minutes/month** - For building your Next.js app
   - **Unlimited sites** - You can host multiple sites
   - **Unlimited requests** - API requests are unlimited

3. **Features**:
   - Automatic HTTPS/SSL
   - CDN (Content Delivery Network)
   - Form handling (up to 100 submissions/month)
   - Branch previews
   - Deploy previews

### ⚠️ Free Tier Limitations:

1. **Netlify Branding**
   - Small "Netlify" callout/badge appears on your site
   - Only visible when using a custom domain
   - Can be removed by upgrading to Pro ($19/month)

2. **Bandwidth**
   - 100 GB/month included
   - If you exceed, you'll need to upgrade or pay overage

3. **Build Minutes**
   - 300 minutes/month included
   - For a Next.js app, each build takes ~2-5 minutes
   - You get ~60-150 builds per month (usually plenty)

4. **Form Submissions**
   - 100 submissions/month on free tier
   - If you have contact forms, this might be limiting

---

## Cost Breakdown

### Option 1: Free Tier + Custom Domain
| Item | Cost |
|------|------|
| **Netlify Hosting** | $0/month (FREE) |
| **Domain** | $10-15/year (~$1/month) |
| **SSL Certificate** | $0 (included) |
| **Total** | **~$1/month** |

### Option 2: Pro Tier + Custom Domain (No Branding)
| Item | Cost |
|------|------|
| **Netlify Hosting** | $19/month |
| **Domain** | $10-15/year (~$1/month) |
| **SSL Certificate** | $0 (included) |
| **Total** | **~$20/month** |

---

## Setting Up Your Custom Domain

### Step 1: Buy a Domain

**Recommended Domain Registrars:**
- **Namecheap**: ~$10-12/year, easy to use
- **Google Domains**: ~$12/year, simple interface
- **Cloudflare**: ~$8-10/year, cheapest option
- **GoDaddy**: ~$12-15/year, popular but more expensive

**Domain Name Ideas:**
- `thespecialistrealty.com`
- `specialistrealty.com`
- `tsrealty.com`
- `specialistrealestate.com`

### Step 2: Add Domain to Netlify

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com/
   - Click on your site

2. **Add Custom Domain**
   - Go to: **Site settings** → **Domain management**
   - Click: **"Add a domain"** or **"Add custom domain"**
   - Enter your domain: `thespecialistrealty.com`
   - Click **"Verify"**

3. **Netlify Will Show DNS Settings**
   - You'll see DNS records to add
   - Usually something like:
     ```
     Type: A
     Name: @
     Value: 75.2.60.5
     
     Type: CNAME
     Name: www
     Value: your-site.netlify.app
     ```

### Step 3: Update DNS at Your Domain Registrar

1. **Log into your domain registrar** (Namecheap, Google, etc.)
2. **Go to DNS settings**
3. **Add the DNS records** that Netlify provided
4. **Save changes**

### Step 4: Wait for DNS Propagation

- Usually takes **5 minutes to 48 hours**
- Most often completes in **15-30 minutes**
- Netlify will show "DNS configuration detected" when ready

### Step 5: Update Your Environment Variables

**Update `NEXTAUTH_URL` in Netlify:**

1. Go to: **Site settings** → **Environment variables**
2. Update `NEXTAUTH_URL`:
   ```
   OLD: NEXTAUTH_URL="https://your-site.netlify.app"
   NEW: NEXTAUTH_URL="https://thespecialistrealty.com"
   ```
3. **Redeploy** your site (or trigger a new deploy)

---

## Will You Stay Within Free Limits?

### For a Real Estate Website:

**Bandwidth (100 GB/month):**
- ✅ **Usually enough** for small to medium sites
- Each page load: ~500KB - 2MB
- 100 GB = ~50,000 - 200,000 page views/month
- **You'll likely stay within limits** unless you get very high traffic

**Build Minutes (300/month):**
- ✅ **Plenty for development**
- Each build: ~2-5 minutes
- 300 minutes = ~60-150 builds/month
- **You'll likely never hit this limit**

**Form Submissions (100/month):**
- ⚠️ **Might be limiting** if you have contact forms
- 100 submissions = ~3-4 per day
- If you get more, consider upgrading or using EmailJS directly

---

## The Netlify Branding (Free Tier)

### What It Looks Like:
- Small "Netlify" badge/callout in the corner
- Usually bottom-right or bottom-left
- Not very intrusive, but visible

### To Remove It:
- Upgrade to **Pro plan** ($19/month)
- Removes all branding
- Also gives you:
  - 1,000 GB bandwidth/month
  - 1,000 build minutes/month
  - 1,000 form submissions/month
  - Priority support

---

## Recommendation

### Start with Free Tier + Custom Domain:

✅ **Do this if:**
- You're just starting out
- You don't mind the small Netlify badge
- Your traffic is low to medium
- You want to save money

**Cost:** ~$1/month (just the domain)

### Upgrade to Pro Later If:
- You want to remove the branding
- You're getting high traffic (>100GB/month)
- You need more form submissions
- You want priority support

**Cost:** ~$20/month (hosting + domain)

---

## Quick Setup Checklist

- [ ] Buy domain from registrar (~$10-15/year)
- [ ] Add domain to Netlify dashboard
- [ ] Copy DNS records from Netlify
- [ ] Add DNS records to domain registrar
- [ ] Wait for DNS propagation (15-30 min)
- [ ] Update `NEXTAUTH_URL` in Netlify environment variables
- [ ] Redeploy site
- [ ] Test: Visit `https://yourdomain.com`

---

## Troubleshooting

### Domain Not Working?

1. **Check DNS propagation:**
   - Use: https://www.whatsmydns.net/
   - Enter your domain
   - Check if DNS records are propagated

2. **Verify DNS records:**
   - Make sure you added the exact records Netlify provided
   - Check for typos in IP addresses

3. **Wait longer:**
   - DNS can take up to 48 hours (rare)
   - Usually works within 30 minutes

4. **Check Netlify dashboard:**
   - Go to Domain management
   - See if there are any errors or warnings

### SSL Certificate Issues?

- Netlify automatically provisions SSL certificates
- Usually takes 5-10 minutes after DNS is configured
- If it's taking longer, contact Netlify support

---

## Summary

**YES, you can use a custom domain on Netlify's free tier!**

- ✅ **Free hosting** with custom domain
- ✅ **Free SSL certificate**
- ✅ **100 GB bandwidth/month** (usually enough)
- ✅ **300 build minutes/month** (plenty)
- ⚠️ **Small Netlify branding** (can remove with Pro plan)
- ⚠️ **100 form submissions/month** (might be limiting)

**Total Cost:** Just the domain (~$10-15/year = ~$1/month)

**Recommendation:** Start with free tier + custom domain. Upgrade to Pro ($19/month) later if you need to remove branding or need more resources.





