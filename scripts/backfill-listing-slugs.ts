import { prisma } from '@/lib/prisma';
import { listingSlugWithSuffix, slugifyListingTitle } from '@/lib/listing-slug';

type ListingRow = {
  id: string;
  title: string;
  slug: string | null;
};

function hasValue(value: string | null): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

async function backfillListingSlugs() {
  const listings = await prisma.$queryRaw<ListingRow[]>`
    SELECT "id", "title", "slug"
    FROM "Listing"
    ORDER BY "createdAt" ASC
  `;

  const usedSlugs = new Set<string>();
  for (const listing of listings) {
    if (hasValue(listing.slug)) {
      usedSlugs.add(listing.slug.trim().toLowerCase());
    }
  }

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const failedRows: Array<{ id: string; message: string }> = [];

  for (const listing of listings) {
    if (hasValue(listing.slug)) {
      skipped++;
      continue;
    }

    try {
      const baseSlug = slugifyListingTitle(listing.title);
      let finalSlug = baseSlug;

      if (usedSlugs.has(finalSlug)) {
        finalSlug = listingSlugWithSuffix(baseSlug, listing.id);
      }

      // Extremely unlikely, but keep deterministic uniqueness if suffix also collides.
      if (usedSlugs.has(finalSlug)) {
        const compactId = listing.id.toLowerCase().replace(/[^a-z0-9]/g, '');
        finalSlug = `${baseSlug}-${compactId.slice(-8) || compactId || '00000000'}`;
      }

      if (usedSlugs.has(finalSlug)) {
        throw new Error(`Could not resolve unique slug for listing ${listing.id}`);
      }

      await prisma.listing.update({
        where: { id: listing.id },
        data: { slug: finalSlug },
      });

      usedSlugs.add(finalSlug);
      updated++;
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      failedRows.push({ id: listing.id, message });
      console.error(`Failed slug backfill for listing ${listing.id}: ${message}`);
    }
  }

  console.log('Listing slug backfill completed');
  console.log(`Total: ${listings.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);

  if (failedRows.length > 0) {
    console.error('Failed listing IDs:');
    for (const row of failedRows) {
      console.error(`- ${row.id}: ${row.message}`);
    }
    process.exitCode = 1;
  }
}

backfillListingSlugs()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Backfill execution failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
