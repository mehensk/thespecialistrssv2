import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Sanitizes a listing title to be used as a Cloudinary folder name.
 * Removes special characters, converts to lowercase, and replaces spaces with hyphens.
 * 
 * @param title - The listing title to sanitize
 * @returns A sanitized folder name safe for Cloudinary
 */
export function sanitizeFolderName(title: string): string {
  if (!title || typeof title !== 'string') {
    return 'listings';
  }

  return title
    .toLowerCase()
    .trim()
    // Replace spaces and multiple spaces with single hyphen
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens and alphanumeric
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 100 characters (Cloudinary folder name limit)
    .substring(0, 100)
    // Ensure it's not empty
    || 'listings';
}

/**
 * Sanitizes a filename into a Cloudinary-safe public_id base.
 * Keeps SEO-friendly words and hyphens.
 */
export function sanitizeImageBaseName(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'listing-image';
  }

  const withoutExtension = filename.replace(/\.[^/.]+$/, '');
  return (
    withoutExtension
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 120) || 'listing-image'
  );
}

function buildDuplicateSafePublicId(baseName: string): string {
  const suffix = randomUUID().replace(/-/g, '').slice(0, 6);
  return `${baseName}-${suffix}`;
}

/**
 * Uploads an image buffer to Cloudinary with minimal processing.
 * Since images are already optimized locally with Sharp, we only use Cloudinary for storage.
 * This minimizes credit consumption by avoiding unnecessary processing/transformations.
 * 
 * @param buffer - The image buffer (already processed/optimized locally)
 * @param folder - Cloudinary folder path
 * @param options - Optional upload options (currently unused to minimize processing)
 * @returns The secure URL of the uploaded image
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'listings',
  options?: {
    originalFilename?: string;
  }
): Promise<string> {
  const baseName = sanitizeImageBaseName(options?.originalFilename ?? 'listing-image');

  const uploadWithPublicId = async (publicId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          overwrite: false,
          // No format conversion - image is already optimized locally
          // No quality settings - already optimized with Sharp
          // No transformations - only consumes processing credits
          resource_type: 'image',
          invalidate: false,
          eager: undefined,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  };

  try {
    return await uploadWithPublicId(baseName);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    const isConflict =
      errorMessage.includes('already exists') ||
      errorMessage.includes('already in use') ||
      errorMessage.includes('conflict');

    if (!isConflict) {
      throw error;
    }

    return uploadWithPublicId(buildDuplicateSafePublicId(baseName));
  }
}

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export function extractPublicIdFromCloudinaryUrl(
  url: string,
  expectedCloudName: string | undefined = process.env.CLOUDINARY_CLOUD_NAME
): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'res.cloudinary.com') {
      return null;
    }

    const pathname = decodeURIComponent(parsed.pathname);
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length < 5) {
      return null;
    }

    const cloudName = segments[0];
    if (!cloudName) {
      return null;
    }

    if (expectedCloudName && cloudName !== expectedCloudName) {
      return null;
    }

    const imageIndex = segments.findIndex((segment) => segment === 'image');
    const uploadIndex = segments.findIndex((segment, idx) => segment === 'upload' && idx > imageIndex);
    if (imageIndex === -1 || uploadIndex === -1) {
      return null;
    }

    const tailSegments = segments.slice(uploadIndex + 1);
    const versionIndex = tailSegments.findIndex((segment) => /^v\d+$/.test(segment));
    if (versionIndex === -1) {
      return null;
    }

    const publicIdSegments = tailSegments.slice(versionIndex + 1);
    if (publicIdSegments.length === 0) {
      return null;
    }

    const lastIndex = publicIdSegments.length - 1;
    publicIdSegments[lastIndex] = publicIdSegments[lastIndex].replace(/\.[^.]+$/, '');

    const publicId = publicIdSegments.join('/').trim();
    return publicId.length > 0 ? publicId : null;
  } catch {
    return null;
  }
}

export interface CloudinaryDeleteResult {
  publicId: string;
  status: 'deleted' | 'not_found' | 'failed';
  error?: string;
}

export async function deleteCloudinaryResourcesByPublicIds(
  publicIds: string[]
): Promise<CloudinaryDeleteResult[]> {
  const ids = [...new Set(publicIds.filter(Boolean))];
  if (ids.length === 0) {
    return [];
  }

  const response = await cloudinary.api.delete_resources(ids, {
    resource_type: 'image',
    type: 'upload',
    invalidate: false,
  });

  const deletedMap = (response?.deleted ?? {}) as Record<string, string>;

  return ids.map((publicId) => {
    const outcome = deletedMap[publicId];
    if (outcome === 'deleted') {
      return { publicId, status: 'deleted' as const };
    }
    if (outcome === 'not_found') {
      return { publicId, status: 'not_found' as const };
    }
    return {
      publicId,
      status: 'failed' as const,
      error: typeof outcome === 'string' ? outcome : 'Unknown Cloudinary delete outcome',
    };
  });
}
