/**
 * Script to compare local and Neon databases
 * Shows side-by-side comparison to identify where data is
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_jCOqnxtR23UI@ep-still-bush-a1ku8365-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const neonPrisma = new PrismaClient({
  datasources: {
    db: {
      url: NEON_DATABASE_URL,
    },
  },
});

async function compareDatabases() {
  console.log('🔍 Comparing Local vs Neon Databases\n');
  console.log('═'.repeat(60));
  
  try {
    // Connect to both
    console.log('📡 Connecting to databases...');
    await localPrisma.$connect();
    await neonPrisma.$connect();
    console.log('✅ Both connections successful!\n');

    // Compare counts
    console.log('📊 Database Comparison:\n');
    
    const localUsers = await localPrisma.user.count();
    const localListings = await localPrisma.listing.count();
    const localBlogs = await localPrisma.blogPost.count();
    const localActivities = await localPrisma.activity.count();

    const neonUsers = await neonPrisma.user.count();
    const neonListings = await neonPrisma.listing.count();
    const neonBlogs = await neonPrisma.blogPost.count();
    const neonActivities = await neonPrisma.activity.count();

    console.log('   '.padEnd(30) + 'LOCAL'.padEnd(15) + 'NEON'.padEnd(15) + 'STATUS');
    console.log('-'.repeat(60));
    console.log('👥 Users:'.padEnd(30) + localUsers.toString().padEnd(15) + neonUsers.toString().padEnd(15) + 
      (localUsers === neonUsers ? '✅ Match' : '⚠️  Different'));
    console.log('🏠 Listings:'.padEnd(30) + localListings.toString().padEnd(15) + neonListings.toString().padEnd(15) + 
      (localListings === neonListings ? '✅ Match' : '❌ Missing in Neon'));
    console.log('📝 Blog Posts:'.padEnd(30) + localBlogs.toString().padEnd(15) + neonBlogs.toString().padEnd(15) + 
      (localBlogs === neonBlogs ? '✅ Match' : '❌ Missing in Neon'));
    console.log('📋 Activities:'.padEnd(30) + localActivities.toString().padEnd(15) + neonActivities.toString().padEnd(15) + 
      (localActivities === neonActivities ? '✅ Match' : '⚠️  Different'));
    console.log('');

    // Show details
    if (localListings > 0) {
      console.log('🏠 Local Listings (not in Neon):');
      const localListingsData = await localPrisma.listing.findMany({
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          createdAt: true,
        },
      });

      const neonListingIds = new Set(
        (await neonPrisma.listing.findMany({ select: { id: true } })).map(l => l.id)
      );

      localListingsData.forEach(listing => {
        const exists = neonListingIds.has(listing.id);
        console.log(`   ${exists ? '✅' : '❌'} ${listing.title} - $${listing.price.toLocaleString()}`);
        console.log(`      ID: ${listing.id} | Created: ${listing.createdAt.toISOString().split('T')[0]}`);
      });
      console.log('');
    }

    if (localBlogs > 0) {
      console.log('📝 Local Blog Posts (not in Neon):');
      const localBlogsData = await localPrisma.blogPost.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
        },
      });

      const neonBlogIds = new Set(
        (await neonPrisma.blogPost.findMany({ select: { id: true } })).map(b => b.id)
      );

      localBlogsData.forEach(blog => {
        const exists = neonBlogIds.has(blog.id);
        console.log(`   ${exists ? '✅' : '❌'} ${blog.title}`);
        console.log(`      ID: ${blog.id} | Slug: ${blog.slug} | Created: ${blog.createdAt.toISOString().split('T')[0]}`);
      });
      console.log('');
    }

    // Summary and recommendations
    console.log('═'.repeat(60));
    console.log('\n📋 Summary:\n');
    
    if (neonListings === 0 && neonBlogs === 0 && localListings > 0) {
      console.log('❌ Issue Found:');
      console.log('   - Neon database is EMPTY (0 listings, 0 blogs)');
      console.log('   - Local database has data that needs to be migrated');
      console.log('\n💡 Solution:');
      console.log('   1. Run: npm run migrate:to-neon');
      console.log('   2. This will copy all listings and blogs to Neon');
      console.log('   3. Verify with: npm run check:neon-db');
    } else if (localListings === neonListings && localBlogs === neonBlogs) {
      console.log('✅ Databases are in sync!');
    } else {
      console.log('⚠️  Databases are out of sync');
      console.log('   - Run migration to sync: npm run migrate:to-neon');
    }

  } catch (error) {
    console.error('❌ Error comparing databases:', error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await neonPrisma.$disconnect();
  }
}

compareDatabases()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
