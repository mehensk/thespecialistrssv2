import { prisma } from '@/lib/prisma';

async function validateListingSlugs() {
  const [missingRows, invalidRows, duplicateRows] = await Promise.all([
    prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*)::int AS count
      FROM "Listing"
      WHERE "slug" IS NULL OR TRIM("slug") = ''
    `,
    prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*)::int AS count
      FROM "Listing"
      WHERE "slug" !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    `,
    prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*)::int AS count
      FROM (
        SELECT "slug"
        FROM "Listing"
        GROUP BY "slug"
        HAVING COUNT(*) > 1
      ) duplicate_slugs
    `,
  ]);

  const missing = missingRows[0]?.count ?? 0;
  const invalid = invalidRows[0]?.count ?? 0;
  const duplicates = duplicateRows[0]?.count ?? 0;

  console.log('Listing slug validation results');
  console.log(`Missing: ${missing}`);
  console.log(`Invalid format: ${invalid}`);
  console.log(`Duplicates: ${duplicates}`);

  if (missing > 0 || invalid > 0 || duplicates > 0) {
    process.exitCode = 1;
  }
}

validateListingSlugs()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Validation failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

