# Cloudinary Setup Guide

## Why Cloudinary?

When deploying to Netlify, the file system is **ephemeral** - any files uploaded after deployment are lost when the server restarts. Cloudinary provides:

- ✅ **Persistent storage** - Images uploaded after deployment are permanently stored
- ✅ **CDN delivery** - Images are served from Cloudinary's global CDN (faster loading)
- ✅ **Automatic optimization** - Cloudinary automatically optimizes images
- ✅ **Transformations** - Easy image resizing, cropping, and format conversion

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account (includes 25 GB storage and 25 GB bandwidth/month)
3. After signing up, you'll be taken to your dashboard

### 2. Get Your Cloudinary Credentials

From your Cloudinary dashboard:

1. Copy your **Cloud Name** (visible in the dashboard)
2. Go to **Settings** → **Security** → **API Keys**
3. Copy your **API Key** and **API Secret**

### 3. Add Environment Variables to Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Optional: Add to Local .env File

For local development (optional - will use local file storage if not set):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Deletion Sync and Retry (Optional but Recommended)

To keep Cloudinary in sync when listing images are removed during edit:

```env
# Safe rollout toggle (start false, then set true after validation)
CLOUDINARY_DELETE_ON_LISTING_UPDATE=false

# Keep false for best-effort cleanup behavior
CLOUDINARY_DELETE_STRICT=false

# Retry worker tuning
CLOUDINARY_DELETE_RETRY_MAX_ATTEMPTS=5
CLOUDINARY_DELETE_RETRY_BATCH_SIZE=25

# Protect cron endpoint: POST /api/cron/cloudinary-cleanup
CLOUDINARY_CLEANUP_CRON_SECRET=your_cron_secret
```

When enabled, image removals from listing edits are deleted from Cloudinary after successful listing save.
Failed deletes are queued and retried by the cron endpoint.

## How It Works

- **Production (Cloudinary configured)**: New image uploads go directly to Cloudinary
- **Development (Cloudinary not configured)**: Images are saved locally to `public/uploads/listings/`

## Initial Images

The existing images in `public/uploads/listings/` are:
- ✅ **Committed to git** for initial deployment
- ✅ **Included in the seed script** to populate listings on first deploy
- ✅ **Served from your Netlify site** for the initial listings

After deployment:
- New uploads will automatically use Cloudinary (if configured)
- Initial images remain in git and continue to work

## Free Tier Limits

Cloudinary's free tier includes:
- **25 GB** storage
- **25 GB** bandwidth per month
- All optimization features
- CDN delivery

This is typically sufficient for small to medium real estate websites.

## Migration from Local to Cloudinary

If you want to migrate existing images to Cloudinary:

1. Install Cloudinary CLI: `npm install -g cloudinary-cli`
2. Use Cloudinary's upload API or dashboard to upload your images
3. Update your database to use the new Cloudinary URLs

The seed script will continue to work with local image paths for initial deployment.

