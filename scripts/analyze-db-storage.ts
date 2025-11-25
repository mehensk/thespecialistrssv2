import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

interface TableStats {
  tableName: string;
  rowCount: number;
  totalSize: string;
  tableSize: string;
  indexesSize: string;
  estimatedSizeBytes: number;
}

interface ActivityBreakdown {
  action: string;
  count: number;
}

interface SampleActivity {
  id: string;
  action: string;
  itemType: string;
  timestamp: Date;
  userAgent?: string | null;
  metadataSize: number;
}

async function getTableSizes(): Promise<TableStats[]> {
  // Prisma creates tables with quoted names (case-sensitive), so we need to query them directly
  const tables = [
    { model: 'User', prismaModel: 'user', tableName: '"User"' },
    { model: 'Listing', prismaModel: 'listing', tableName: '"Listing"' },
    { model: 'BlogPost', prismaModel: 'blogPost', tableName: '"BlogPost"' },
    { model: 'Activity', prismaModel: 'activity', tableName: '"Activity"' },
  ];
  const stats: TableStats[] = [];

  for (const { model, prismaModel, tableName } of tables) {
    try {
      // Get row count using Prisma
      const rowCount = await (prisma as any)[prismaModel].count();
      
      // Get table size using direct SQL with quoted table name
      const sizeResult = await prisma.$queryRaw<Array<{
        totalSize: string;
        tableSize: string;
        indexesSize: string;
        estimatedSizeBytes: bigint;
      }>>`
        SELECT 
          pg_size_pretty(pg_total_relation_size(${tableName}::regclass)) AS "totalSize",
          pg_size_pretty(pg_relation_size(${tableName}::regclass)) AS "tableSize",
          pg_size_pretty(pg_indexes_size(${tableName}::regclass)) AS "indexesSize",
          pg_total_relation_size(${tableName}::regclass)::bigint AS "estimatedSizeBytes"
      `;
      
      if (sizeResult[0]) {
        stats.push({
          tableName: `public.${tableName}`,
          rowCount,
          totalSize: sizeResult[0].totalSize,
          tableSize: sizeResult[0].tableSize,
          indexesSize: sizeResult[0].indexesSize,
          estimatedSizeBytes: Number(sizeResult[0].estimatedSizeBytes),
        });
      } else {
        stats.push({
          tableName: `public.${tableName}`,
          rowCount,
          totalSize: '0 bytes',
          tableSize: '0 bytes',
          indexesSize: '0 bytes',
          estimatedSizeBytes: 0,
        });
      }
    } catch (error: any) {
      // If table doesn't exist or query fails, still try to get row count
      let rowCount = 0;
      try {
        rowCount = await (prisma as any)[prismaModel].count();
      } catch (e) {
        // Table might not exist
      }
      
      stats.push({
        tableName: `public.${tableName}`,
        rowCount,
        totalSize: '0 bytes',
        tableSize: '0 bytes',
        indexesSize: '0 bytes',
        estimatedSizeBytes: 0,
      });
    }
  }

  return stats;
}

async function getActivityBreakdown() {
  const activities = await prisma.activity.groupBy({
    by: ['action'],
    _count: {
      id: true,
    },
  });

  return activities.map(a => ({
    action: a.action,
    count: a._count.id,
  }));
}

async function getActivityByType() {
  const activities = await prisma.activity.groupBy({
    by: ['itemType'],
    _count: {
      id: true,
    },
  });

  return activities.map(a => ({
    itemType: a.itemType,
    count: a._count.id,
    percentage: 0, // Will calculate after
  }));
}

async function getSampleActivities(limit: number = 5): Promise<SampleActivity[]> {
  const activities = await prisma.activity.findMany({
    take: limit,
    orderBy: {
      timestamp: 'desc',
    },
    select: {
      id: true,
      action: true,
      itemType: true,
      timestamp: true,
      userAgent: true,
      metadata: true,
    },
  });

  return activities.map(a => ({
    id: a.id,
    action: a.action,
    itemType: a.itemType,
    timestamp: a.timestamp,
    userAgent: a.userAgent,
    metadataSize: JSON.stringify(a.metadata || {}).length,
  }));
}

async function getDatabaseTotalSize(): Promise<string> {
  const result = await prisma.$queryRaw<Array<{ size: string; size_bytes: number }>>`
    SELECT 
      pg_size_pretty(pg_database_size(current_database())) AS size,
      pg_database_size(current_database()) AS size_bytes;
  `;
  
  return result[0]?.size || 'Unknown';
}

async function getLargestBlogPosts(limit: number = 5) {
  const blogs = await prisma.blogPost.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
      createdAt: true,
    },
  });

  return blogs.map(blog => ({
    id: blog.id,
    title: blog.title.substring(0, 50),
    contentSize: blog.content.length,
    excerptSize: blog.excerpt?.length || 0,
    createdAt: blog.createdAt,
  }));
}

async function getLargestListings(limit: number = 5) {
  const listings = await prisma.listing.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      description: true,
      images: true,
      amenities: true,
      createdAt: true,
    },
  });

  return listings.map(listing => ({
    id: listing.id,
    title: listing.title.substring(0, 50),
    descriptionSize: listing.description.length,
    imagesCount: listing.images.length,
    amenitiesSize: JSON.stringify(listing.amenities || {}).length,
    createdAt: listing.createdAt,
  }));
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function main() {
  console.log('🔍 Analyzing Database Storage Usage...\n');
  console.log('=' .repeat(80));

  try {
    // Get total database size
    const totalSize = await getDatabaseTotalSize();
    console.log(`\n📊 Total Database Size: ${totalSize}\n`);

    // Get table sizes
    console.log('📋 Table Storage Breakdown:');
    console.log('-'.repeat(80));
    const tableStats = await getTableSizes();
    
    // Get total database size once
    const dbSizeResult = await prisma.$queryRaw<Array<{ size_bytes: bigint }>>`
      SELECT pg_database_size(current_database())::bigint AS size_bytes;
    `;
    const dbTotalBytes = Number(dbSizeResult[0]?.size_bytes || 0);
    
    for (const stat of tableStats) {
      const percentage = dbTotalBytes > 0 
        ? ((stat.estimatedSizeBytes / dbTotalBytes) * 100).toFixed(1)
        : '0.0';
      
      console.log(`\n${stat.tableName.split('.')[1].toUpperCase()}`);
      console.log(`  Rows: ${stat.rowCount.toLocaleString()}`);
      console.log(`  Total Size: ${stat.totalSize}`);
      console.log(`    - Table Data: ${stat.tableSize}`);
      console.log(`    - Indexes: ${stat.indexesSize}`);
      console.log(`  Estimated: ${formatBytes(stat.estimatedSizeBytes)} (${percentage}%)`);
    }

    // Activity breakdown
    console.log('\n\n📈 Activity Log Breakdown:');
    console.log('-'.repeat(80));
    const activityBreakdown = await getActivityBreakdown();
    const totalActivities = activityBreakdown.reduce((sum, a) => sum + a.count, 0);
    
    if (totalActivities > 0) {
      console.log(`\nTotal Activities: ${totalActivities.toLocaleString()}\n`);
      for (const item of activityBreakdown) {
        const percentage = ((item.count / totalActivities) * 100).toFixed(1);
        console.log(`  ${item.action.padEnd(10)}: ${item.count.toString().padStart(6)} (${percentage}%)`);
      }

      const activityByType = await getActivityByType();
      const totalByType = activityByType.reduce((sum, a) => sum + a.count, 0);
      console.log(`\nBy Item Type:`);
      for (const item of activityByType) {
        const percentage = totalByType > 0 
          ? ((item.count / totalByType) * 100).toFixed(1)
          : '0.0';
        console.log(`  ${item.itemType.padEnd(10)}: ${item.count.toString().padStart(6)} (${percentage}%)`);
      }

      // Sample activities
      console.log('\n\n🔍 Sample Recent Activities (showing storage per record):');
      console.log('-'.repeat(80));
      const samples = await getSampleActivities(10);
      for (const sample of samples) {
        const userAgentSize = sample.userAgent?.length || 0;
        const totalRecordSize = sample.id.length + sample.action.length + 
                                sample.itemType.length + userAgentSize + 
                                sample.metadataSize + 50; // Approximate overhead
        console.log(`\n  ${sample.action} / ${sample.itemType}`);
        console.log(`    ID: ${sample.id.substring(0, 20)}...`);
        console.log(`    Timestamp: ${sample.timestamp.toISOString()}`);
        console.log(`    User Agent: ${userAgentSize} bytes`);
        console.log(`    Metadata: ${sample.metadataSize} bytes`);
        console.log(`    Estimated Record Size: ~${formatBytes(totalRecordSize)}`);
      }
    } else {
      console.log('\nNo activities found.');
    }

    // Blog posts analysis
    console.log('\n\n📝 Blog Posts Analysis:');
    console.log('-'.repeat(80));
    const blogCount = await prisma.blogPost.count();
    console.log(`\nTotal Blog Posts: ${blogCount}`);
    
    if (blogCount > 0) {
      const largestBlogs = await getLargestBlogPosts(5);
      console.log('\nLargest Blog Posts (by content size):');
      for (const blog of largestBlogs) {
        const totalSize = blog.contentSize + (blog.excerptSize || 0);
        console.log(`\n  "${blog.title}..."`);
        console.log(`    Content: ${formatBytes(blog.contentSize)}`);
        console.log(`    Excerpt: ${formatBytes(blog.excerptSize)}`);
        console.log(`    Total: ${formatBytes(totalSize)}`);
        console.log(`    Created: ${blog.createdAt.toISOString().split('T')[0]}`);
      }
    }

    // Listings analysis
    console.log('\n\n🏠 Listings Analysis:');
    console.log('-'.repeat(80));
    const listingCount = await prisma.listing.count();
    console.log(`\nTotal Listings: ${listingCount}`);
    
    if (listingCount > 0) {
      const largestListings = await getLargestListings(5);
      console.log('\nRecent Listings (showing data sizes):');
      for (const listing of largestListings) {
        const totalSize = listing.descriptionSize + listing.amenitiesSize;
        console.log(`\n  "${listing.title}..."`);
        console.log(`    Description: ${formatBytes(listing.descriptionSize)}`);
        console.log(`    Images: ${listing.imagesCount} URLs`);
        console.log(`    Amenities (JSON): ${formatBytes(listing.amenitiesSize)}`);
        console.log(`    Total Data: ${formatBytes(totalSize)}`);
        console.log(`    Created: ${listing.createdAt.toISOString().split('T')[0]}`);
      }
    }

    // Recommendations
    console.log('\n\n💡 Recommendations:');
    console.log('='.repeat(80));
    
    const activityStats = tableStats.find(s => s.tableName.includes('activity'));
    if (activityStats && activityStats.rowCount > 100) {
      console.log('\n⚠️  ACTIVITY TABLE CLEANUP RECOMMENDED:');
      console.log(`   You have ${activityStats.rowCount.toLocaleString()} activity records.`);
      console.log(`   This is likely from testing/development.`);
      console.log(`   Consider cleaning up old test activities.`);
      console.log(`\n   To clean up activities older than 30 days:`);
      console.log(`   Run: npm run cleanup:activities`);
    }

    if (blogCount > 0) {
      const largestBlogs = await getLargestBlogPosts(1);
      if (largestBlogs[0] && largestBlogs[0].contentSize > 100000) {
        console.log('\n⚠️  LARGE BLOG POSTS DETECTED:');
        console.log(`   Some blog posts have very large content (>100KB).`);
        console.log(`   Consider storing images externally and using shorter content.`);
      }
    }

    console.log('\n✅ Analysis complete!\n');

  } catch (error) {
    console.error('❌ Error analyzing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

