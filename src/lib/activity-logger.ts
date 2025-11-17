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
  return logActivity({
    userId,
    action,
    itemType: ActivityItemType.LISTING,
    itemId: listingId,
    metadata,
  });
}

export async function logBlogActivity(
  userId: string,
  action: ActivityAction,
  blogId: string,
  metadata?: Record<string, any>
) {
  return logActivity({
    userId,
    action,
    itemType: ActivityItemType.BLOG,
    itemId: blogId,
    metadata,
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

