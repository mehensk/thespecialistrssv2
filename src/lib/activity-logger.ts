import { prisma } from './prisma';
import { ActivityAction, ActivityItemType } from '@prisma/client';
import { headers } from 'next/headers';

interface LogActivityParams {
  userId: string;
  action: ActivityAction;
  itemType: ActivityItemType;
  itemId?: string;
  metadata?: Record<string, any>;
}

export async function logActivity(params: LogActivityParams) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    await prisma.activity.create({
      data: {
        userId: params.userId,
        action: params.action,
        itemType: params.itemType,
        itemId: params.itemId,
        metadata: params.metadata || {},
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Log error but don't throw - activity logging shouldn't break the main flow
    console.error('Failed to log activity:', error);
  }
}

// Helper functions for common activity types
export async function logAuthActivity(
  userId: string,
  action: 'LOGIN' | 'LOGOUT'
) {
  return logActivity({
    userId,
    action: action as ActivityAction,
    itemType: ActivityItemType.AUTH,
  });
}

export async function logListingActivity(
  userId: string,
  action: ActivityAction,
  listingId: string,
  metadata?: Record<string, any>
) {
  // Only fetch listing if metadata doesn't already have the info we need
  let enrichedMetadata = { ...metadata };
  
  // Check if we already have the essential metadata
  const needsFetch = !metadata?.uploadedBy || !metadata?.uploadedByName;
  
  if (needsFetch) {
    try {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: {
          userId: true,
          approvedBy: true,
          user: {
            select: { name: true, email: true },
          },
          approver: {
            select: { name: true, email: true },
          },
        },
      });

      if (listing) {
        enrichedMetadata = {
          ...enrichedMetadata,
          uploadedBy: listing.userId,
          uploadedByName: listing.user.name,
          uploadedByEmail: listing.user.email,
          approvedBy: listing.approvedBy || null,
          approvedByName: listing.approver?.name || null,
          approvedByEmail: listing.approver?.email || null,
        };
      }
    } catch (error) {
      console.error('Failed to fetch listing info for activity log:', error);
    }
  }

  return logActivity({
    userId,
    action,
    itemType: ActivityItemType.LISTING,
    itemId: listingId,
    metadata: enrichedMetadata,
  });
}

export async function logBlogActivity(
  userId: string,
  action: ActivityAction,
  blogId: string,
  metadata?: Record<string, any>
) {
  // Only fetch blog if metadata doesn't already have the info we need
  let enrichedMetadata = { ...metadata };
  
  // Check if we already have the essential metadata
  const needsFetch = !metadata?.uploadedBy || !metadata?.uploadedByName;
  
  if (needsFetch) {
    try {
      const blog = await prisma.blogPost.findUnique({
        where: { id: blogId },
        select: {
          userId: true,
          approvedBy: true,
          user: {
            select: { name: true, email: true },
          },
          approver: {
            select: { name: true, email: true },
          },
        },
      });

      if (blog) {
        enrichedMetadata = {
          ...enrichedMetadata,
          uploadedBy: blog.userId,
          uploadedByName: blog.user.name,
          uploadedByEmail: blog.user.email,
          approvedBy: blog.approvedBy || null,
          approvedByName: blog.approver?.name || null,
          approvedByEmail: blog.approver?.email || null,
        };
      }
    } catch (error) {
      console.error('Failed to fetch blog info for activity log:', error);
    }
  }

  return logActivity({
    userId,
    action,
    itemType: ActivityItemType.BLOG,
    itemId: blogId,
    metadata: enrichedMetadata,
  });
}

export async function logUserActivity(
  userId: string,
  action: ActivityAction,
  targetUserId: string,
  metadata?: Record<string, any>
) {
  return logActivity({
    userId,
    action,
    itemType: ActivityItemType.USER,
    itemId: targetUserId,
    metadata,
  });
}

