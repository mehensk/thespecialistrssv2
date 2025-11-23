# Quick Cloudinary Setup Guide

## Step 1: Create Cloudinary Account (2 minutes)

1. Go to **https://cloudinary.com**
2. Click **"Sign Up"** (top right)
3. Sign up with:
   - Email
   - Password
   - Company/Project name (optional)
4. Verify your email if prompted

**Free tier includes:**
- 25 GB storage
- 25 GB bandwidth/month
- All features enabled

## Step 2: Get Your Credentials (1 minute)

After signing up, you'll see your **Dashboard**:

1. **Cloud Name** - Visible at the top of dashboard (looks like: `dxample123`)

2. **API Key & Secret:**
   - Click **"Settings"** (gear icon) in the top menu
   - Go to **"Security"** tab
   - Scroll to **"API Keys"** section
   - You'll see:
     - **API Key** (looks like: `123456789012345`)
     - **API Secret** (click "Reveal" to see it, looks like: `abcDEF123ghi456JKL`)

## Step 3: Add to Your .env File

Add these three lines to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Replace with your actual values!**

## Step 4: Restart Your Dev Server

After adding the variables:

```bash
# Stop your server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 5: Test It!

Now when you upload images through your app:
- They'll be uploaded to Cloudinary automatically
- You'll see them in your Cloudinary dashboard under "Media Library" → "listings" folder

## Step 6: Add to Netlify (For Production)

1. Go to your Netlify site dashboard
2. Navigate to: **Site settings** → **Environment variables**
3. Click **"Add a variable"**
4. Add each variable:
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_API_KEY` = your API key
   - `CLOUDINARY_API_SECRET` = your API secret
5. Click **"Save"**
6. Redeploy your site (or trigger a new deploy)

---

**That's it!** Your images will now be stored permanently in Cloudinary. 🎉

