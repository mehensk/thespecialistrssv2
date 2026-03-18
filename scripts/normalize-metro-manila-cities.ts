import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { canonicalizeMetroManilaCity } from '../src/lib/location-utils';

dotenv.config();

const prisma = new PrismaClient();
const shouldApply = process.argv.includes('--apply');

type PlannedChange = {
  id: string;
  from: string;
  to: string;
};

async function main() {
  console.log(`Mode: ${shouldApply ? 'APPLY' : 'DRY RUN'}`);

  const listings = await prisma.listing.findMany({
    where: {
      city: {
        not: null,
      },
    },
    select: {
      id: true,
      city: true,
    },
  });

  const plannedChanges: PlannedChange[] = [];

  listings.forEach((listing) => {
    const currentCity = (listing.city || '').trim();
    if (!currentCity) return;

    const canonicalCity = canonicalizeMetroManilaCity(currentCity);
    if (!canonicalCity) return;

    if (currentCity !== canonicalCity) {
      plannedChanges.push({
        id: listing.id,
        from: currentCity,
        to: canonicalCity,
      });
    }
  });

  console.log(`Listings scanned: ${listings.length}`);
  console.log(`Rows to update: ${plannedChanges.length}`);

  if (plannedChanges.length === 0) {
    console.log('No Metro Manila city normalization changes needed.');
    return;
  }

  const grouped = new Map<string, number>();
  plannedChanges.forEach((change) => {
    const key = `${change.from} -> ${change.to}`;
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  });

  console.log('Planned mappings:');
  Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([mapping, count]) => {
      console.log(`  ${mapping}: ${count}`);
    });

  if (!shouldApply) {
    console.log('Dry run complete. Re-run with --apply to execute updates.');
    return;
  }

  let updatedCount = 0;
  for (const change of plannedChanges) {
    await prisma.listing.update({
      where: { id: change.id },
      data: { city: change.to },
    });
    updatedCount++;
  }

  console.log(`Applied updates: ${updatedCount}`);
}

main()
  .catch((error) => {
    console.error('Normalization script failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
