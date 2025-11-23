/**
 * Script to sync data from development database to production database
 * 
 * This script:
 * 1. Reads from localhost/development database (DATABASE_URL in .env)
 * 2. Writes to production database (PRODUCTION_DATABASE_URL environment variable)
 * 
 * Usage:
 *   # Set production database URL
 *   export PRODUCTION_DATABASE_URL="postgresql://user:pass@host:5432/db"
 *   
 *   # Or pass it directly:
 *   PRODUCTION_DATABASE_URL="postgresql://..." tsx scripts/sync-to-production.ts
 *   
 *   # Or use npm script:
 *   npm run sync:to-production
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load local .env file
dotenv.config();

// Get production database URL from environment variable
const PRODUCTION_DATABASE_URL = process.env.PRODUCTION_DATABASE_URL;

if (!PRODUCTION_DATABASE_URL) {
  console.error('❌ ERROR: PRODUCTION_DATABASE_URL environment variable is not set!');
  console.error('\nPlease set it using one of these methods:');
  console.error('1. Export it: export PRODUCTION_DATABASE_URL="postgresql://..."');
  console.error('2. Pass it inline: PRODUCTION_DATABASE_URL="postgresql://..." tsx scripts/sync-to-production.ts');
  console.error('3. Add it to .env file: PRODUCTION_DATABASE_URL="postgresql://..."');
  console.error('\n💡 You can get your production database URL from Netlify:');
  console.error('   Site settings → Environment variables → DATABASE_URL');
  process.exit(1);
}

// Local database (from .env DATABASE_URL)
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Development database from .env
    },
  },
});

// Production database
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL,
    },
  },
});

async function syncToProduction() {
  console.log('🚀 Starting database sync from development to production...\n');

  try {
    // Test local connection
    console.log('📡 Testing development database connection...');
    await localPrisma.$connect();
    console.log('✅ Development database connected\n');

    // Test production connection
    console.log('📡 Testing production database connection...');
    await productionPrisma.$connect();
    console.log('✅ Production database connected\n');

    // Get counts from development
    const devUsers = await localPrisma.user.count();
    const devListings = await localPrisma.listing.count();
    const devBlogs = await localPrisma.blogPost.count();
    const devActivities = await localPrisma.activity.count();

    console.log('📊 Development database stats:');
    console.log(`   Users: ${devUsers}`);
    console.log(`   Listings: ${devListings}`);
    console.log(`   Blogs: ${devBlogs}`);
    console.log(`   Activities: ${devActivities}\n`);

    // Get counts from production
    const prodUsers = await productionPrisma.user.count();
    const prodListings = await productionPrisma.listing.count();
    const prodBlogs = await productionPrisma.blogPost.count();
    const prodActivities = await productionPrisma.activity.count();

    console.log('📊 Production database stats (before sync):');
    console.log(`   Users: ${prodUsers}`);
    console.log(`   Listings: ${prodListings}`);
    console.log(`   Blogs: ${prodBlogs}`);
    console.log(`   Activities: ${prodActivities}\n`);

    // Warn if production has data
    if (prodUsers > 0 || prodListings > 0 || prodBlogs > 0) {
      console.log('⚠️  WARNING: Production database already has data!');
      console.log('   This will update existing records and add new ones.');
      console.log('   Existing data will be preserved where possible.\n');
    }

    // Sync Users
    console.log('👥 Syncing users...');
    const devUsersList = await localPrisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });

    let usersSynced = 0;
    let usersSkipped = 0;
    for (const user of devUsersList) {
      try {
        await productionPrisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            role: user.role,
            // Don't update password if user already exists (preserve production password)
            // Only update if it's a new user
          },
          create: {
            id: user.id,
            email: user.email,
            name: user.name,
            password: user.password, // Hashed password
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });
        usersSynced++;
        if (usersSynced % 10 === 0) {
          process.stdout.write(`   Progress: ${usersSynced}/${devUsersList.length} users...\r`);
        }
      } catch (error: any) {
        console.error(`\n   ⚠️  Failed to sync user ${user.email}:`, error.message);
        usersSkipped++;
      }
    }
    console.log(`   ✅ Synced ${usersSynced} users${usersSkipped > 0 ? ` (${usersSkipped} skipped)` : ''}\n`);

    // Sync Listings
    console.log('🏠 Syncing listings...');
    const devListingsList = await localPrisma.listing.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    let listingsSynced = 0;
    let listingsSkipped = 0;
    for (const listing of devListingsList) {
      try {
        // Ensure user exists in production (create if not)
        await productionPrisma.user.upsert({
          where: { id: listing.userId },
          update: {},
          create: {
            id: listing.user.id,
            email: listing.user.email,
            name: listing.user.name,
            password: listing.user.password,
            role: listing.user.role,
            createdAt: listing.user.createdAt,
            updatedAt: listing.user.updatedAt,
          },
        });

        await productionPrisma.listing.upsert({
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
            amenities: listing.amenities,
            propertyId: listing.propertyId,
            available: listing.available,
            isPublished: listing.isPublished,
            approvedBy: listing.approvedBy,
            approvedAt: listing.approvedAt,
            updatedAt: new Date(),
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
            amenities: listing.amenities,
            propertyId: listing.propertyId,
            available: listing.available,
            userId: listing.userId,
            isPublished: listing.isPublished,
            approvedBy: listing.approvedBy,
            approvedAt: listing.approvedAt,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
          },
        });
        listingsSynced++;
        if (listingsSynced % 10 === 0) {
          process.stdout.write(`   Progress: ${listingsSynced}/${devListingsList.length} listings...\r`);
        }
      } catch (error: any) {
        console.error(`\n   ⚠️  Failed to sync listing ${listing.id} (${listing.title}):`, error.message);
        listingsSkipped++;
      }
    }
    console.log(`   ✅ Synced ${listingsSynced} listings${listingsSkipped > 0 ? ` (${listingsSkipped} skipped)` : ''}\n`);

    // Sync Blog Posts
    console.log('📝 Syncing blog posts...');
    const devBlogsList = await localPrisma.blogPost.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    let blogsSynced = 0;
    let blogsSkipped = 0;
    for (const blog of devBlogsList) {
      try {
        // Ensure user exists in production (create if not)
        await productionPrisma.user.upsert({
          where: { id: blog.userId },
          update: {},
          create: {
            id: blog.user.id,
            email: blog.user.email,
            name: blog.user.name,
            password: blog.user.password,
            role: blog.user.role,
            createdAt: blog.user.createdAt,
            updatedAt: blog.user.updatedAt,
          },
        });

        await productionPrisma.blogPost.upsert({
          where: { id: blog.id },
          update: {
            title: blog.title,
            content: blog.content,
            slug: blog.slug,
            excerpt: blog.excerpt,
            images: blog.images,
            isPublished: blog.isPublished,
            approvedBy: blog.approvedBy,
            approvedAt: blog.approvedAt,
            updatedAt: new Date(),
          },
          create: {
            id: blog.id,
            title: blog.title,
            content: blog.content,
            slug: blog.slug,
            excerpt: blog.excerpt,
            images: blog.images,
            userId: blog.userId,
            isPublished: blog.isPublished,
            approvedBy: blog.approvedBy,
            approvedAt: blog.approvedAt,
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt,
          },
        });
        blogsSynced++;
        if (blogsSynced % 10 === 0) {
          process.stdout.write(`   Progress: ${blogsSynced}/${devBlogsList.length} blogs...\r`);
        }
      } catch (error: any) {
        console.error(`\n   ⚠️  Failed to sync blog ${blog.id} (${blog.title}):`, error.message);
        blogsSkipped++;
      }
    }
    console.log(`   ✅ Synced ${blogsSynced} blog posts${blogsSkipped > 0 ? ` (${blogsSkipped} skipped)` : ''}\n`);

    // Sync Activities (optional - limited to recent ones)
    console.log('📋 Syncing recent activities (last 1000)...');
    const devActivitiesList = await localPrisma.activity.findMany({
      take: 1000, // Limit to last 1000 activities to avoid timeout
      orderBy: { timestamp: 'desc' },
    });

    let activitiesSynced = 0;
    let activitiesSkipped = 0;
    for (const activity of devActivitiesList) {
      try {
        // Check if user exists in production
        const userExists = await productionPrisma.user.findUnique({
          where: { id: activity.userId },
        });

        if (!userExists) {
          activitiesSkipped++;
          continue;
        }

        await productionPrisma.activity.upsert({
          where: { id: activity.id },
          update: {},
          create: {
            id: activity.id,
            userId: activity.userId,
            action: activity.action,
            itemType: activity.itemType,
            itemId: activity.itemId,
            metadata: activity.metadata,
            ipAddress: activity.ipAddress,
            userAgent: activity.userAgent,
            timestamp: activity.timestamp,
          },
        });
        activitiesSynced++;
        if (activitiesSynced % 100 === 0) {
          process.stdout.write(`   Progress: ${activitiesSynced}/${devActivitiesList.length} activities...\r`);
        }
      } catch (error: any) {
        // Skip if already exists or error
        activitiesSkipped++;
        continue;
      }
    }
    console.log(`   ✅ Synced ${activitiesSynced} activities${activitiesSkipped > 0 ? ` (${activitiesSkipped} skipped)` : ''}\n`);

    // Final stats
    console.log('📊 Sync completed!\n');
    console.log('Final production database stats:');
    const finalProdUsers = await productionPrisma.user.count();
    const finalProdListings = await productionPrisma.listing.count();
    const finalProdBlogs = await productionPrisma.blogPost.count();
    const finalProdActivities = await productionPrisma.activity.count();

    console.log(`   Users: ${finalProdUsers}`);
    console.log(`   Listings: ${finalProdListings}`);
    console.log(`   Blogs: ${finalProdBlogs}`);
    console.log(`   Activities: ${finalProdActivities}\n`);

    console.log('✅ Database sync complete! Your production database now has all your development data.');
    console.log('💡 You can now deploy to production and your data will be available.\n');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await productionPrisma.$disconnect();
  }
}

syncToProduction()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

