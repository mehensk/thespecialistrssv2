import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { uploadToCloudinary, isCloudinaryConfigured, sanitizeFolderName } from '@/lib/cloudinary';
import { logger } from '@/lib/logger';

// Industry standard: 2000 x 1500 pixels (4:3 aspect ratio)
const TARGET_WIDTH = 2000;
const TARGET_HEIGHT = 1500;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  try {
    // Get token directly from JWT (more reliable than auth() in API routes)
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Check if token exists
    if (!token || !token.id) {
      logger.debug('Upload unauthorized - missing token:', {
        hasToken: !!token,
        hasTokenId: !!token?.id,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role from token or database
    let userRole = token.role as UserRole | string | undefined;
    
    // If role is missing from token, fetch from database
    if (!userRole && token.id) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (user) {
          userRole = user.role;
        } else {
          logger.debug('Upload unauthorized - user not found:', {
            userId: token.id,
          });
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      } catch (error) {
        logger.error('Error fetching user role:', error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Allow authenticated users (ADMIN, AGENT, WRITER) to upload images
    // All these roles need to upload images for their content
    const allowedRoles = [UserRole.ADMIN, UserRole.AGENT, UserRole.WRITER];
    
    // Check role (handle both enum and string comparisons)
    const roleString = String(userRole || '').toUpperCase();
    const isAllowedRole = userRole && (
      allowedRoles.includes(userRole as UserRole) ||
      roleString === 'ADMIN' || 
      roleString === 'AGENT' || 
      roleString === 'WRITER'
    );
    
    if (!isAllowedRole) {
      logger.debug('Upload unauthorized - invalid role:', {
        userId: token.id,
        userRole,
        userRoleType: typeof userRole,
        roleString,
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
    const { width, height, format } = metadata;

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

    // Process image: resize if needed, then optimize
    let processedImage: Buffer;
    if (needsResize) {
      processedImage = await sharp(buffer)
        .resize(targetWidth, targetHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    } else {
      // Just optimize without resizing
      processedImage = await sharp(buffer)
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    }

    // Use Cloudinary in production (if configured), otherwise use local storage
    let publicUrl: string;

    if (isCloudinaryConfigured()) {
      // Determine folder name: use sanitized listing title if provided, otherwise default to 'listings'
      const folderName = listingTitle 
        ? `listings/${sanitizeFolderName(listingTitle)}`
        : 'listings';
      
      // Upload to Cloudinary (production)
      publicUrl = await uploadToCloudinary(processedImage, folderName, {
        width: targetWidth,
        height: targetHeight,
      });
    } else {
      // Save locally (development)
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const filename = `listing-${timestamp}-${randomString}.jpg`;

      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'listings');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Save file
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, processedImage);

      // Return public URL
      publicUrl = `/uploads/listings/${filename}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      originalSize: { width, height },
      processedSize: { width: targetWidth, height: targetHeight },
    });
  } catch (error) {
    logger.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

