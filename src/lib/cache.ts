import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import { Prisma } from '@prisma/client';

// Cache tags for revalidation
export const CACHE_TAGS = {
  LISTINGS: 'listings',
  LISTING: (id: string) => `listing-${id}`,
  BLOG_POSTS: 'blog-posts',
  BLOG_POST: (slug: string) => `blog-post-${slug}`,
} as const;

// Cached function to get published listings
export async function getCachedListings(options?: {
  limit?: number;
  offset?: number;
}) {
  return unstable_cache(
    async () => {
      const listings = await prisma.listing.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          city: true,
          address: true,
          bedrooms: true,
          bathrooms: true,
          size: true,
          propertyType: true,
          listingType: true,
          images: true,
          parking: true,
          yearBuilt: true,
          floor: true,
          totalFloors: true,
          createdAt: true,
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit,
        skip: options?.offset,
      });
      return listings;
    },
    ['listings', JSON.stringify(options)],
    {
      revalidate: 60, // Revalidate every 60 seconds
      tags: [CACHE_TAGS.LISTINGS],
    }
  )();
}

// Cached function to get a single listing
export async function getCachedListing(id: string) {
  return unstable_cache(
    async () => {
      const listing = await prisma.listing.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          location: true,
          city: true,
          address: true,
          bedrooms: true,
          bathrooms: true,
          size: true,
          propertyType: true,
          listingType: true,
          images: true,
          yearBuilt: true,
          parking: true,
          floor: true,
          totalFloors: true,
          amenities: true,
          propertyId: true,
          available: true,
          isPublished: true,
          userId: true,
          createdAt: true,
          user: {
            select: { name: true, email: true },
          },
        },
      });
      return listing;
    },
    [`listing-${id}`],
    {
      revalidate: 300, // Revalidate every 5 minutes
      tags: [CACHE_TAGS.LISTING(id), CACHE_TAGS.LISTINGS],
    }
  )();
}

// Cached function to get published blog posts
export async function getCachedBlogPosts(options?: {
  limit?: number;
  offset?: number;
}) {
  return unstable_cache(
    async () => {
      const blogs = await prisma.blogPost.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          images: true,
          createdAt: true,
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit,
        skip: options?.offset,
      });
      return blogs;
    },
    ['blog-posts', JSON.stringify(options)],
    {
      revalidate: 60, // Revalidate every 60 seconds
      tags: [CACHE_TAGS.BLOG_POSTS],
    }
  )();
}

// Cached function to get a single blog post by slug
export async function getCachedBlogPost(slug: string) {
  return unstable_cache(
    async () => {
      const blog = await prisma.blogPost.findUnique({
        where: { slug },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          images: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { name: true, email: true },
          },
        },
      });
      return blog;
    },
    [`blog-post-${slug}`],
    {
      revalidate: 300, // Revalidate every 5 minutes
      tags: [CACHE_TAGS.BLOG_POST(slug), CACHE_TAGS.BLOG_POSTS],
    }
  )();
}

// Cached function to get listing IDs for ISR
export async function getCachedListingIds(limit: number = 100) {
  return unstable_cache(
    async () => {
      const listings = await prisma.listing.findMany({
        where: { isPublished: true },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return listings.map((listing) => listing.id);
    },
    [`listing-ids-${limit}`],
    {
      revalidate: 3600, // Revalidate every hour
      tags: [CACHE_TAGS.LISTINGS],
    }
  )();
}

// Cached function to get blog post slugs for ISR
export async function getCachedBlogSlugs(limit: number = 100) {
  return unstable_cache(
    async () => {
      const blogs = await prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return blogs.map((blog) => blog.slug);
    },
    [`blog-slugs-${limit}`],
    {
      revalidate: 3600, // Revalidate every hour
      tags: [CACHE_TAGS.BLOG_POSTS],
    }
  )();
}

