# Organize Cloudinary Listings Script

This script reorganizes existing Cloudinary listing images from a flat `listings/` folder structure into organized folders by listing title: `listings/{sanitized-title}/`

## What It Does

1. **Scans all listings** in your database
2. **Identifies images** that are in the old flat `listings/` folder (not already organized)
3. **Re-uploads** each image to the new organized folder structure using Cloudinary's upload-from-URL feature
4. **Updates the database** with the new image URLs

## Prerequisites

- Cloudinary must be configured with environment variables:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Database must be accessible (Prisma configured)

## Usage

```bash
npm run organize:listings
```

## How It Works

### Detection Logic

The script identifies images that need reorganization by checking if they're in the old structure:
- ✅ **Old structure** (needs reorganization): `listings/image.jpg`
- ✅ **New structure** (already organized): `listings/luxury-condo/image.jpg`

### Folder Naming

Listing titles are sanitized to create valid Cloudinary folder names:
- Converts to lowercase
- Replaces spaces with hyphens
- Removes special characters
- Limits to 100 characters

Example: `"Luxury Condo in Makati!"` → `listings/luxury-condo-in-makati/`

### Process

1. For each listing with Cloudinary images:
   - Checks if images are in the old folder structure
   - If yes, re-uploads them to `listings/{sanitized-title}/`
   - Updates the database with new URLs

2. **Rate Limiting**: Adds a 500ms delay between uploads to avoid Cloudinary rate limits

3. **Error Handling**: Continues processing even if individual images fail

## Output

The script provides detailed progress information:
- Listings processed
- Images reorganized
- Listings skipped (already organized or no images)
- Any errors encountered

## Important Notes

⚠️ **Old images remain in Cloudinary**: The script creates new copies in organized folders but doesn't delete the old images. You can manually delete them from the Cloudinary dashboard if desired.

⚠️ **Database is updated**: The script updates your database to point to the new organized folder structure.

⚠️ **Idempotent**: Running the script multiple times is safe - it only processes images that are in the old folder structure.

## Example Output

```
✅ Cloudinary configured
🔄 Starting organization of Cloudinary listings...

📊 Found 25 listings in database

📋 Processing "Luxury Condo in Makati":
   Found 5 image(s) to reorganize
   Target folder: listings/luxury-condo-in-makati
   ⬆️  Re-uploading image...
   ✅ Reorganized: https://res.cloudinary.com/...
   ✅ Updated database with 5 new image URL(s)

🎉 Organization Complete!
   📊 Listings processed: 20
   🖼️  Total images reorganized: 85
   ⏭️  Listings skipped: 5
```

