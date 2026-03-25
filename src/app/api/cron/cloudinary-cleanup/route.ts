import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { isCloudinaryConfigured } from '@/lib/cloudinary';
import {
  isCloudinaryDeleteOnListingUpdateEnabled,
  processCloudinaryDeleteQueueBatch,
} from '@/lib/cloudinary-delete-queue';

function isAuthorizedCronRequest(request: NextRequest): boolean {
  const configuredSecret = process.env.CLOUDINARY_CLEANUP_CRON_SECRET;
  if (!configuredSecret) {
    return process.env.NODE_ENV !== 'production';
  }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  return token.length > 0 && token === configuredSecret;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    if (!isCloudinaryDeleteOnListingUpdateEnabled()) {
      return NextResponse.json({ success: true, skipped: true, reason: 'Deletion sync disabled by env flag' });
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ success: true, skipped: true, reason: 'Cloudinary not configured' });
    }

    const result = await processCloudinaryDeleteQueueBatch();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    logger.error('Cloudinary cleanup cron failed:', error);
    return NextResponse.json({ error: 'Cloudinary cleanup cron failed' }, { status: 500 });
  }
}
