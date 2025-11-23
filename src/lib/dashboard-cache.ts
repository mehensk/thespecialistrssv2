import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

/**
 * Cached dashboard stats queries
 * Using Next.js unstable_cache for industry-standard data caching
 * Revalidates every 30 seconds to balance freshness and performance
 */
const CACHE_TTL = 30; // seconds

export async function getCachedSystemStats() {
  return unstable_cache(
    async () => {
      const [totalUsers, totalListings, totalBlogs, pendingListings, pendingBlogs] = await Promise.all([
        prisma.user.count(),
        prisma.listing.count(),
        prisma.blogPost.count(),
        prisma.listing.count({ where: { isPublished: false } }),
        prisma.blogPost.count({ where: { isPublished: false } }),
      ]);

      return {
        totalUsers,
        totalListings,
        totalBlogs,
        pendingListings,
        pendingBlogs,
      };
    },
    ['system-stats'],
    {
      revalidate: CACHE_TTL,
      tags: ['dashboard-stats'],
    }
  )();
}

export async function getCachedPersonalStats(userId: string) {
  return unstable_cache(
    async () => {
      const [myListings, myBlogs, myPendingListings, myPendingBlogs] = await Promise.all([
        prisma.listing.count({ where: { userId } }),
        prisma.blogPost.count({ where: { userId } }),
        prisma.listing.count({ where: { userId, isPublished: false } }),
        prisma.blogPost.count({ where: { userId, isPublished: false } }),
      ]);

      return {
        myListings,
        myBlogs,
        myPendingListings,
        myPendingBlogs,
      };
    },
    [`personal-stats-${userId}`],
    {
      revalidate: CACHE_TTL,
      tags: ['dashboard-stats', `user-${userId}`],
    }
  )();
}

