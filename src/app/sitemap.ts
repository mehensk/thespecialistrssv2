import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { buildCanonicalListingPath } from '@/lib/listing-slug';
import { getSiteUrl } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const coreStaticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/listings`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/how-we-work`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/developer-selling`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/investor-relations`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const listings = await prisma.listing.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const listingEntries: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${siteUrl}${buildCanonicalListingPath(listing.slug, listing.id)}`,
    lastModified: listing.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...coreStaticEntries, ...listingEntries];
}
