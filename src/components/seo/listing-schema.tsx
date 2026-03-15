interface ListingSchemaProps {
  canonicalUrl: string;
  listing: {
    title: string;
    description: string;
    price: number | null;
    listingType: string | null;
    images: string[];
    location: string;
    city: string | null;
    address: string | null;
    available: boolean;
    createdAt: Date | string;
  };
}

function toIsoString(date: Date | string): string {
  if (date instanceof Date) {
    return date.toISOString();
  }

  const parsed = new Date(date);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return new Date().toISOString();
}

function toAbsoluteImageUrl(imagePath: string, siteUrl: string): string {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  return `${siteUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
}

function toOfferAvailability(isAvailable: boolean): string {
  return isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
}

function toOfferCategory(listingType: string | null): string {
  if (listingType?.toLowerCase() === 'rent') {
    return 'Rent';
  }
  if (listingType?.toLowerCase() === 'sale') {
    return 'Sale';
  }
  return 'Real Estate';
}

export function ListingSchema({ canonicalUrl, listing }: ListingSchemaProps) {
  const siteUrl = new URL(canonicalUrl).origin;
  const imageUrls =
    listing.images && listing.images.length > 0
      ? listing.images.map((image) => toAbsoluteImageUrl(image, siteUrl))
      : [toAbsoluteImageUrl('/images/hero-condo.jpg', siteUrl)];

  const description = listing.description?.trim()
    ? listing.description.trim().slice(0, 300)
    : listing.title;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description,
    url: canonicalUrl,
    datePosted: toIsoString(listing.createdAt),
    image: imageUrls,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    itemOffered: {
      '@type': 'Place',
      name: listing.title,
      address: [listing.address, listing.location, listing.city].filter(Boolean).join(', '),
    },
  };

  if (listing.price && listing.price > 0) {
    schema.offers = {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'PHP',
      availability: toOfferAvailability(listing.available),
      category: toOfferCategory(listing.listingType),
      url: canonicalUrl,
    };
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
