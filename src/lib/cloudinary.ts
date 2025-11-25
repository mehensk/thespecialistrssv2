import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

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
    width?: number;
    height?: number;
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        // No format conversion - image is already optimized locally
        // No quality settings - already optimized with Sharp
        // No transformations - only consumes processing credits
        // Resource type explicitly set to avoid auto-detection overhead
        resource_type: 'image',
        // Don't invalidate CDN cache (saves processing)
        invalidate: false,
        // Use unique filename to avoid overwriting
        use_filename: false,
        // Don't perform any automatic transformations
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

    // Pipe the buffer to the upload stream
    uploadStream.end(buffer);
  });
}

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

