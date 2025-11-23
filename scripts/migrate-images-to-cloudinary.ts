// Script to migrate existing listing images from local storage to Cloudinary
import { PrismaClient } from '@prisma/client';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { uploadToCloudinary, isCloudinaryConfigured } from '../src/lib/cloudinary';

const prisma = new PrismaClient();

interface ImageMapping {
  oldPath: string;
  newUrl: string;
}

async function migrateImagesToCloudinary() {
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
    console.log('🔄 Starting image migration...\n');

    // Get all listing images from public/uploads/listings
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'listings');
    let imageFiles: string[] = [];

    try {
      const files = await readdir(uploadsDir);
      imageFiles = files.filter(file => 
        file.toLowerCase().endsWith('.jpg') || 
        file.toLowerCase().endsWith('.jpeg') || 
        file.toLowerCase().endsWith('.png') ||
        file.toLowerCase().endsWith('.webp')
      );
      console.log(`📁 Found ${imageFiles.length} image files in uploads directory\n`);
    } catch (error) {
      console.error('❌ Error reading uploads directory:', error);
      process.exit(1);
    }

    if (imageFiles.length === 0) {
      console.log('⚠️  No images found to migrate');
      return;
    }

    // Get all listings from database
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        images: true,
      },
    });

    console.log(`📊 Found ${listings.length} listings in database\n`);

    // Create mapping of old paths to new Cloudinary URLs
    const imageMapping: ImageMapping[] = [];
    let uploadedCount = 0;
    let skippedCount = 0;

    // Upload each image to Cloudinary
    for (const filename of imageFiles) {
      const oldPath = `/uploads/listings/${filename}`;
      
      // Check if this image is used in any listing
      const isUsed = listings.some(listing => 
        listing.images && listing.images.includes(oldPath)
      );

      if (!isUsed) {
        console.log(`⏭️  Skipping ${filename} (not used in any listing)`);
        skippedCount++;
        continue;
      }

      try {
        console.log(`⬆️  Uploading ${filename}...`);
        
        // Read the image file
        const filePath = join(uploadsDir, filename);
        const imageBuffer = await readFile(filePath);

        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(
          imageBuffer,
          'listings',
          undefined // Let Cloudinary handle dimensions
        );

        imageMapping.push({
          oldPath,
          newUrl: cloudinaryUrl,
        });

        uploadedCount++;
        console.log(`✅ Uploaded: ${cloudinaryUrl}\n`);
      } catch (error: any) {
        console.error(`❌ Error uploading ${filename}:`, error.message);
        continue;
      }
    }

    console.log(`\n📈 Upload Summary:`);
    console.log(`   ✅ Uploaded: ${uploadedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}\n`);

    if (imageMapping.length === 0) {
      console.log('⚠️  No images were uploaded. Nothing to update in database.');
      return;
    }

    // Update database listings with new Cloudinary URLs
    console.log('🔄 Updating database with Cloudinary URLs...\n');
    
    let updatedListings = 0;
    let totalImagesReplaced = 0;

    for (const listing of listings) {
      if (!listing.images || listing.images.length === 0) {
        continue;
      }

      // Replace old paths with new Cloudinary URLs
      const updatedImages = listing.images.map(imagePath => {
        const mapping = imageMapping.find(m => m.oldPath === imagePath);
        if (mapping) {
          return mapping.newUrl;
        }
        return imagePath; // Keep as-is if not in mapping (already Cloudinary or other)
      });

      // Check if any images were actually updated
      const hasChanges = updatedImages.some((img, idx) => img !== listing.images[idx]);

      if (hasChanges) {
        // Count how many images were replaced
        const replacedCount = updatedImages.filter((img, idx) => {
          const mapping = imageMapping.find(m => m.oldPath === listing.images[idx]);
          return mapping !== undefined;
        }).length;

        await prisma.listing.update({
          where: { id: listing.id },
          data: { images: updatedImages },
        });

        updatedListings++;
        totalImagesReplaced += replacedCount;
        console.log(`✅ Updated listing: "${listing.title}" (${replacedCount} images)`);
      }
    }

    console.log(`\n🎉 Migration Complete!`);
    console.log(`   📊 Listings updated: ${updatedListings}`);
    console.log(`   🖼️  Total images replaced: ${totalImagesReplaced}`);
    console.log(`\n💡 Note: Local images in public/uploads/listings/ are still there.`);
    console.log(`   You can delete them after verifying the migration worked correctly.\n`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateImagesToCloudinary();

