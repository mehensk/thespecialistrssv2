/**
 * Script to check the development branch in Neon
 * 
 * Usage:
 *   # First, get the development branch connection string from Neon dashboard
 *   # Then run:
 *   DEV_DATABASE_URL="postgresql://..." tsx scripts/check-dev-branch.ts
 */

import { PrismaClient } from '@prisma/client';
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
  console.error('   DEV_DATABASE_URL="postgresql://..." tsx scripts/check-dev-branch.ts');
  process.exit(1);
}

// Create Prisma client for development branch
const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: DEV_DATABASE_URL,
    },
  },
});

async function checkDevBranch() {
  console.log('🔍 Checking Development Branch Database...\n');
  console.log('📍 Database URL:', DEV_DATABASE_URL!.replace(/:[^:@]+@/, ':****@')); // Hide password (non-null: checked above)
  console.log('');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await devPrisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Get counts
    console.log('📊 Current Database Stats:\n');
    
    const userCount = await devPrisma.user.count();
    const listingCount = await devPrisma.listing.count();
    const blogCount = await devPrisma.blogPost.count();
    const activityCount = await devPrisma.activity.count();

    console.log(`   👥 Users: ${userCount}`);
    console.log(`   🏠 Listings: ${listingCount}`);
    console.log(`   📝 Blog Posts: ${blogCount}`);
    console.log(`   📋 Activities: ${activityCount}\n`);

    // Show sample users
    if (userCount > 0) {
      console.log('👥 Users in Development Branch:');
      const users = await devPrisma.user.findMany({
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      users.forEach((user) => {
        console.log(`   - ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString().split('T')[0]}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No users found in development branch!\n');
    }

    // Show sample listings
    if (listingCount > 0) {
      console.log('🏠 Sample Listings in Development Branch:');
      const listings = await devPrisma.listing.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          isPublished: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      listings.forEach((listing) => {
        const status = listing.isPublished ? 'Published' : 'Draft';
        const priceStr = listing.price != null ? listing.price.toLocaleString() : 'N/A';
        console.log(`   - ${listing.title} - $${priceStr} (${listing.location}) [${status}]`);
      });
      console.log('');
    } else {
      console.log('⚠️  No listings found in development branch!\n');
    }

    // Show sample blogs
    if (blogCount > 0) {
      console.log('📝 Sample Blog Posts in Development Branch:');
      const blogs = await devPrisma.blogPost.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          isPublished: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      blogs.forEach((blog) => {
        const status = blog.isPublished ? 'Published' : 'Draft';
        console.log(`   - ${blog.title} [${status}] - Created: ${blog.createdAt.toISOString().split('T')[0]}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No blog posts found in development branch!\n');
    }

    // Check if schema is up to date
    console.log('🔍 Checking database schema...');
    try {
      const tableCheck = await devPrisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      ` as Array<{ table_name: string }>;
      
      const tables = tableCheck.map((t) => t.table_name);
      console.log(`✅ Found ${tables.length} tables: ${tables.join(', ')}\n`);
    } catch (error) {
      console.log('⚠️  Could not check schema (this is okay)\n');
    }

    // Summary
    console.log('📋 Summary:');
    if (userCount === 0 && listingCount === 0 && blogCount === 0) {
      console.log('   ⚠️  Development branch is empty!');
      console.log('   💡 Run migration script to upload your local data');
    } else {
      console.log('   ✅ Development branch has data');
      console.log('   ✅ Connection is working');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Error checking database:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        console.error('\n💡 Connection Error - Possible issues:');
        console.error('   1. Database URL might be incorrect');
        console.error('   2. Database might be paused (Neon free tier)');
        console.error('   3. Network/firewall issue');
        console.error('   4. Check if the connection string is for the "development" branch');
      } else if (error.message.includes('does not exist') || error.message.includes('relation')) {
        console.error('\n💡 Schema Error - Run migrations first:');
        console.error('   DEV_DATABASE_URL="..." npx prisma migrate deploy');
      }
    }
    
    throw error;
  } finally {
    await devPrisma.$disconnect();
  }
}

checkDevBranch()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

