# Setting Cloudinary Variables in Netlify

## ⚠️ Important: Cloudinary is Required for Image Uploads on Netlify

On Netlify (serverless environment), **Cloudinary is required** for image uploads. Without it:
- ✅ Your app will build and deploy successfully
- ✅ Authentication, listings, blogs will all work
- ❌ **Image uploads will fail** with a 500 error

---

## Quick Setup Guide

### Step 1: Get Your Cloudinary Credentials

If you already have a Cloudinary account, skip to Step 2. Otherwise:

1. **Sign up at [cloudinary.com](https://cloudinary.com)** (free tier includes 25GB storage)
2. **Get your credentials:**
   - **Cloud Name**: Visible at the top of your dashboard (e.g., `dxksfl9sk`)
   - **API Key**: Go to **Settings** → **Security** → **API Keys** (e.g., `951144714358886`)
   - **API Secret**: Same page, click "Reveal" (e.g., `7QkAmyiCks3XGsZdT4jYotIZu9c`)

### Step 2: Set Variables in Netlify Dashboard

1. **Go to your Netlify site dashboard**
2. **Navigate to:** **Site settings** → **Environment variables**
3. **Click "Add a variable"** for each of these three:

#### Variable 1: `CLOUDINARY_CLOUD_NAME`
- **Key:** `CLOUDINARY_CLOUD_NAME`
- **Value:** Your cloud name (e.g., `dxksfl9sk`)
- **Scope:** Production (and Deploy previews if needed)

#### Variable 2: `CLOUDINARY_API_KEY`
- **Key:** `CLOUDINARY_API_KEY`
- **Value:** Your API key (e.g., `951144714358886`)
- **Scope:** Production (and Deploy previews if needed)

#### Variable 3: `CLOUDINARY_API_SECRET`
- **Key:** `CLOUDINARY_API_SECRET`
- **Value:** Your API secret (e.g., `7QkAmyiCks3XGsZdT4jYotIZu9c`)
- **Scope:** Production (and Deploy previews if needed)

4. **Click "Save"** after adding each variable

### Step 3: Redeploy Your Site

After adding the variables, you need to trigger a new deployment:

**Option A: Automatic (if using Git)**
- Push a new commit to your repository
- Netlify will automatically redeploy with the new environment variables

**Option B: Manual**
1. Go to **Deploys** tab in Netlify dashboard
2. Click **"Trigger deploy"** → **"Deploy site"**
3. This will rebuild with the new environment variables

---

## What Happens If Cloudinary Is Not Set?

### ✅ What Still Works:
- App builds successfully
- Authentication (login/logout)
- Viewing listings and blogs
- All read operations
- Database operations

### ❌ What Won't Work:
- **Image uploads** (creating/editing listings with images)
- **Blog image uploads**
- Any feature that requires uploading images

**Error you'll see:**
```json
{
  "error": "Image upload service not configured. Please configure Cloudinary for production deployments.",
  "details": "Cloudinary is required on Netlify. See CLOUDINARY_SETUP.md for instructions."
}
```

---

## Verification

After setting the variables and redeploying:

1. **Check the build logs** - Should show Cloudinary connection successful
2. **Test image upload** - Try creating/editing a listing with an image
3. **Check Cloudinary dashboard** - Uploaded images should appear in your Media Library

---

## Your Current Cloudinary Credentials (from local testing)

Based on your local environment, you should use:

```
CLOUDINARY_CLOUD_NAME=dxksfl9sk
CLOUDINARY_API_KEY=951144714358886
CLOUDINARY_API_SECRET=7QkAmyiCks3XGsZdT4jYotIZu9c
```

**⚠️ Important:** Make sure these are the correct values from your Cloudinary dashboard. If you're not sure, check your local `.env` file or Cloudinary dashboard.

---

## Troubleshooting

### Issue: "Cloudinary configuration incomplete"
**Cause:** Only some Cloudinary variables are set (not all three)
**Solution:** Make sure all three variables are set in Netlify

### Issue: Image uploads still failing after setting variables
**Cause:** Variables not applied to current deployment
**Solution:** Trigger a new deployment after adding variables

### Issue: Can't find Cloudinary credentials
**Solution:** 
1. Log into [cloudinary.com](https://cloudinary.com)
2. Check dashboard for Cloud Name
3. Go to Settings → Security → API Keys for API Key and Secret

---

## Next Steps

After setting Cloudinary variables:
1. ✅ Redeploy your site
2. ✅ Test image upload functionality
3. ✅ Verify images appear in Cloudinary dashboard
4. ✅ Your app is now fully functional on Netlify! 🎉

