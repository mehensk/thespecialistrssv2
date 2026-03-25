import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { getAuthenticatedUser, hasRequiredRole } from '@/lib/auth-helpers';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  uploadToCloudinary,
  isCloudinaryConfigured,
  sanitizeFolderName,
  sanitizeImageBaseName,
} from '@/lib/cloudinary';
import { logger } from '@/lib/logger';

// Industry standard: 2000 x 1500 pixels (4:3 aspect ratio)
const TARGET_WIDTH = 2000;
const TARGET_HEIGHT = 1500;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user using centralized helper
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      logger.debug('Upload unauthorized: No valid authentication found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has required role
    const allowedRoles = [UserRole.ADMIN, UserRole.AGENT, UserRole.WRITER];
    if (!hasRequiredRole(user, allowedRoles)) {
      logger.debug('Upload unauthorized - invalid role:', {
        userId: user.id,
        userRole: user.role,
        allowedRoles,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const listingTitle = formData.get('listingTitle') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 20MB limit' }, { status: 400 });
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    const { width, height } = metadata;

    // Calculate target dimensions maintaining aspect ratio
    // Fit image within 2000x1500 bounds while maintaining aspect ratio
    // Only resize if image exceeds target dimensions
    let targetWidth = width || TARGET_WIDTH;
    let targetHeight = height || TARGET_HEIGHT;
    let needsResize = false;

    if (width && height) {
      const aspectRatio = width / height;
      const targetAspectRatio = TARGET_WIDTH / TARGET_HEIGHT;

      // Check if image needs resizing (exceeds target dimensions)
      if (width > TARGET_WIDTH || height > TARGET_HEIGHT) {
        needsResize = true;
        if (aspectRatio > targetAspectRatio) {
          // Image is wider than 4:3, fit to width (2000px)
          targetWidth = TARGET_WIDTH;
          targetHeight = Math.round(TARGET_WIDTH / aspectRatio);
        } else {
          // Image is taller or equal to 4:3, fit to height (1500px)
          targetWidth = Math.round(TARGET_HEIGHT * aspectRatio);
          targetHeight = TARGET_HEIGHT;
        }
      } else {
        // Image is smaller than target, keep original dimensions but optimize
        targetWidth = width;
        targetHeight = height;
      }
    }

    // Process image: auto-rotate based on EXIF orientation, resize if needed, then optimize
    let processedImage: Buffer;
    if (needsResize) {
      processedImage = await sharp(buffer)
        .rotate() // Auto-rotate based on EXIF orientation data
        .resize(targetWidth, targetHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    } else {
      // Just auto-rotate and optimize without resizing
      processedImage = await sharp(buffer)
        .rotate() // Auto-rotate based on EXIF orientation data
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    }

    // Use Cloudinary in production/serverless environments
    // In serverless (Netlify, Vercel, etc.), filesystem is read-only, so Cloudinary is required
    const isServerless = process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;
    const isProduction = process.env.NODE_ENV === 'production';
    
    let publicUrl: string;

    // Check Cloudinary configuration first
    if (isCloudinaryConfigured()) {
      // Determine folder name: use sanitized listing title if provided, otherwise default to 'listings'
      const folderName = listingTitle 
        ? `listings/${sanitizeFolderName(listingTitle)}`
        : 'listings';
      
      // Upload to Cloudinary (production/serverless)
      // Image is already processed locally with Sharp - no Cloudinary transformations needed
      // This minimizes credit consumption (only storage, no processing)
      publicUrl = await uploadToCloudinary(processedImage, folderName, {
        originalFilename: file.name,
      });
    } else if (isServerless || isProduction) {
      // In serverless/production environments, Cloudinary is required
      logger.error('Cloudinary not configured in serverless/production environment', {
        isServerless,
        isProduction,
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      });
      return NextResponse.json(
        { 
          error: 'Image upload service not configured. Please configure Cloudinary for production deployments.',
          details: 'Cloudinary is required on Netlify. See CLOUDINARY_SETUP.md for instructions.',
        },
        { status: 500 }
      );
    } else {
      // Save locally (development only - when not in serverless)
      try {
        const baseName = sanitizeImageBaseName(file.name);
        let filename = `${baseName}.jpg`;

        // Ensure uploads directory exists
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'listings');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        let counter = 1;
        while (existsSync(join(uploadsDir, filename))) {
          filename = `${baseName}-${counter}.jpg`;
          counter += 1;
        }

        // Save file
        const filepath = join(uploadsDir, filename);
        await writeFile(filepath, processedImage);

        // Return public URL
        publicUrl = `/uploads/listings/${filename}`;
      } catch (writeError) {
        // If local write fails (e.g., read-only filesystem), return error
        logger.error('Failed to write file locally:', writeError);
        return NextResponse.json(
          { error: 'Failed to save image. Please configure Cloudinary for image uploads.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      originalSize: { width, height },
      processedSize: { width: targetWidth, height: targetHeight },
    });
  } catch (error) {
    logger.error('Error uploading image:', error);
    
    // Return the actual error message if it's an Error instance
    // This helps with debugging authorization and other issues
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
    const errorStatus = errorMessage.includes('Unauthorized') ? 401 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: errorStatus }
    );
  }
}
