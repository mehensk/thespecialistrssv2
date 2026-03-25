import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { deleteCloudinaryResourcesByPublicIds } from '@/lib/cloudinary';
import { randomUUID } from 'crypto';

type QueueStatus = 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED';

interface QueueRow {
  id: string;
  listingId: string | null;
  imageUrl: string;
  publicId: string;
  status: QueueStatus;
  attempts: number;
}

export interface FailedDeleteQueueItem {
  listingId?: string;
  imageUrl: string;
  publicId: string;
  error?: string;
}

export function isCloudinaryDeleteOnListingUpdateEnabled(): boolean {
  return process.env.CLOUDINARY_DELETE_ON_LISTING_UPDATE === 'true';
}

export function isCloudinaryDeleteStrictModeEnabled(): boolean {
  return process.env.CLOUDINARY_DELETE_STRICT === 'true';
}

export function getCloudinaryDeleteRetryConfig(): {
  maxAttempts: number;
  batchSize: number;
} {
  const maxAttempts = Number.parseInt(process.env.CLOUDINARY_DELETE_RETRY_MAX_ATTEMPTS || '5', 10);
  const batchSize = Number.parseInt(process.env.CLOUDINARY_DELETE_RETRY_BATCH_SIZE || '25', 10);

  return {
    maxAttempts: Number.isFinite(maxAttempts) && maxAttempts > 0 ? maxAttempts : 5,
    batchSize: Number.isFinite(batchSize) && batchSize > 0 ? batchSize : 25,
  };
}

function computeNextRetryAt(attempt: number): Date {
  const baseMinutes = 15;
  const maxMinutes = 24 * 60;
  const minutes = Math.min(maxMinutes, baseMinutes * Math.pow(2, Math.max(0, attempt - 1)));
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function enqueueCloudinaryDeleteFailures(items: FailedDeleteQueueItem[]): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const now = new Date();
  const values = Prisma.join(
    items.map((item) =>
      Prisma.sql`(
        ${randomUUID()},
        ${item.listingId ?? null},
        ${item.imageUrl},
        ${item.publicId},
        'PENDING',
        0,
        ${item.error ?? null},
        ${now},
        ${now},
        ${now}
      )`
    )
  );

  await prisma.$executeRaw`
    INSERT INTO "CloudinaryDeleteQueue"
      ("id", "listingId", "imageUrl", "publicId", "status", "attempts", "lastError", "nextRetryAt", "createdAt", "updatedAt")
    VALUES ${values}
  `;
}

export async function processCloudinaryDeleteQueueBatch(): Promise<{
  picked: number;
  completed: number;
  failed: number;
  skipped: number;
}> {
  const { batchSize, maxAttempts } = getCloudinaryDeleteRetryConfig();
  const now = new Date();

  const jobs = await prisma.$queryRaw<QueueRow[]>`
    SELECT "id", "listingId", "imageUrl", "publicId", "status", "attempts"
    FROM "CloudinaryDeleteQueue"
    WHERE "status" IN ('PENDING', 'FAILED')
      AND "nextRetryAt" <= ${now}
      AND "attempts" < ${maxAttempts}
    ORDER BY "createdAt" ASC
    LIMIT ${batchSize}
  `;

  let completed = 0;
  let failed = 0;
  let skipped = 0;

  for (const job of jobs) {
    const claimCount = await prisma.$executeRaw`
      UPDATE "CloudinaryDeleteQueue"
      SET "status" = 'PROCESSING', "attempts" = "attempts" + 1, "updatedAt" = ${new Date()}
      WHERE "id" = ${job.id}
        AND "status" IN ('PENDING', 'FAILED')
    `;

    if (claimCount === 0) {
      skipped += 1;
      continue;
    }

    const nextAttempt = job.attempts + 1;

    try {
      const [result] = await deleteCloudinaryResourcesByPublicIds([job.publicId]);
      if (result && (result.status === 'deleted' || result.status === 'not_found')) {
        await prisma.$executeRaw`
          UPDATE "CloudinaryDeleteQueue"
          SET "status" = 'COMPLETED', "processedAt" = ${new Date()}, "lastError" = NULL, "updatedAt" = ${new Date()}
          WHERE "id" = ${job.id}
        `;
        completed += 1;
      } else {
        const terminal = nextAttempt >= maxAttempts;
        await prisma.$executeRaw`
          UPDATE "CloudinaryDeleteQueue"
          SET "status" = 'FAILED',
              "lastError" = ${result?.error || 'Failed to delete image in Cloudinary'},
              "nextRetryAt" = ${terminal ? new Date('9999-12-31T00:00:00.000Z') : computeNextRetryAt(nextAttempt)},
              "updatedAt" = ${new Date()}
          WHERE "id" = ${job.id}
        `;
        failed += 1;
      }
    } catch (error) {
      const terminal = nextAttempt >= maxAttempts;
      const message = error instanceof Error ? error.message : 'Unexpected Cloudinary delete error';
      await prisma.$executeRaw`
        UPDATE "CloudinaryDeleteQueue"
        SET "status" = 'FAILED',
            "lastError" = ${message},
            "nextRetryAt" = ${terminal ? new Date('9999-12-31T00:00:00.000Z') : computeNextRetryAt(nextAttempt)},
            "updatedAt" = ${new Date()}
        WHERE "id" = ${job.id}
      `;
      failed += 1;
      logger.error('Cloudinary delete queue worker failed for item', {
        queueId: job.id,
        publicId: job.publicId,
        error: message,
      });
    }
  }

  return {
    picked: jobs.length,
    completed,
    failed,
    skipped,
  };
}
