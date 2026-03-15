import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { buildCanonicalListingPath } from '@/lib/listing-slug';

export function revalidateListingCaches(listingId: string, slug?: string | null): void {
  try {
    revalidateTag(CACHE_TAGS.LISTING(listingId), 'max');
    revalidateTag(CACHE_TAGS.LISTINGS, 'max');
    revalidatePath('/listings');
    if (slug) {
      revalidatePath(buildCanonicalListingPath(slug, listingId), 'page');
    }
    revalidatePath(`/listings/${listingId}`, 'page');
  } catch (error) {
    // Revalidation should never block successful mutations.
    logger.error('Failed to revalidate listing caches (non-critical):', {
      listingId,
      slug,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
