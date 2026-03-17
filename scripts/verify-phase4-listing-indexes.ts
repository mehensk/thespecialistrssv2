import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const EXPECTED_INDEXES = [
  'Listing_isPublished_createdAt_idx',
  'Listing_isPublished_listingType_createdAt_idx',
  'Listing_isPublished_propertyType_createdAt_idx',
  'Listing_isPublished_price_idx',
  'Listing_isPublished_size_idx',
] as const;

async function main() {
  const rows = await prisma.$queryRaw<Array<{ indexname: string; indexdef: string }>>`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'Listing'
      AND indexname = ANY (${EXPECTED_INDEXES}::text[])
    ORDER BY indexname
  `;

  const found = new Set(rows.map((row) => row.indexname));
  const missing = EXPECTED_INDEXES.filter((indexName) => !found.has(indexName));

  console.log('Found indexes:');
  rows.forEach((row) => {
    console.log(`- ${row.indexname}`);
  });

  if (missing.length > 0) {
    console.error('\nMissing indexes:');
    missing.forEach((indexName) => console.error(`- ${indexName}`));
    process.exitCode = 1;
    return;
  }

  console.log('\nAll expected Phase 4 indexes are present.');
}

main()
  .catch((error) => {
    console.error('Index verification failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
