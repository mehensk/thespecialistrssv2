import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { buildCanonicalListingPath } from '@/lib/listing-slug';
import { getSiteUrl } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const listings = await prisma.listing.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return listings.map((listing) => ({
    url: `${siteUrl}${buildCanonicalListingPath(listing.slug, listing.id)}`,
    lastModified: listing.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }));
}
