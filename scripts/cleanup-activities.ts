import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

interface CleanupOptions {
  daysOld?: number;
  keepRecent?: number;
  dryRun?: boolean;
  actionType?: string;
  itemType?: string;
}

async function cleanupActivities(options: CleanupOptions = {}) {
  const {
    daysOld = 30,
    keepRecent = 100,
    dryRun = false,
    actionType,
    itemType,
  } = options;

  console.log('🧹 Activity Log Cleanup');
  console.log('='.repeat(80));
  console.log(`\nOptions:`);
  console.log(`  Days Old: ${daysOld} (will keep activities newer than ${daysOld} days)`);
  console.log(`  Keep Recent: ${keepRecent} (will always keep the ${keepRecent} most recent)`);
  console.log(`  Dry Run: ${dryRun ? 'YES (no changes will be made)' : 'NO (will delete)'}`);
  if (actionType) console.log(`  Filter by Action: ${actionType}`);
  if (itemType) console.log(`  Filter by Item Type: ${itemType}`);
  console.log('');

  try {
    // Get total count before cleanup
    const totalBefore = await prisma.activity.count();
    console.log(`📊 Total activities before cleanup: ${totalBefore.toLocaleString()}\n`);

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Build where clause
    const where: any = {
      timestamp: {
        lt: cutoffDate,
      },
    };

    if (actionType) {
      where.action = actionType;
    }

    if (itemType) {
      where.itemType = itemType;
    }

    // Get activities to delete (excluding the most recent ones)
    const activitiesToDelete = await prisma.activity.findMany({
      where,
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        id: true,
        action: true,
        itemType: true,
        timestamp: true,
      },
      // Skip the most recent ones we want to keep
      skip: 0,
    });

    // Get the most recent activities to keep
    const recentActivities = await prisma.activity.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      take: keepRecent,
      select: {
        id: true,
        timestamp: true,
      },
    });

    const recentIds = new Set(recentActivities.map(a => a.id));
    const activitiesToActuallyDelete = activitiesToDelete.filter(
      a => !recentIds.has(a.id)
    );

    console.log(`📋 Activities to delete: ${activitiesToActuallyDelete.length.toLocaleString()}`);
    
    if (activitiesToActuallyDelete.length > 0) {
      // Show breakdown by action
      const breakdown: Record<string, number> = {};
      for (const activity of activitiesToActuallyDelete) {
        const key = `${activity.action}/${activity.itemType}`;
        breakdown[key] = (breakdown[key] || 0) + 1;
      }

      console.log('\nBreakdown by action/itemType:');
      for (const [key, count] of Object.entries(breakdown).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${key.padEnd(20)}: ${count.toLocaleString()}`);
      }

      // Show date range
      const oldest = activitiesToActuallyDelete[0]?.timestamp;
      const newest = activitiesToActuallyDelete[activitiesToActuallyDelete.length - 1]?.timestamp;
      if (oldest && newest) {
        console.log(`\nDate range: ${oldest.toISOString().split('T')[0]} to ${newest.toISOString().split('T')[0]}`);
      }

      if (!dryRun) {
        console.log('\n🗑️  Deleting activities...');
        const deleteIds = activitiesToActuallyDelete.map(a => a.id);
        
        // Delete in batches to avoid overwhelming the database
        const batchSize = 1000;
        let deleted = 0;
        
        for (let i = 0; i < deleteIds.length; i += batchSize) {
          const batch = deleteIds.slice(i, i + batchSize);
          await prisma.activity.deleteMany({
            where: {
              id: {
                in: batch,
              },
            },
          });
          deleted += batch.length;
          process.stdout.write(`\r  Deleted: ${deleted.toLocaleString()} / ${deleteIds.length.toLocaleString()}`);
        }
        console.log('\n');

        const totalAfter = await prisma.activity.count();
        const deletedCount = totalBefore - totalAfter;
        
        console.log(`\n✅ Cleanup complete!`);
        console.log(`   Deleted: ${deletedCount.toLocaleString()} activities`);
        console.log(`   Remaining: ${totalAfter.toLocaleString()} activities`);
        console.log(`   Space freed: ~${estimateSpaceFreed(deletedCount)}`);
      } else {
        console.log('\n⚠️  DRY RUN - No activities were deleted');
        console.log(`   Would delete: ${activitiesToActuallyDelete.length.toLocaleString()} activities`);
        console.log(`   Would keep: ${(totalBefore - activitiesToActuallyDelete.length).toLocaleString()} activities`);
        console.log(`   Estimated space freed: ~${estimateSpaceFreed(activitiesToActuallyDelete.length)}`);
      }
    } else {
      console.log('✅ No activities to delete (all are recent or match keep criteria)');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function estimateSpaceFreed(count: number): string {
  // Rough estimate: each activity record is ~500-1000 bytes on average
  // (includes id, userId, action, itemType, itemId, metadata JSON, ipAddress, userAgent, timestamp, plus index overhead)
  const avgBytesPerRecord = 750;
  const totalBytes = count * avgBytesPerRecord;
  
  if (totalBytes < 1024) return `${totalBytes} B`;
  if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(2)} KB`;
  return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
}

function showHelp() {
  console.log(`
Usage: npm run cleanup:activities [options]

Options:
  --dry-run, -d              Show what would be deleted without actually deleting
  --days, -D <number>        Delete activities older than this many days (default: 30)
  --keep, -k <number>        Always keep this many most recent activities (default: 100)
  --action, -a <action>      Only delete activities with this action type (LOGIN, LOGOUT, CREATE, etc.)
  --item-type, -i <type>     Only delete activities with this item type (LISTING, BLOG, USER, AUTH)
  --help, -h                 Show this help message

Examples:
  npm run cleanup:activities -- --dry-run
  npm run cleanup:activities -- --days 7 --keep 50
  npm run cleanup:activities -- --action LOGIN --days 14
  npm run cleanup:activities -- --dry-run --days 30
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  const options: CleanupOptions = {
    daysOld: 30,
    keepRecent: 100,
    dryRun: args.includes('--dry-run') || args.includes('-d'),
  };

  // Parse command line arguments
  const daysIndex = args.findIndex(arg => arg === '--days' || arg === '-D');
  if (daysIndex !== -1 && args[daysIndex + 1]) {
    options.daysOld = parseInt(args[daysIndex + 1], 10);
  }

  const keepIndex = args.findIndex(arg => arg === '--keep' || arg === '-k');
  if (keepIndex !== -1 && args[keepIndex + 1]) {
    options.keepRecent = parseInt(args[keepIndex + 1], 10);
  }

  const actionIndex = args.findIndex(arg => arg === '--action' || arg === '-a');
  if (actionIndex !== -1 && args[actionIndex + 1]) {
    options.actionType = args[actionIndex + 1];
  }

  const itemTypeIndex = args.findIndex(arg => arg === '--item-type' || arg === '-i');
  if (itemTypeIndex !== -1 && args[itemTypeIndex + 1]) {
    options.itemType = args[itemTypeIndex + 1];
  }

  if (options.dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }

  await cleanupActivities(options);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

