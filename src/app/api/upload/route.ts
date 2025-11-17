import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Industry standard: 2000 x 1500 pixels (4:3 aspect ratio)
const TARGET_WIDTH = 2000;
const TARGET_HEIGHT = 1500;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

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

    // Generate unique filename
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
    const publicUrl = `/uploads/listings/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      originalSize: { width, height },
      processedSize: { width: targetWidth, height: targetHeight },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

