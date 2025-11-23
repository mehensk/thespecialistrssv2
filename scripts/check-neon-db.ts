/**
 * Script to check the Neon database (used in Netlify)
 * 
 * This script connects to your Neon database and shows:
 * - Connection status
 * - Current data counts
 * - Sample data from each table
 * 
 * Usage:
 *   tsx scripts/check-neon-db.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load local .env file (though we'll override with Neon URL)
dotenv.config();

// Neon database URL (from seed-neon.js)
const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Create Prisma client for Neon
const neonPrisma = new PrismaClient({
  datasources: {
    db: {
      url: NEON_DATABASE_URL,
    },
  },
});

async function checkNeonDatabase() {
  console.log('🔍 Checking Neon Database (Netlify Production)...\n');
  console.log('📍 Database URL:', NEON_DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password
  console.log('');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await neonPrisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Get counts
    console.log('📊 Current Database Stats:\n');
    
    const userCount = await neonPrisma.user.count();
    const listingCount = await neonPrisma.listing.count();
    const blogCount = await neonPrisma.blogPost.count();
    const activityCount = await neonPrisma.activity.count();

    console.log(`   👥 Users: ${userCount}`);
    console.log(`   🏠 Listings: ${listingCount}`);
    console.log(`   📝 Blog Posts: ${blogCount}`);
    console.log(`   📋 Activities: ${activityCount}\n`);

    // Show sample users
    if (userCount > 0) {
      console.log('👥 Sample Users:');
      const users = await neonPrisma.user.findMany({
        take: 5,
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
      console.log('⚠️  No users found in database!\n');
    }

    // Show sample listings
    if (listingCount > 0) {
      console.log('🏠 Sample Listings:');
      const listings = await neonPrisma.listing.findMany({
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
        console.log(`   - ${listing.title} - $${listing.price.toLocaleString()} (${listing.location}) [${status}]`);
      });
      console.log('');
    } else {
      console.log('⚠️  No listings found in database!\n');
    }

    // Show sample blogs
    if (blogCount > 0) {
      console.log('📝 Sample Blog Posts:');
      const blogs = await neonPrisma.blogPost.findMany({
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
      console.log('⚠️  No blog posts found in database!\n');
    }

    // Check if schema is up to date
    console.log('🔍 Checking database schema...');
    try {
      const tableCheck = await neonPrisma.$queryRaw`
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
      console.log('   ⚠️  Database is empty!');
      console.log('   💡 Run: npm run migrate:to-neon (if you have local data)');
      console.log('   💡 Or run: DATABASE_URL="..." npm run db:seed (to create default users)');
    } else if (userCount > 0 && listingCount === 0 && blogCount === 0) {
      console.log('   ✅ Default users exist');
      console.log('   ⚠️  No listings or blogs found');
      console.log('   💡 Run: npm run migrate:to-neon (to copy data from local)');
    } else {
      console.log('   ✅ Database has data');
      console.log('   ✅ Connection is working');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Error checking database:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        console.error('\n💡 Connection Error - Possible issues:');
        console.error('   1. Database URL might be incorrect');
        console.error('   2. Database might be paused (Neon free tier)');
        console.error('   3. Network/firewall issue');
      } else if (error.message.includes('does not exist')) {
        console.error('\n💡 Schema Error - Run migrations:');
        console.error('   DATABASE_URL="..." npx prisma migrate deploy');
      }
    }
    
    throw error;
  } finally {
    await neonPrisma.$disconnect();
  }
}

checkNeonDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
