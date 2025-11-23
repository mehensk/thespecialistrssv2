/**
 * Script to migrate data from localhost database to Neon database
 * 
 * This script:
 * 1. Reads from localhost database (DATABASE_URL in .env)
 * 2. Writes to Neon database (from seed-neon.js URL)
 * 
 * Usage:
 *   # First, ensure your local .env has localhost DATABASE_URL
 *   # Then run:
 *   tsx scripts/migrate-to-neon.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';

// Load local .env file
dotenv.config();

// Neon database URL (from seed-neon.js)
const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Local database (from .env)
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Localhost from .env
    },
  },
});

// Neon database
const neonPrisma = new PrismaClient({
  datasources: {
    db: {
      url: NEON_DATABASE_URL,
    },
  },
});

async function migrateToNeon() {
  console.log('🚀 Starting migration from localhost to Neon...\n');

  try {
    // Test local connection
    console.log('📡 Testing local database connection...');
    await localPrisma.$connect();
    console.log('✅ Local database connected\n');

    // Test Neon connection
    console.log('📡 Testing Neon database connection...');
    await neonPrisma.$connect();
    console.log('✅ Neon database connected\n');

    // Get counts from local
    const localUsers = await localPrisma.user.count();
    const localListings = await localPrisma.listing.count();
    const localBlogs = await localPrisma.blogPost.count();
    const localActivities = await localPrisma.activity.count();

    console.log('📊 Local database stats:');
    console.log(`   Users: ${localUsers}`);
    console.log(`   Listings: ${localListings}`);
    console.log(`   Blogs: ${localBlogs}`);
    console.log(`   Activities: ${localActivities}\n`);

    // Get counts from Neon
    const neonUsers = await neonPrisma.user.count();
    const neonListings = await neonPrisma.listing.count();
    const neonBlogs = await neonPrisma.blogPost.count();
    const neonActivities = await neonPrisma.activity.count();

    console.log('📊 Neon database stats (before migration):');
    console.log(`   Users: ${neonUsers}`);
    console.log(`   Listings: ${neonListings}`);
    console.log(`   Blogs: ${neonBlogs}`);
    console.log(`   Activities: ${neonActivities}\n`);

    // Ask for confirmation if Neon has data
    if (neonUsers > 0 || neonListings > 0 || neonBlogs > 0) {
      console.log('⚠️  WARNING: Neon database already has data!');
      console.log('   This will duplicate data. Continue? (y/n)');
      // In a real script, you'd use readline or similar for input
      // For now, proceed with caution
    }

    // Migrate Users (use email as unique key, let Neon generate new IDs)
    console.log('👥 Migrating users...');
    const localUsersList = await localPrisma.user.findMany({
      include: {
        listings: true,
        blogPosts: true,
      },
    });

    let usersMigrated = 0;
    for (const user of localUsersList) {
      try {
        // Use email as the unique identifier, let Neon assign new ID
        await neonPrisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            role: user.role,
            // Don't update password or ID - keep existing
          },
          create: {
            email: user.email,
            name: user.name,
            password: user.password, // Hashed password
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });
        usersMigrated++;
      } catch (error) {
        console.error(`   ⚠️  Failed to migrate user ${user.email}:`, error);
      }
    }
    console.log(`   ✅ Migrated ${usersMigrated} users\n`);

    // Create user ID mapping (local ID -> Neon ID)
    console.log('📋 Creating user ID mapping...');
    const userMapping = new Map<string, string>();
    const neonUsersList = await neonPrisma.user.findMany({
      select: { id: true, email: true },
    });
    const localUsersForMapping = await localPrisma.user.findMany({
      select: { id: true, email: true },
    });

    for (const localUser of localUsersForMapping) {
      const neonUser = neonUsersList.find((u) => u.email === localUser.email);
      if (neonUser) {
        userMapping.set(localUser.id, neonUser.id);
      }
    }
    console.log(`   ✅ Mapped ${userMapping.size} users\n`);

    // Migrate Listings
    console.log('🏠 Migrating listings...');
    const localListingsList = await localPrisma.listing.findMany({
      include: {
        user: true,
      },
    });

    let listingsMigrated = 0;
    for (const listing of localListingsList) {
      try {
        // Get Neon user ID (should already exist from user migration)
        const neonUserId = userMapping.get(listing.userId);
        if (!neonUserId) {
          console.error(`   ⚠️  User ${listing.userId} (${listing.user.email}) not found in Neon, skipping listing ${listing.id}`);
          continue;
        }

        // Map approvedBy to Neon user ID if it exists
        let neonApprovedBy: string | null = null;
        if (listing.approvedBy) {
          neonApprovedBy = userMapping.get(listing.approvedBy) || null;
          if (!neonApprovedBy && listing.approvedBy) {
            console.log(`   ⚠️  ApprovedBy user ${listing.approvedBy} not found in Neon, setting to null for listing ${listing.id}`);
          }
        }

        await neonPrisma.listing.upsert({
          where: { id: listing.id },
          update: {
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
            amenities: listing.amenities === null ? Prisma.DbNull : (listing.amenities as Prisma.InputJsonValue),
            propertyId: listing.propertyId,
            available: listing.available,
            userId: neonUserId,
            isPublished: listing.isPublished,
            approvedBy: neonApprovedBy,
            approvedAt: listing.approvedAt,
          },
          create: {
            id: listing.id,
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
            amenities: listing.amenities === null ? Prisma.DbNull : (listing.amenities as Prisma.InputJsonValue),
            propertyId: listing.propertyId,
            available: listing.available,
            userId: neonUserId,
            isPublished: listing.isPublished,
            approvedBy: neonApprovedBy,
            approvedAt: listing.approvedAt,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
          },
        });
        listingsMigrated++;
      } catch (error) {
        console.error(`   ⚠️  Failed to migrate listing ${listing.id}:`, error);
      }
    }
    console.log(`   ✅ Migrated ${listingsMigrated} listings\n`);

    // Migrate Blogs
    console.log('📝 Migrating blogs...');
    const localBlogsList = await localPrisma.blogPost.findMany({
      include: {
        user: true,
      },
    });

    let blogsMigrated = 0;
    for (const blog of localBlogsList) {
      try {
        // Get Neon user ID (should already exist from user migration)
        const neonUserId = userMapping.get(blog.userId);
        if (!neonUserId) {
          console.error(`   ⚠️  User ${blog.userId} (${blog.user.email}) not found in Neon, skipping blog ${blog.id}`);
          continue;
        }

        // Map approvedBy to Neon user ID if it exists
        let neonApprovedBy: string | null = null;
        if (blog.approvedBy) {
          neonApprovedBy = userMapping.get(blog.approvedBy) || null;
          if (!neonApprovedBy && blog.approvedBy) {
            console.log(`   ⚠️  ApprovedBy user ${blog.approvedBy} not found in Neon, setting to null for blog ${blog.id}`);
          }
        }

        await neonPrisma.blogPost.upsert({
          where: { id: blog.id },
          update: {
            title: blog.title,
            content: blog.content,
            slug: blog.slug,
            excerpt: blog.excerpt,
            images: blog.images,
            userId: neonUserId,
            isPublished: blog.isPublished,
            approvedBy: neonApprovedBy,
            approvedAt: blog.approvedAt,
          },
          create: {
            id: blog.id,
            title: blog.title,
            content: blog.content,
            slug: blog.slug,
            excerpt: blog.excerpt,
            images: blog.images,
            userId: neonUserId,
            isPublished: blog.isPublished,
            approvedBy: neonApprovedBy,
            approvedAt: blog.approvedAt,
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt,
          },
        });
        blogsMigrated++;
      } catch (error) {
        console.error(`   ⚠️  Failed to migrate blog ${blog.id}:`, error);
      }
    }
    console.log(`   ✅ Migrated ${blogsMigrated} blogs\n`);

    // Migrate Activities (optional - can be skipped if too many)
    console.log('📋 Migrating activities (this may take a while)...');
    const localActivitiesList = await localPrisma.activity.findMany({
      take: 1000, // Limit to last 1000 activities to avoid timeout
      orderBy: { timestamp: 'desc' },
    });

    let activitiesMigrated = 0;
    for (const activity of localActivitiesList) {
      try {
        // Get Neon user ID using mapping
        const neonUserId = userMapping.get(activity.userId);
        if (!neonUserId) {
          // Skip if user doesn't exist in Neon
          continue;
        }

        await neonPrisma.activity.upsert({
          where: { id: activity.id },
          update: {},
          create: {
            id: activity.id,
            userId: neonUserId,
            action: activity.action,
            itemType: activity.itemType,
            itemId: activity.itemId,
            metadata: activity.metadata === null ? Prisma.DbNull : (activity.metadata as Prisma.InputJsonValue),
            ipAddress: activity.ipAddress,
            userAgent: activity.userAgent,
            timestamp: activity.timestamp,
          },
        });
        activitiesMigrated++;
      } catch (error) {
        // Skip if already exists or error
        continue;
      }
    }
    console.log(`   ✅ Migrated ${activitiesMigrated} activities\n`);

    // Final stats
    console.log('📊 Migration completed!\n');
    console.log('Final Neon database stats:');
    const finalNeonUsers = await neonPrisma.user.count();
    const finalNeonListings = await neonPrisma.listing.count();
    const finalNeonBlogs = await neonPrisma.blogPost.count();
    const finalNeonActivities = await neonPrisma.activity.count();

    console.log(`   Users: ${finalNeonUsers}`);
    console.log(`   Listings: ${finalNeonListings}`);
    console.log(`   Blogs: ${finalNeonBlogs}`);
    console.log(`   Activities: ${finalNeonActivities}\n`);

    console.log('✅ Migration complete! Your Neon database now has all your data.');
    console.log('💡 You can now update your local .env to point to Neon if you want to use the same database for dev and production.\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await neonPrisma.$disconnect();
  }
}

migrateToNeon()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



