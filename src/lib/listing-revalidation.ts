import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';
import { logger } from '@/lib/logger';

export function revalidateListingCaches(listingId: string): void {
  try {
    revalidateTag(CACHE_TAGS.LISTING(listingId), 'max');
    revalidateTag(CACHE_TAGS.LISTINGS, 'max');
    revalidatePath('/listings');
    revalidatePath(`/listings/${listingId}`, 'page');
  } catch (error) {
    // Revalidation should never block successful mutations.
    logger.error('Failed to revalidate listing caches (non-critical):', {
      listingId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
