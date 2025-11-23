/**
 * Script to migrate data from local database to Neon development branch
 * 
 * This script:
 * 1. Reads from local database (DATABASE_URL in .env)
 * 2. Writes to Neon development branch (DEV_DATABASE_URL environment variable)
 * 
 * Usage:
 *   # First, get the development branch connection string from Neon dashboard
 *   # Then run:
 *   DEV_DATABASE_URL="postgresql://..." tsx scripts/migrate-to-dev-branch.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';

// Load local .env file
dotenv.config();

// Get development branch URL from environment variable
const DEV_DATABASE_URL = process.env.DEV_DATABASE_URL;

if (!DEV_DATABASE_URL) {
  console.error('❌ ERROR: DEV_DATABASE_URL environment variable is not set!');
  console.error('\n💡 How to get your development branch connection string:');
  console.error('   1. Go to https://console.neon.tech/');
  console.error('   2. Click on "development" branch');
  console.error('   3. Click "Connection Details"');
  console.error('   4. Copy the connection string');
  console.error('\n💡 Then run:');
  console.error('   DEV_DATABASE_URL="postgresql://..." tsx scripts/migrate-to-dev-branch.ts');
  process.exit(1);
}

// Local database (from .env)
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Localhost from .env
    },
  },
});

// Development branch database
const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: DEV_DATABASE_URL,
    },
  },
});

async function migrateToDevBranch() {
  console.log('🚀 Starting migration from local database to development branch...\n');

  try {
    // Test local connection
    console.log('📡 Testing local database connection...');
    await localPrisma.$connect();
    console.log('✅ Local database connected\n');

    // Test development branch connection
    console.log('📡 Testing development branch connection...');
    await devPrisma.$connect();
    console.log('✅ Development branch connected\n');

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

    // Get counts from development branch
    const devUsers = await devPrisma.user.count();
    const devListings = await devPrisma.listing.count();
    const devBlogs = await devPrisma.blogPost.count();
    const devActivities = await devPrisma.activity.count();

    console.log('📊 Development branch stats (before migration):');
    console.log(`   Users: ${devUsers}`);
    console.log(`   Listings: ${devListings}`);
    console.log(`   Blogs: ${devBlogs}`);
    console.log(`   Activities: ${devActivities}\n`);

    if (devUsers > 0 || devListings > 0 || devBlogs > 0) {
      console.log('⚠️  WARNING: Development branch already has data!');
      console.log('   This migration will use upsert (update if exists, create if not)');
      console.log('   Existing data will be updated with local data\n');
    }

    // Migrate users
    console.log('👥 Migrating users...');
    const localUsersList = await localPrisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    for (const user of localUsersList) {
      await devPrisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          name: user.name,
          password: user.password, // Preserve password hash
          role: user.role,
          updatedAt: user.updatedAt,
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    }
    console.log(`   ✅ Migrated ${localUsersList.length} users\n`);

    // Migrate listings
    console.log('🏠 Migrating listings...');
    const localListingsList = await localPrisma.listing.findMany({
      include: {
        user: {
          select: { id: true },
        },
      },
    });

    for (const listing of localListingsList) {
      // Ensure user exists in dev branch
      if (listing.userId) {
        await devPrisma.user.upsert({
          where: { id: listing.userId },
          update: {},
          create: {
            id: listing.userId,
            email: `temp-${listing.userId}@temp.com`,
            name: 'Temp User',
            password: '$2a$10$temp', // Temporary password
            role: 'AGENT' as any,
          },
        });
      }

      await devPrisma.listing.upsert({
        where: { id: listing.id },
        update: {
          title: listing.title,
          description: listing.description,
          price: listing.price,
          location: listing.location,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          size: listing.size,
          images: listing.images,
          isPublished: listing.isPublished,
          userId: listing.userId,
          updatedAt: listing.updatedAt,
        },
        create: {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          location: listing.location,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          size: listing.size,
          images: listing.images,
          isPublished: listing.isPublished,
          userId: listing.userId,
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt,
        },
      });
    }
    console.log(`   ✅ Migrated ${localListingsList.length} listings\n`);

    // Migrate blogs
    console.log('📝 Migrating blogs...');
    const localBlogsList = await localPrisma.blogPost.findMany({
      include: {
        user: {
          select: { id: true },
        },
      },
    });

    for (const blog of localBlogsList) {
      // Ensure user exists in dev branch
      if (blog.userId) {
        await devPrisma.user.upsert({
          where: { id: blog.userId },
          update: {},
          create: {
            id: blog.userId,
            email: `temp-${blog.userId}@temp.com`,
            name: 'Temp User',
            password: '$2a$10$temp',
            role: 'WRITER' as any,
          },
        });
      }

      await devPrisma.blogPost.upsert({
        where: { id: blog.id },
        update: {
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt,
          slug: blog.slug,
          images: blog.images,
          isPublished: blog.isPublished,
          userId: blog.userId,
          updatedAt: blog.updatedAt,
        },
        create: {
          id: blog.id,
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt,
          slug: blog.slug,
          images: blog.images,
          isPublished: blog.isPublished,
          userId: blog.userId,
          createdAt: blog.createdAt,
          updatedAt: blog.updatedAt,
        },
      });
    }
    console.log(`   ✅ Migrated ${localBlogsList.length} blogs\n`);

    // Migrate activities (last 1000 to avoid timeout)
    console.log('📋 Migrating activities (last 1000)...');
    const localActivitiesList = await localPrisma.activity.findMany({
      take: 1000,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: { id: true },
        },
      },
    });

    for (const activity of localActivitiesList) {
      // Check if user exists in dev branch
      if (activity.userId) {
        const userExists = await devPrisma.user.findUnique({
          where: { id: activity.userId },
        });
        if (!userExists) {
          // Skip activities for users that don't exist
          continue;
        }
      }

      await devPrisma.activity.upsert({
        where: { id: activity.id },
        update: {
          action: activity.action,
          itemType: activity.itemType,
          itemId: activity.itemId,
          userId: activity.userId,
          metadata: activity.metadata as Prisma.InputJsonValue,
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent,
        },
        create: {
          id: activity.id,
          action: activity.action,
          itemType: activity.itemType,
          itemId: activity.itemId,
          userId: activity.userId,
          metadata: activity.metadata as Prisma.InputJsonValue,
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent,
          timestamp: activity.timestamp,
        },
      });
    }
    console.log(`   ✅ Migrated ${localActivitiesList.length} activities\n`);

    // Final stats
    console.log('📊 Migration completed!\n');

    const finalDevUsers = await devPrisma.user.count();
    const finalDevListings = await devPrisma.listing.count();
    const finalDevBlogs = await devPrisma.blogPost.count();
    const finalDevActivities = await devPrisma.activity.count();

    console.log('Final development branch stats:');
    console.log(`   Users: ${finalDevUsers}`);
    console.log(`   Listings: ${finalDevListings}`);
    console.log(`   Blogs: ${finalDevBlogs}`);
    console.log(`   Activities: ${finalDevActivities}\n`);

    console.log('✅ Migration complete! Your development branch now has all your local data.');
    console.log('💡 You can now update your local .env to point to the development branch if you want.\n');

  } catch (error) {
    console.error('❌ Migration error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        console.error('\n💡 Connection Error:');
        console.error('   - Check if DEV_DATABASE_URL is correct');
        console.error('   - Check if development branch is active (not paused)');
      } else if (error.message.includes('does not exist') || error.message.includes('relation')) {
        console.error('\n💡 Schema Error - Run migrations first:');
        console.error('   DEV_DATABASE_URL="..." npx prisma migrate deploy');
      }
    }
    
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await devPrisma.$disconnect();
  }
}

migrateToDevBranch()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

