/**
 * SEO utility functions for generating absolute URLs and metadata
 */
import { getSiteUrl } from '@/lib/site-url';

/**
 * Get absolute URL from a relative path
 * Uses NEXTAUTH_URL or falls back to localhost in development
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl = getSiteUrl();
  // Remove trailing slash from baseUrl and leading slash from path
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBaseUrl}${cleanPath}`;
}

/**
 * Get absolute image URL from a relative or absolute image path
 */
export function getAbsoluteImageUrl(imagePath: string): string {
  // If already absolute URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // If Cloudinary URL, return as-is
  if (imagePath.includes('cloudinary.com') || imagePath.includes('res.cloudinary.com')) {
    return imagePath;
  }
  // Otherwise, make it absolute
  return getAbsoluteUrl(imagePath);
}

/**
 * Get blog social image URL
 * Returns the first image if available, otherwise a default hero image
 */
export function getBlogSocialImage(images: string[] | null | undefined): string {
  if (images && images.length > 0 && images[0]) {
    return getAbsoluteImageUrl(images[0]);
  }
  // Default hero image for social sharing
  return getAbsoluteImageUrl('/images/hero-condo.jpg');
}

/**
 * Clean HTML content and truncate to specified length
 * Removes HTML tags and extra whitespace
 */
export function cleanDescription(content: string, maxLength: number): string {
  // Remove HTML tags
  const textOnly = content.replace(/<[^>]*>/g, '');
  // Replace multiple whitespace with single space
  const cleaned = textOnly.replace(/\s+/g, ' ').trim();
  // Truncate to max length
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  // Truncate and add ellipsis
  return cleaned.substring(0, maxLength).trim() + '...';
}

