// Quick script to check what Cloudinary URLs are in the database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCloudinaryUrls() {
  try {
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        images: true,
      },
    });

    console.log(`Found ${listings.length} listings\n`);

    let hasCloudinaryUrls = false;

    for (const listing of listings) {
      if (!listing.images || listing.images.length === 0) continue;

      const cloudinaryUrls = listing.images.filter(img => img.includes('cloudinary.com'));
      
      if (cloudinaryUrls.length > 0) {
        hasCloudinaryUrls = true;
        console.log(`\n📋 ${listing.title}:`);
        console.log(`   ${cloudinaryUrls.length} Cloudinary image(s)`);
        
        // Extract cloud name from URL
        const firstUrl = cloudinaryUrls[0];
        const urlParts = firstUrl.split('/');
        const cloudinaryIndex = urlParts.findIndex(p => p.includes('cloudinary.com'));
        
        if (cloudinaryIndex >= 0 && urlParts[cloudinaryIndex + 1]) {
          const cloudName = urlParts[cloudinaryIndex + 1];
          console.log(`   Cloud Name: ${cloudName}`);
          console.log(`   Example URL: ${firstUrl.substring(0, 100)}...`);
        }
        
        // Check folder
        const folderIndex = urlParts.findIndex(p => p === 'listings');
        if (folderIndex >= 0) {
          console.log(`   ✅ Images are in 'listings' folder`);
        }
      }
    }

    if (!hasCloudinaryUrls) {
      console.log('⚠️  No Cloudinary URLs found in database.');
      console.log('   Images might still be using local paths.');
    }

    // Check environment variables
    console.log(`\n\n🔍 Environment Check:`);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (cloudName) {
      console.log(`   Cloud Name in .env: ${cloudName}`);
    } else {
      console.log(`   ❌ CLOUDINARY_CLOUD_NAME not found in .env`);
    }
    
    if (apiKey) {
      console.log(`   ✅ API Key configured`);
    } else {
      console.log(`   ❌ CLOUDINARY_API_KEY not found in .env`);
    }
    
    if (apiSecret) {
      console.log(`   ✅ API Secret configured`);
    } else {
      console.log(`   ❌ CLOUDINARY_API_SECRET not found in .env`);
    }

  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCloudinaryUrls();

