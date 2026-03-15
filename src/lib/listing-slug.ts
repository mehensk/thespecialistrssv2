const FALLBACK_SLUG = 'listing';
const MAX_SLUG_LENGTH = 120;
const SHORT_ID_LENGTH = 6;

export function slugifyListingTitle(title: string): string {
  const normalized = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const trimmed = normalized.slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, '');
  return trimmed || FALLBACK_SLUG;
}

export function listingSlugWithSuffix(baseSlug: string, id: string): string {
  const normalizedBase = slugifyListingTitle(baseSlug);
  const compactId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffix = compactId.slice(-6) || '000000';

  return `${normalizedBase}-${suffix}`;
}

export function shortIdFromListingId(id: string): string {
  const compactId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
  return compactId.slice(-SHORT_ID_LENGTH) || '000000';
}

export function buildCanonicalListingSegment(slug: string | null | undefined, id: string): string {
  const stableSlug = typeof slug === 'string' && slug.trim().length > 0 ? slug.trim() : FALLBACK_SLUG;
  return `${stableSlug}-${shortIdFromListingId(id)}`;
}

export function buildCanonicalListingPath(slug: string | null | undefined, id: string): string {
  return `/listings/${buildCanonicalListingSegment(slug, id)}`;
}

export function parseCanonicalListingSegment(segment: string): { slugPart: string; shortId: string } | null {
  const normalized = segment.trim().toLowerCase();
  const match = normalized.match(new RegExp(`^(.+)-([a-z0-9]{${SHORT_ID_LENGTH}})$`));
  if (!match) {
    return null;
  }

  const slugPart = match[1];
  const shortId = match[2];
  if (!slugPart || !shortId) {
    return null;
  }

  return { slugPart, shortId };
}

export function isCanonicalListingSegment(segment: string): boolean {
  return parseCanonicalListingSegment(segment) !== null;
}
