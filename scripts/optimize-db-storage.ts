import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function getDatabaseStats() {
  console.log('📊 Database Storage Analysis\n');
  console.log('='.repeat(80));

  try {
    // Get total database size
    const totalSize = await prisma.$queryRaw<Array<{ size: string; size_bytes: bigint }>>`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) AS size,
        pg_database_size(current_database())::bigint AS size_bytes;
    `;
    
    console.log(`\n💾 Total Database Size: ${totalSize[0]?.size || 'Unknown'}`);
    const totalBytes = Number(totalSize[0]?.size_bytes || 0);
    console.log(`   Bytes: ${totalBytes.toLocaleString()}\n`);

    // Get table sizes
    const tables = ['"User"', '"Listing"', '"BlogPost"', '"Activity"'];
    
    console.log('📋 Table Sizes:');
    console.log('-'.repeat(80));
    
    for (const table of tables) {
      try {
        // Get row count
        const rowCount = await (prisma as any)[table.replace(/"/g, '').toLowerCase()].count();
        
        // Get table sizes
        const stats = await prisma.$queryRaw<Array<{
          total_size: string;
          data_size: string;
          index_size: string;
          total_bytes: bigint;
        }>>`
          SELECT 
            pg_size_pretty(pg_total_relation_size(${table}::regclass)) AS total_size,
            pg_size_pretty(pg_relation_size(${table}::regclass)) AS data_size,
            pg_size_pretty(pg_indexes_size(${table}::regclass)) AS index_size,
            pg_total_relation_size(${table}::regclass)::bigint AS total_bytes
        `;
        
        if (stats[0]) {
          const stat = stats[0];
          const percentage = totalBytes > 0 
            ? ((Number(stat.total_bytes) / totalBytes) * 100).toFixed(1)
            : '0.0';
          
          console.log(`\n${table}`);
          console.log(`  Rows: ${rowCount.toLocaleString()}`);
          console.log(`  Total: ${stat.total_size} (${percentage}%)`);
          console.log(`    Data: ${stat.data_size}`);
          console.log(`    Indexes: ${stat.index_size}`);
        }
      } catch (error: any) {
        console.log(`\n${table}: Error - ${error.message}`);
        // Try to at least get row count
        try {
          const rowCount = await (prisma as any)[table.replace(/"/g, '').toLowerCase()].count();
          console.log(`  Rows: ${rowCount.toLocaleString()}`);
        } catch (e) {
          // Ignore
        }
      }
    }

    // Get index sizes
    console.log('\n\n📑 Index Sizes:');
    console.log('-'.repeat(80));
    
    const indexes = await prisma.$queryRaw<Array<{
      schemaname: string;
      tablename: string;
      indexname: string;
      index_size: string;
      index_bytes: bigint;
    }>>`
      SELECT 
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
        pg_relation_size(indexrelid)::bigint AS index_bytes
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 20;
    `;
    
    let totalIndexSize = 0;
    for (const idx of indexes) {
      const bytes = Number(idx.index_bytes);
      totalIndexSize += bytes;
      console.log(`  ${idx.tablename}.${idx.indexname}: ${idx.index_size}`);
    }
    console.log(`\n  Total Index Size: ${(totalIndexSize / 1024 / 1024).toFixed(2)} MB`);

    // Get WAL size (if accessible)
    try {
      const walSize = await prisma.$queryRaw<Array<{ wal_size: string; wal_bytes: bigint }>>`
        SELECT 
          pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) AS wal_size,
          pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')::bigint AS wal_bytes;
      `;
      if (walSize[0]) {
        console.log(`\n📝 WAL Size: ${walSize[0].wal_size}`);
      }
    } catch (error) {
      // WAL size query might not work on all PostgreSQL versions
    }

    // Get bloat information
    console.log('\n\n🔍 Storage Optimization Recommendations:');
    console.log('='.repeat(80));
    
    const rowCounts = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.blogPost.count(),
      prisma.activity.count(),
    ]);

    const [userCount, listingCount, blogCount, activityCount] = rowCounts;
    
    console.log(`\n📊 Current Data:`);
    console.log(`  Users: ${userCount}`);
    console.log(`  Listings: ${listingCount}`);
    console.log(`  Blog Posts: ${blogCount}`);
    console.log(`  Activities: ${activityCount}`);

    if (activityCount > 50) {
      console.log(`\n⚠️  You have ${activityCount} activity records.`);
      console.log(`   Consider cleaning up old activities:`);
      console.log(`   npm run cleanup:activities -- --days 7 --keep 50`);
    }

    // Check for unused indexes
    console.log(`\n💡 Optimization Tips:`);
    console.log(`   1. Run VACUUM to reclaim space:`);
    console.log(`      This can free up space from deleted/updated rows`);
    console.log(`   2. Disable activity logging for login/logout:`);
    console.log(`      Add LOG_AUTH_ACTIONS=false to .env`);
    console.log(`   3. Consider removing composite indexes if not needed:`);
    console.log(`      Some indexes might be redundant`);
    console.log(`   4. Check Neon branches - each branch uses storage`);

  } catch (error) {
    console.error('❌ Error analyzing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function vacuumDatabase() {
  console.log('\n🧹 Running VACUUM to reclaim storage...\n');
  
  try {
    // Run VACUUM on all tables
    await prisma.$executeRaw`VACUUM ANALYZE`;
    console.log('✅ VACUUM completed successfully');
    console.log('   This may have freed up space from deleted/updated rows');
  } catch (error: any) {
    console.error('❌ Error running VACUUM:', error.message);
    console.log('\nNote: VACUUM requires appropriate permissions');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--vacuum') || args.includes('-v')) {
    await vacuumDatabase();
  } else {
    await getDatabaseStats();
    console.log('\n\n💡 To run VACUUM (reclaim storage), use:');
    console.log('   npm run optimize:db -- --vacuum');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

