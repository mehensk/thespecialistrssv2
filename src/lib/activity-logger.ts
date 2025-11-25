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

// Activity logging configuration
const ENABLE_ACTIVITY_LOGGING = process.env.ENABLE_ACTIVITY_LOGGING !== 'false'; // Default: true (enabled)
const LOG_AUTH_ACTIONS = process.env.LOG_AUTH_ACTIONS === 'true'; // Default: false (skip login/logout)
const LOG_UPDATE_ACTIONS = process.env.LOG_UPDATE_ACTIONS === 'true'; // Default: false (skip updates)
const LOG_MINIMAL_DATA = process.env.LOG_MINIMAL_DATA === 'true'; // Default: false (store full data)

// Actions that are always logged (important actions)
const ALWAYS_LOG_ACTIONS: ActivityAction[] = [
  ActivityAction.APPROVE,
  ActivityAction.REJECT,
  ActivityAction.DELETE,
  ActivityAction.CREATE, // Creating content is important
];

// Actions that can be skipped if configured
const SKIPPABLE_ACTIONS: ActivityAction[] = [
  ActivityAction.LOGIN,
  ActivityAction.LOGOUT,
  ActivityAction.UPDATE,
];

function shouldLogActivity(action: ActivityAction): boolean {
  // If activity logging is disabled, don't log anything
  if (!ENABLE_ACTIVITY_LOGGING) {
    return false;
  }

  // Always log important actions
  if (ALWAYS_LOG_ACTIONS.includes(action)) {
    return true;
  }

  // Check if this is a skippable action
  if (SKIPPABLE_ACTIONS.includes(action)) {
    if (action === ActivityAction.LOGIN || action === ActivityAction.LOGOUT) {
      return LOG_AUTH_ACTIONS; // Only log if explicitly enabled
    }
    if (action === ActivityAction.UPDATE) {
      return LOG_UPDATE_ACTIONS; // Only log if explicitly enabled
    }
  }

  // Default: log everything else (CREATE, etc.)
  return true;
}

export async function logActivity(params: LogActivityParams) {
  // Check if we should log this activity
  if (!shouldLogActivity(params.action)) {
    return; // Silently skip logging
  }

  try {
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    // Only fetch headers if we're storing full data (saves overhead)
    if (!LOG_MINIMAL_DATA) {
      try {
        const headersList = await headers();
        ipAddress = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    null;
        userAgent = headersList.get('user-agent') || null;
      } catch (error) {
        // Headers might not be available in some contexts, that's okay
      }
    }

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

