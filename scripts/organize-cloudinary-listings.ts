// Script to reorganize existing Cloudinary listing images into folders by listing title
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { sanitizeFolderName, isCloudinaryConfigured } from '../src/lib/cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

interface ImageMapping {
  oldUrl: string;
  newUrl: string;
}

/**
 * Checks if a Cloudinary URL is in the old flat "listings" folder
 * (not in a subfolder like "listings/title-name")
 */
function isInOldFolder(url: string): boolean {
  if (!url.includes('cloudinary.com')) return false;
  
  // Extract the path from the URL
  // Cloudinary URLs can look like:
  // - https://res.cloudinary.com/cloud_name/image/upload/v1234567890/listings/image.jpg (old)
  // - https://res.cloudinary.com/cloud_name/image/upload/v1234567890/listings/title-name/image.jpg (new)
  // - https://res.cloudinary.com/cloud_name/image/upload/listings/image.jpg (old, no version)
  // - https://res.cloudinary.com/cloud_name/image/upload/listings/title-name/image.jpg (new, no version)
  
  const urlParts = url.split('/');
  const uploadIndex = urlParts.findIndex(part => part === 'upload');
  
  if (uploadIndex === -1) return false;
  
  // Get everything after "upload"
  const pathAfterUpload = urlParts.slice(uploadIndex + 1);
  const listingsIndex = pathAfterUpload.findIndex(part => part === 'listings');
  
  if (listingsIndex === -1) return false;
  
  // Get everything after "listings"
  const afterListings = pathAfterUpload.slice(listingsIndex + 1);
  
  if (afterListings.length === 0) return false;
  
  // The first item after "listings" could be:
  // 1. A version number (v1234567890) - skip it
  // 2. A folder name (like "luxury-condo") - already organized
  // 3. A filename (like "image.jpg") - old structure
  
  let firstItem = afterListings[0];
  
  // If it starts with 'v' and is all digits, it's a version number - check the next item
  if (firstItem.startsWith('v') && /^v\d+$/.test(firstItem)) {
    if (afterListings.length < 2) return false;
    firstItem = afterListings[1];
  }
  
  // If the first item after listings (or after version) contains a dot, it's likely a filename (old structure)
  // If it doesn't contain a dot, it's likely a folder name (new structure)
  if (firstItem.includes('.')) {
    return true; // Old structure: listings/image.jpg
  } else {
    return false; // New structure: listings/folder-name/image.jpg
  }
}

/**
 * Re-uploads an image from Cloudinary URL to a new folder structure
 */
async function reuploadToFolder(imageUrl: string, folderName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Use Cloudinary's upload from URL feature
    cloudinary.uploader.upload(
      imageUrl,
      {
        folder: folderName,
        format: 'jpg',
        quality: 'auto:good',
        fetch_format: 'auto',
        // Preserve the original image quality
        overwrite: false, // Don't overwrite if file exists
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );
  });
}

async function organizeCloudinaryListings() {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      console.error('❌ Cloudinary is not configured!');
      console.error('Please add these to your .env file:');
      console.error('  CLOUDINARY_CLOUD_NAME');
      console.error('  CLOUDINARY_API_KEY');
      console.error('  CLOUDINARY_API_SECRET');
      process.exit(1);
    }

    console.log('✅ Cloudinary configured');
    console.log('🔄 Starting organization of Cloudinary listings...\n');

    // Get all listings from database
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        images: true,
      },
    });

    console.log(`📊 Found ${listings.length} listings in database\n`);

    if (listings.length === 0) {
      console.log('⚠️  No listings found. Nothing to organize.');
      return;
    }

    let totalListingsProcessed = 0;
    let totalImagesReorganized = 0;
    let totalListingsSkipped = 0;
    let totalErrors = 0;

    // Process each listing
    for (const listing of listings) {
      if (!listing.images || listing.images.length === 0) {
        console.log(`⏭️  Skipping "${listing.title}" (no images)`);
        totalListingsSkipped++;
        continue;
      }

      // Filter Cloudinary images that are in the old folder structure
      const cloudinaryImages = listing.images.filter(
        img => img.includes('cloudinary.com') && isInOldFolder(img)
      );

      if (cloudinaryImages.length === 0) {
        console.log(`✅ "${listing.title}" - Already organized or no Cloudinary images`);
        totalListingsSkipped++;
        continue;
      }

      console.log(`\n📋 Processing "${listing.title}":`);
      console.log(`   Found ${cloudinaryImages.length} image(s) to reorganize`);

      // Sanitize the listing title for folder name
      const folderName = `listings/${sanitizeFolderName(listing.title)}`;
      console.log(`   Target folder: ${folderName}`);

      const imageMapping: ImageMapping[] = [];
      let imagesReorganized = 0;
      let imagesErrored = 0;

      // Re-upload each image to the new folder
      for (const oldUrl of cloudinaryImages) {
        try {
          console.log(`   ⬆️  Re-uploading image...`);
          
          const newUrl = await reuploadToFolder(oldUrl, folderName);
          
          imageMapping.push({
            oldUrl,
            newUrl,
          });

          imagesReorganized++;
          console.log(`   ✅ Reorganized: ${newUrl.substring(0, 80)}...`);
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error: any) {
          imagesErrored++;
          console.error(`   ❌ Error reorganizing image: ${error.message}`);
          totalErrors++;
        }
      }

      if (imageMapping.length === 0) {
        console.log(`   ⚠️  No images were successfully reorganized for this listing`);
        continue;
      }

      // Update the listing in the database with new URLs
      const updatedImages = listing.images.map(imageUrl => {
        const mapping = imageMapping.find(m => m.oldUrl === imageUrl);
        return mapping ? mapping.newUrl : imageUrl;
      });

      try {
        await prisma.listing.update({
          where: { id: listing.id },
          data: { images: updatedImages },
        });

        totalListingsProcessed++;
        totalImagesReorganized += imagesReorganized;
        console.log(`   ✅ Updated database with ${imagesReorganized} new image URL(s)`);
      } catch (error: any) {
        console.error(`   ❌ Error updating database: ${error.message}`);
        totalErrors++;
      }
    }

    console.log(`\n\n🎉 Organization Complete!`);
    console.log(`   📊 Listings processed: ${totalListingsProcessed}`);
    console.log(`   🖼️  Total images reorganized: ${totalImagesReorganized}`);
    console.log(`   ⏭️  Listings skipped: ${totalListingsSkipped}`);
    if (totalErrors > 0) {
      console.log(`   ⚠️  Errors encountered: ${totalErrors}`);
    }
    console.log(`\n💡 Note: Old images in Cloudinary are still there.`);
    console.log(`   You can manually delete them from the Cloudinary dashboard if desired.`);
    console.log(`   The database now points to the new organized folder structure.\n`);
  } catch (error) {
    console.error('❌ Organization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

organizeCloudinaryListings();

