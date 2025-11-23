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
        format: 'jpg',
        quality: 'auto:good',
        fetch_format: 'auto',
        ...(options && { transformation: [{ width: options.width, height: options.height, crop: 'limit' }] }),
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

