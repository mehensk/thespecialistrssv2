// Script to export existing listings from your database
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';

const prisma = new PrismaClient();

async function exportListings() {
  try {
    console.log('Exporting listings from database...\n');

    const listings = await prisma.listing.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (listings.length === 0) {
      console.log('No listings found in database.');
      console.log('You can create listings through the dashboard at http://localhost:3000/dashboard/listings/new');
      return;
    }

    console.log(`Found ${listings.length} listing(s)\n`);

    // Export to JSON file
    const exportData = {
      exportedAt: new Date().toISOString(),
      count: listings.length,
      listings: listings.map((listing) => ({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        city: listing.city,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        size: listing.size,
        propertyType: listing.propertyType,
        listingType: listing.listingType,
        images: listing.images,
        address: listing.address,
        yearBuilt: listing.yearBuilt,
        parking: listing.parking,
        floor: listing.floor,
        totalFloors: listing.totalFloors,
        amenities: listing.amenities,
        propertyId: listing.propertyId,
        available: listing.available,
        isPublished: listing.isPublished,
        userEmail: listing.user.email,
        userName: listing.user.name,
        approvedAt: listing.approvedAt,
      })),
    };

    const filename = 'listings-export.json';
    await writeFile(filename, JSON.stringify(exportData, null, 2), 'utf-8');

    console.log(`✅ Exported ${listings.length} listing(s) to ${filename}\n`);
    console.log('Listings:');
    listings.forEach((listing, index) => {
      console.log(`  ${index + 1}. ${listing.title} (${listing.city || listing.location})`);
      console.log(`     Images: ${listing.images.length}`);
      console.log(`     Published: ${listing.isPublished ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log(`\nNext steps:`);
    console.log(`1. Review ${filename}`);
    console.log(`2. If you want to use these in the seed script, I can update prisma/seed.ts to use this data`);
  } catch (error) {
    console.error('Error exporting listings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportListings();

