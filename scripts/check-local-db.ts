/**
 * Script to check the local database
 * 
 * This script connects to your local database (from .env) and shows:
 * - Current data counts
 * - Comparison with Neon database
 * 
 * Usage:
 *   tsx scripts/check-local-db.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load local .env file
dotenv.config();

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function checkLocalDatabase() {
  console.log('🔍 Checking Local Database...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file!');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  const isPrismaDev = process.env.DATABASE_URL.startsWith('prisma+postgres://');
  
  console.log('📍 Database URL:', dbUrl);
  
  if (isPrismaDev) {
    console.log('📦 Detected Prisma local dev server');
    console.log('   ℹ️  Make sure Prisma dev server is running: npx prisma dev');
    console.log('');
  }
  console.log('');

  try {
    // Test connection with retries for Prisma dev
    console.log('📡 Testing database connection...');
    
    if (isPrismaDev) {
      // For Prisma dev, try multiple times with delay
      let connected = false;
      for (let i = 0; i < 5; i++) {
        try {
          await localPrisma.$connect();
          connected = true;
          break;
        } catch (error) {
          if (i < 4) {
            console.log(`   ⏳ Retrying connection... (${i + 1}/5)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            throw error;
          }
        }
      }
      
      if (!connected) {
        throw new Error('Could not connect to Prisma dev server');
      }
    } else {
      await localPrisma.$connect();
    }
    
    console.log('✅ Database connection successful!\n');

    // Get counts
    console.log('📊 Local Database Stats:\n');
    
    const userCount = await localPrisma.user.count();
    const listingCount = await localPrisma.listing.count();
    const blogCount = await localPrisma.blogPost.count();
    const activityCount = await localPrisma.activity.count();

    console.log(`   👥 Users: ${userCount}`);
    console.log(`   🏠 Listings: ${listingCount}`);
    console.log(`   📝 Blog Posts: ${blogCount}`);
    console.log(`   📋 Activities: ${activityCount}\n`);

    if (listingCount > 0) {
      console.log('🏠 Sample Listings:');
      const listings = await localPrisma.listing.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          isPublished: true,
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
    }

    if (blogCount > 0) {
      console.log('📝 Sample Blog Posts:');
      const blogs = await localPrisma.blogPost.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          isPublished: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      blogs.forEach((blog) => {
        const status = blog.isPublished ? 'Published' : 'Draft';
        console.log(`   - ${blog.title} [${status}]`);
      });
      console.log('');
    }

    // Summary
    if (listingCount > 0 || blogCount > 0) {
      console.log('📋 Summary:');
      console.log('   ✅ Local database has data');
      console.log('   💡 Run: npm run migrate:to-neon (to copy data to Neon)');
    } else {
      console.log('📋 Summary:');
      console.log('   ⚠️  Local database is empty too');
      console.log('   💡 Add listings/blogs locally first, then migrate');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        console.error('\n💡 Connection Error:');
        console.error('   1. Make sure your local database is running');
        console.error('   2. Check your DATABASE_URL in .env file');
      }
    }
    
    throw error;
  } finally {
    await localPrisma.$disconnect();
  }
}

checkLocalDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
