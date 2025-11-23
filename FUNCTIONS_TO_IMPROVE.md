# Functions That Can Be Improved

This document identifies functions in your codebase that have room for improvement in terms of:
- Error handling
- Input validation
- Code reusability
- Performance
- Type safety
- Security

---

## 🔴 Critical Issues

### 1. **Input Validation - Unsafe parseInt/parseFloat Usage**

**Location:** `src/app/api/listings/route.ts`, `src/app/api/listings/[id]/route.ts`, `src/app/api/blog-posts/route.ts`

**Problem:** Using `parseInt()` and `parseFloat()` without validation can lead to `NaN` values being stored in the database.

**Current Code:**
```typescript
// src/app/api/listings/route.ts (lines 64-65, 140-150)
const take = limit ? parseInt(limit) : undefined;
const skip = offset ? parseInt(offset) : undefined;
// ...
bedrooms: bedrooms ? parseInt(bedrooms) : null,
bathrooms: bathrooms ? parseInt(bathrooms) : null,
size: size ? parseFloat(size) : null,
```

**Issues:**
- `parseInt("abc")` returns `NaN`, which could be stored in the database
- No validation for negative numbers where inappropriate
- No validation for reasonable ranges (e.g., bedrooms shouldn't be 1000)

**Recommended Fix:**
```typescript
// Create a utility function
function safeParseInt(value: string | undefined | null, min?: number, max?: number): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return null;
  if (min !== undefined && parsed < min) return null;
  if (max !== undefined && parsed > max) return null;
  return parsed;
}

function safeParseFloat(value: string | undefined | null, min?: number, max?: number): number | null {
  if (!value) return null;
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return null;
  if (min !== undefined && parsed < min) return null;
  if (max !== undefined && parsed > max) return null;
  return parsed;
}

// Usage:
bedrooms: safeParseInt(bedrooms, 0, 50),
bathrooms: safeParseFloat(bathrooms, 0, 50),
size: safeParseFloat(size, 0, 100000),
```

---

### 2. **Missing Error Response in GET Handler**

**Location:** `src/app/api/blog-posts/route.ts` (line 62-65)

**Problem:** The catch block doesn't return a proper error response.

**Current Code:**
```typescript
} catch (error) {
  console.error('Error fetching blog posts:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

**Issue:** Missing error details that could help with debugging (similar to POST handler).

**Recommended Fix:**
```typescript
} catch (error) {
  console.error('Error fetching blog posts:', error);
  const errorMessage = error instanceof Error ? error.message : 'Internal server error';
  return NextResponse.json(
    { 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    },
    { status: 500 }
  );
}
```

---

### 3. **Activity Logger Makes Unnecessary Database Queries**

**Location:** `src/lib/activity-logger.ts` (lines 50-96, 98-144)

**Problem:** `logListingActivity` and `logBlogActivity` fetch the listing/blog from the database just to enrich metadata, even when the metadata is already provided.

**Current Code:**
```typescript
export async function logListingActivity(
  userId: string,
  action: ActivityAction,
  listingId: string,
  metadata?: Record<string, any>
) {
  // Always fetches listing from DB, even if metadata already has the info
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    // ...
  });
  // ...
}
```

**Issues:**
- Extra database query on every activity log
- Slower response times
- Unnecessary database load
- The metadata is often already available in the calling function

**Recommended Fix:**
```typescript
export async function logListingActivity(
  userId: string,
  action: ActivityAction,
  listingId: string,
  metadata?: Record<string, any>
) {
  // Only fetch if metadata doesn't already have the info
  let enrichedMetadata = { ...metadata };
  
  if (!metadata?.uploadedBy || !metadata?.uploadedByName) {
    try {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: {
          userId: true,
          approvedBy: true,
          user: { select: { name: true, email: true } },
          approver: { select: { name: true, email: true } },
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
```

---

## 🟡 High Priority Issues

### 4. **Code Duplication - File Upload Processing**

**Location:** 
- `src/app/dashboard/listings/new/page.tsx` (lines 91-142)
- `src/app/dashboard/listings/[id]/edit/page.tsx` (lines 199-250)
- `src/app/dashboard/blogs/new/page.tsx` (lines 42-100)
- `src/app/dashboard/blogs/[id]/edit/page.tsx` (lines 99-157)

**Problem:** The `processFiles` function is duplicated across 4 different components with nearly identical code.

**Issues:**
- Maintenance burden - changes need to be made in 4 places
- Inconsistent behavior risk
- Code bloat

**Recommended Fix:**
Create a shared hook or utility:

```typescript
// src/hooks/useFileUpload.ts
import { useState, useRef } from 'react';

interface UseFileUploadOptions {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { maxFiles, maxFileSize = 20 * 1024 * 1024, onUploadSuccess, onUploadError } = options;
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[], currentImageCount: number = 0) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return [];

    // Check max files limit
    if (maxFiles && currentImageCount + fileArray.length > maxFiles) {
      const errorMsg = `You can only upload a maximum of ${maxFiles} images. You currently have ${currentImageCount} image(s).`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return [];
    }

    const uploadedUrls: string[] = [];

    for (const file of fileArray) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        const errorMsg = `File "${file.name}" is not an image. Please select an image file.`;
        setError(errorMsg);
        onUploadError?.(errorMsg);
        continue;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        const errorMsg = `File "${file.name}" exceeds ${maxFileSize / (1024 * 1024)}MB limit. Please select a smaller image.`;
        setError(errorMsg);
        onUploadError?.(errorMsg);
        continue;
      }

      const tempId = `${Date.now()}-${Math.random()}`;
      setUploadingImages((prev) => [...prev, tempId]);

      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload image');
        }

        uploadedUrls.push(data.url);
        onUploadSuccess?.(data.url);
        setError(''); // Clear any previous errors on success
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to upload image';
        setError(errorMsg);
        onUploadError?.(errorMsg);
      } finally {
        setUploadingImages((prev) => prev.filter((id) => id !== tempId));
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    return uploadedUrls;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, currentImageCount: number = 0) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    return await processFiles(files, currentImageCount);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, currentImageCount: number = 0) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      return await processFiles(files, currentImageCount);
    }
    return [];
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return {
    processFiles,
    handleImageUpload,
    handleDrop,
    handleDragOver,
    uploadingImages,
    error,
    setError,
    fileInputRef,
  };
}
```

---

### 5. **Missing Input Validation in Listing Creation**

**Location:** `src/app/api/listings/route.ts` (lines 89-168)

**Problem:** Limited validation on required fields and data types.

**Current Code:**
```typescript
const {
  title,
  description,
  // ... no validation
} = body;
```

**Issues:**
- No length validation (title could be empty string or extremely long)
- No validation for required fields like `title`, `description`, `location`
- No validation for enum values (`listingType`, `propertyType`)
- No validation for reasonable ranges

**Recommended Fix:**
```typescript
// Add validation function
function validateListingInput(body: any): { valid: boolean; error?: string } {
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    return { valid: false, error: 'Title is required and must be a non-empty string' };
  }
  if (body.title.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }
  
  if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
    return { valid: false, error: 'Description is required and must be a non-empty string' };
  }
  if (body.description.length > 10000) {
    return { valid: false, error: 'Description must be less than 10000 characters' };
  }
  
  if (!body.location || typeof body.location !== 'string' || body.location.trim().length === 0) {
    return { valid: false, error: 'Location is required and must be a non-empty string' };
  }

  const validPropertyTypes = ['condominium', 'house-and-lot', 'townhouse', 'apartment', 'penthouse', 'lot', 'building', 'commercial'];
  if (body.propertyType && !validPropertyTypes.includes(body.propertyType)) {
    return { valid: false, error: 'Invalid property type' };
  }

  const validListingTypes = ['sale', 'rent'];
  if (body.listingType && !validListingTypes.includes(body.listingType)) {
    return { valid: false, error: 'Invalid listing type' };
  }

  return { valid: true };
}

// In POST handler:
const validation = validateListingInput(body);
if (!validation.valid) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}
```

---

### 6. **Inconsistent Error Handling in Activity Logging**

**Location:** `src/app/api/listings/route.ts` (line 159)

**Problem:** Activity logging can fail silently, and there's no error handling wrapper.

**Current Code:**
```typescript
await logListingActivity(session.user.id, ActivityAction.CREATE, listing.id, {
  title: listing.title,
});
```

**Issue:** If activity logging fails, the listing creation still succeeds, but there's no record. This is inconsistent with the blog post creation which has a try-catch.

**Recommended Fix:**
```typescript
// Log activity - don't let this break the response
try {
  await logListingActivity(session.user.id, ActivityAction.CREATE, listing.id, {
    title: listing.title,
  });
} catch (activityError) {
  console.error('Failed to log activity (non-critical):', activityError);
}
```

---

## 🟢 Medium Priority Issues

### 7. **Type Safety - Using `any` in Query Builders**

**Location:** `src/app/api/listings/route.ts` (line 29), `src/app/api/blog-posts/route.ts` (line 15)

**Problem:** Using `any` type for Prisma where clauses reduces type safety.

**Current Code:**
```typescript
const where: any = {};
```

**Recommended Fix:**
```typescript
import { Prisma } from '@prisma/client';

const where: Prisma.ListingWhereInput = {};
// or
const where: Prisma.BlogPostWhereInput = {};
```

---

### 8. **Missing Transaction Handling**

**Location:** `src/app/api/listings/route.ts`, `src/app/api/blog-posts/route.ts`

**Problem:** When creating listings/blogs and logging activities, if the activity log fails after the main record is created, you have inconsistent state.

**Recommended Fix:**
Use Prisma transactions (though activity logging is non-critical, so current approach is acceptable):

```typescript
// Only if activity logging is critical
await prisma.$transaction(async (tx) => {
  const listing = await tx.listing.create({ /* ... */ });
  await tx.activity.create({ /* ... */ });
  return listing;
});
```

---

### 9. **Property ID Generation Could Collide**

**Location:** `src/app/api/listings/route.ts` (lines 8-19, 120-131)

**Problem:** While there's a collision check, it only tries 10 times. With high concurrency, this could still fail.

**Current Code:**
```typescript
let attempts = 0;
while (attempts < 10) {
  const existing = await prisma.listing.findFirst({
    where: { propertyId },
  });
  if (!existing) break;
  propertyId = generatePropertyId();
  attempts++;
}
```

**Recommended Fix:**
```typescript
// Use a more unique ID generation (timestamp + random)
function generatePropertyId(): string {
  const prefix = 'TSR';
  const timestamp = Date.now().toString(36).toUpperCase();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}-${timestamp}-${randomPart}`;
}

// Or use UUID:
import { randomUUID } from 'crypto';
function generatePropertyId(): string {
  return `TSR-${randomUUID().substring(0, 8).toUpperCase()}`;
}
```

---

### 10. **Missing Rate Limiting**

**Location:** All API routes

**Problem:** No rate limiting on API endpoints, making them vulnerable to abuse.

**Recommended Fix:**
Add rate limiting middleware or use a service like Upstash Rate Limit:

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

---

## 📝 Summary

### Priority Order for Fixes:

1. **Critical (Fix Immediately):**
   - Input validation for parseInt/parseFloat
   - Activity logger optimization
   - Missing error responses

2. **High Priority (Fix Soon):**
   - Extract file upload logic to shared hook
   - Add comprehensive input validation
   - Consistent error handling

3. **Medium Priority (Fix When Time Permits):**
   - Improve type safety
   - Better property ID generation
   - Add rate limiting

### Estimated Impact:

- **Performance:** Activity logger optimization could reduce database queries by ~30-40%
- **Reliability:** Input validation fixes will prevent data corruption
- **Maintainability:** Extracting file upload logic will reduce code duplication by ~200 lines
- **Security:** Rate limiting will protect against abuse

---

## 🛠️ Quick Wins

These can be fixed quickly with high impact:

1. **Wrap parseInt/parseFloat** - 30 minutes
2. **Add try-catch to activity logging** - 10 minutes
3. **Extract file upload hook** - 2-3 hours
4. **Add input validation** - 1-2 hours

