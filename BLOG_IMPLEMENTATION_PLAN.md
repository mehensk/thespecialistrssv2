# Blog Implementation Plan - Editorial Design with Categories

## Overview
Implement editorial-style blog with category system, improved image distribution, and modern design based on wireframe while maintaining existing design system.

## Categories (7 Total)
- **All** - Show all blog posts
- **Market** - Market updates, trends
- **Guides** - How-to guides, tips
- **Neighborhoods** - Area spotlights
- **Insights** - Analysis, predictions
- **News** - Real estate news
- **Tips** - Quick tips and advice

## Design Decisions

### User Requirements
- ✅ Category navigation: Include "All" option + 6 categories
- ✅ Featured article: Most recently published blog
- ✅ Category tabs: Horizontal scrollable (mobile-friendly)
- ✅ Read time: Auto-calculated (200 words = 1 minute)
- ✅ Image distribution: Balanced algorithm (every 2-3 paragraphs)
- ✅ Max images: Increased from 5 to 10
- ✅ Category selection: Mandatory when creating
- ✅ Category editing: Admins can change after publishing
- ✅ Post counts: No, just category names
- ✅ Category badges: No icons/emojis, clean text only
- ✅ Related posts: Random selection from same category
- ✅ Existing posts: Re-process with new algorithm
- ✅ Admin view: Color-coded category badges

### Design System
Maintain existing design:
- Color palette: `#111111` (text), `#E5E7EB` (borders), `#1F2937` (accents)
- Shadow effects and hover animations
- Existing spacing and border styles
- Lucide React icons
- Responsive behavior
- Typography: Sans-serif for body, serif options for headings

---

## Phase 1: Database & Schema Updates

### 1.1 Update Prisma Schema
**File:** `prisma/schema.prisma`

Add category field to BlogPost model:
```prisma
model BlogPost {
  // ... existing fields ...
  
  category  String   @default("General")  // New field
  isFeatured Boolean @default(false)  // Optional for manual featuring
  
  @@index([category])  // New index for filtering
}
```

### 1.2 Define Valid Categories
Categories array:
```typescript
const VALID_CATEGORIES = [
  'Market',
  'Guides', 
  'Neighborhoods',
  'Insights',
  'News',
  'Tips',
  'General'  // Default for existing posts
] as const;
```

### 1.3 Create Migration
Run Prisma migration:
```bash
npx prisma migrate dev --name add_blog_category
```

### 1.4 Update Validation
**File:** `src/lib/validation.ts`

Add category validation:
```typescript
export function validateBlogPostInput(data: any) {
  // ... existing validation ...
  
  if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
    return {
      valid: false,
      error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
    };
  }
  
  return { valid: true };
}
```

### 1.5 Migration Script
**File:** `scripts/add-blog-categories.ts`

Update existing blog posts:
```typescript
// Default existing posts to "General"
// Update schema
// Add category field to all existing posts
```

**Status:** ⏳ Pending

---

## Phase 2: API Updates

### 2.1 Improved Image Distribution Algorithm
**File:** `src/app/api/blog-posts/route.ts`

**Problem:** Too much text in one area, too many images in another

**Solution:** Balanced distribution algorithm
```typescript
function distributeImagesBalanced(content: string, images: string[]): string {
  // First image is cover, skip it
  const contentImages = images.slice(1);
  
  if (contentImages.length === 0) return content;
  
  // Split content into paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length === 0) {
    // No paragraphs, append images at end
    return content + '\n\n' + contentImages.map(img => 
      `<div class="flex justify-center my-8"><img src="${img}" class="max-w-full h-auto rounded-lg" style="max-height: 600px;" /></div>`
    ).join('\n\n');
  }
  
  // Calculate spacing: insert every 2-3 paragraphs
  const spacing = Math.max(2, Math.floor(paragraphs.length / (contentImages.length + 1)));
  
  const result: string[] = [];
  let imageIndex = 0;
  
  for (let i = 0; i < paragraphs.length; i++) {
    result.push(paragraphs[i]);
    
    // Insert image after every 'spacing' paragraphs, but not after last paragraph
    if ((i + 1) % spacing === 0 && imageIndex < contentImages.length && i < paragraphs.length - 1) {
      result.push(`\n\n<div class="flex justify-center my-8"><img src="${contentImages[imageIndex]}" class="max-w-full h-auto rounded-lg" style="max-height: 600px;" /></div>\n\n`);
      imageIndex++;
    }
  }
  
  // Append remaining images at end
  while (imageIndex < contentImages.length) {
    result.push(`\n\n<div class="flex justify-center my-8"><img src="${contentImages[imageIndex]}" class="max-w-full h-auto rounded-lg" style="max-height: 600px;" /></div>\n\n`);
    imageIndex++;
  }
  
  return result.join('\n\n');
}
```

**Benefits:**
- Evenly distributes images throughout content
- Prevents image clustering at top or bottom
- Adapts based on paragraph count
- Minimum 2 paragraphs between images

### 2.2 Add Category Support to POST
Update POST endpoint to handle category:
```typescript
export async function POST(request: NextRequest) {
  // ... existing code ...
  
  const category = body.category || 'General';
  
  // Validate category
  const validation = validateBlogPostInput({...body, category});
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  
  // Process with balanced image distribution
  const processedContent = distributeImagesBalanced(content, images);
  
  const blog = await prisma.blogPost.create({
    data: {
      // ... existing fields ...
      category,  // New field
    },
  });
}
```

### 2.3 Add Category Filtering to GET
Update GET endpoint to filter by category:
```typescript
export async function GET(request: NextRequest) {
  // ... existing code ...
  
  const category = searchParams.get('category');
  const published = searchParams.get('published');
  
  let where: Prisma.BlogPostWhereInput = {
    isPublished: true,
  };
  
  // Filter by category (unless "All" is selected)
  if (category && category !== 'All') {
    where.category = category;
  }
  
  const blogs = await prisma.blogPost.findMany({
    where,
    // ... existing select, orderBy, take, skip
  });
  
  return NextResponse.json({ blogs });
}
```

### 2.4 Update PUT for Category Editing
Allow admins to change category after publishing:
```typescript
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // ... existing code ...
  
  const { category } = await request.json();
  
  // Validate category
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
  
  const blog = await prisma.blogPost.update({
    where: { id: params.id },
    data: { category },
  });
  
  // Revalidate cache
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  
  return NextResponse.json({ blog });
}
```

### 2.5 Re-process Existing Blog Posts
Create script to re-process images:
```typescript
// scripts/reprocess-blog-images.ts

async function reprocessAllBlogImages() {
  const blogs = await prisma.blogPost.findMany({
    where: { isPublished: true }
  });
  
  for (const blog of blogs) {
    const processedContent = distributeImagesBalanced(blog.content, blog.images);
    
    await prisma.blogPost.update({
      where: { id: blog.id },
      data: { content: processedContent }
    });
    
    console.log(`Reprocessed blog: ${blog.title}`);
  }
}
```

**Status:** ⏳ Pending

---

## Phase 3: Blog Index Page Redesign

### 3.1 Editorial Layout
**File:** `src/app/blog/page.tsx`

New layout structure:
```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = ['All', 'Market', 'Guides', 'Neighborhoods', 'Insights', 'News', 'Tips'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  
  // Fetch blogs based on category
  useEffect(() => {
    async function fetchBlogs() {
      const url = selectedCategory === 'All' 
        ? '/api/blog-posts?published=true'
        : `/api/blog-posts?published=true&category=${selectedCategory}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setBlogs(data.blogs || []);
    }
    fetchBlogs();
  }, [selectedCategory]);
  
  // Get featured blog (first one)
  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const otherBlogs = blogs.length > 1 ? blogs.slice(1) : [];
  
  return (
    <div className="min-h-screen bg-white pt-[84px]">
      {/* Category Navigation */}
      <div className="sticky top-[84px] bg-white border-b border-[#E5E7EB] z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-[#1F2937] text-white' 
                    : 'bg-[#f3f4f6] text-[#111111]/70 hover:bg-[#e5e7eb]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#111111] mb-4 text-center">
            Our Blog
          </h1>
          <p className="text-xl text-[#111111]/70 text-center max-w-2xl mx-auto">
            Insights, tips, and updates about real estate in Metro Manila
          </p>
        </div>
        
        {/* Featured Article */}
        {featuredBlog && (
          <section className="mb-16">
            <div className="text-sm text-[#111111]/60 mb-4 uppercase tracking-widest">
              Featured Story
            </div>
            <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-7">
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <Image
                  src={featuredBlog.images[0]}
                  alt={featuredBlog.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="bg-[#f9fafb] rounded-xl border border-[#E5E7EB] p-6 flex flex-col justify-center gap-3">
                <div className="text-xs text-[#111111]/60 uppercase tracking-widest">
                  {featuredBlog.category}
                </div>
                <h2 className="text-2xl font-semibold text-[#111111]">
                  {featuredBlog.title}
                </h2>
                <div className="text-sm text-[#111111]/60">
                  By {featuredBlog.user.name} · {calculateReadTime(featuredBlog.content)} min read
                </div>
                {featuredBlog.excerpt && (
                  <p className="text-[#111111]/70">
                    {featuredBlog.excerpt}
                  </p>
                )}
                <Link
                  href={`/blog/${featuredBlog.slug}`}
                  className="text-[#c5a46d] font-semibold"
                >
                  Read feature →
                </Link>
              </div>
            </div>
          </section>
        )}
        
        {/* Latest Posts */}
        <div className="text-lg text-[#111111]/60 mb-8 uppercase tracking-widest">
          Latest
        </div>
        
        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#111111]/70">No blog posts available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherBlogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group block"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-[#E5E7EB] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  {blog.images && blog.images.length > 0 && (
                    <div className="relative aspect-video w-full overflow-hidden">
                      <Image
                        src={blog.images[0]}
                        alt={blog.title}
                        fill
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="text-xs text-[#111111]/60 uppercase tracking-widest mb-3">
                      {blog.category}
                    </div>
                    
                    <h2 className="text-xl font-semibold text-[#111111] mb-3 line-clamp-2 group-hover:text-[#1F2937] transition-colors">
                      {blog.title}
                    </h2>
                    
                    {blog.excerpt && (
                      <p className="text-[#111111]/70 mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-[#111111]/60">
                      <div className="flex items-center gap-4">
                        <span>By {blog.user.name}</span>
                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span>{calculateReadTime(blog.content)} min read</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
```

**Key Features:**
- Sticky category navigation with horizontal scroll
- Featured article in editorial layout (image left, content right)
- Category badges on cards (no icons)
- Auto-calculated read time
- Category filtering
- Maintains existing design system

**Status:** ⏳ Pending

---

## Phase 4: Individual Blog Page Updates

### 4.1 Add Category Badge
**File:** `src/app/blog/[slug]/page.tsx`

Add category badge near title:
```typescript
<header className="mb-8">
  {/* Category Badge */}
  <div className="text-sm text-[#111111]/60 uppercase tracking-widest mb-4">
    {blog.category}
  </div>
  
  <h1 className="text-4xl md:text-5xl font-semibold text-[#111111] mb-6">
    {blog.title}
  </h1>
  
  {/* ... existing author info, date, etc. ... */}
</header>
```

### 4.2 Add Related Posts Section
Add related posts below article:
```typescript
// Fetch related posts
const relatedPosts = await prisma.blogPost.findMany({
  where: {
    category: blog.category,
    id: { not: blog.id },
    isPublished: true,
  },
  take: 3,
  orderBy: { createdAt: 'desc' },  // Take latest, then shuffle
});

// Shuffle for randomness
const shuffledRelated = relatedPosts.sort(() => Math.random() - 0.5);

// Render below article
<section className="mt-16 pt-12 border-t border-[#E5E7EB]">
  <h2 className="text-2xl font-semibold text-[#111111] mb-6">
    More in {blog.category}
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {shuffledRelated.map((post) => (
      <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
        <div className="bg-[#f9fafb] rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-[#111111] mb-2 group-hover:text-[#1F2937]">
            {post.title}
          </h3>
          <p className="text-sm text-[#111111]/70">
            {calculateReadTime(post.content)} min read
          </p>
        </div>
      </Link>
    ))}
  </div>
</section>
```

**Status:** ⏳ Pending

---

## Phase 5: Admin & Dashboard Updates

### 5.1 Dashboard - Category Selector
**File:** `src/app/dashboard/blogs/create-blog.tsx` (or similar)

Add mandatory category dropdown:
```typescript
const [category, setCategory] = useState('General');

<form onSubmit={handleSubmit}>
  {/* ... existing fields ... */}
  
  <div className="mb-6">
    <label className="block text-sm font-medium text-[#111111] mb-2">
      Category <span className="text-red-500">*</span>
    </label>
    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      required
      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#3b82f6]"
    >
      <option value="Market">Market</option>
      <option value="Guides">Guides</option>
      <option value="Neighborhoods">Neighborhoods</option>
      <option value="Insights">Insights</option>
      <option value="News">News</option>
      <option value="Tips">Tips</option>
      <option value="General">General</option>
    </select>
  </div>
  
  {/* Submit button ... */}
</form>
```

### 5.2 Admin Panel - Color-Coded Badges
**File:** `src/app/admin/blogs/blogs-view.tsx`

Add category column with color-coded badges:
```typescript
// Color map for categories
const CATEGORY_COLORS: Record<string, string> = {
  'Market': 'bg-blue-100 text-blue-800',
  'Guides': 'bg-green-100 text-green-800',
  'Neighborhoods': 'bg-purple-100 text-purple-800',
  'Insights': 'bg-orange-100 text-orange-800',
  'News': 'bg-red-100 text-red-800',
  'Tips': 'bg-yellow-100 text-yellow-800',
  'General': 'bg-gray-100 text-gray-800',
};

// In table
<thead>
  <tr>
    <th>Title</th>
    <th>Category</th>
    <th>Author</th>
    <th>Status</th>
    <th>Actions</th>
  </tr>
</thead>

<tbody>
  {blogs.map((blog) => (
    <tr key={blog.id}>
      <td>{blog.title}</td>
      <td>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          CATEGORY_COLORS[blog.category] || 'bg-gray-100 text-gray-800'
        }`}>
          {blog.category}
        </span>
      </td>
      <td>{blog.user.name}</td>
      {/* ... status, actions ... */}
    </tr>
  ))}
</tbody>
```

### 5.3 Category Filtering in Admin
Add category filter dropdown:
```typescript
const [filterCategory, setFilterCategory] = useState('All');

// Filter blogs
const filteredBlogs = blogs.filter(blog => 
  filterCategory === 'All' || blog.category === filterCategory
);

// Render filter dropdown
<select
  value={filterCategory}
  onChange={(e) => setFilterCategory(e.target.value)}
  className="px-4 py-2 border border-[#E5E7EB] rounded-lg"
>
  <option value="All">All Categories</option>
  <option value="Market">Market</option>
  {/* ... other categories ... */}
</select>
```

**Status:** ⏳ Pending

---

## Phase 6: Testing & Deployment

### 6.1 Testing Checklist
- [ ] Database migration successful
- [ ] Category creation works (mandatory validation)
- [ ] Category filtering works on blog index
- [ ] Horizontal scrollable tabs work on mobile
- [ ] Featured article displays correctly
- [ ] Category badges appear on cards
- [ ] Read time calculates correctly
- [ ] Image distribution is balanced
- [ ] Related posts show random selection
- [ ] Admin category selector works
- [ ] Admin color-coded badges display
- [ ] Category editing works after publishing
- [ ] Cache invalidation works after updates
- [ ] Responsive design works on all devices

### 6.2 Performance Testing
- [ ] Page load time under 2 seconds
- [ ] Category filtering is instant
- [ ] Image optimization (Next.js Image component)
- [ ] Database queries are optimized
- [ ] Cache tags working correctly

### 6.3 Deployment
- [ ] Run database migration in production
- [ ] Re-process all existing blog posts
- [ ] Deploy to production
- [ ] Test all features in production
- [ ] Monitor for any issues

**Status:** ⏳ Pending

---

## Files to Modify/Crate

1. `prisma/schema.prisma` - Add category field
2. `prisma/migrations/` - Create new migration
3. `scripts/add-blog-categories.ts` - Migration script for existing posts
4. `scripts/reprocess-blog-images.ts` - Re-process existing blog images
5. `src/lib/validation.ts` - Add category validation
6. `src/app/api/blog-posts/route.ts` - Add category support + image distribution
7. `src/app/api/blog-posts/[id]/route.ts` - Allow category editing
8. `src/app/blog/page.tsx` - Complete redesign with editorial layout
9. `src/app/blog/[slug]/page.tsx` - Add category badge + related posts
10. `src/app/dashboard/blogs/` - Add category selector
11. `src/app/admin/blogs/blogs-view.tsx` - Add color-coded badges + filtering
12. `BLOG_IMPLEMENTATION_PLAN.md` - This documentation file

---

## Migration Strategy

### Existing Data
1. **Backup Database** - Before running any migrations
2. **Add Category Field** - Default to "General" for all existing posts
3. **Re-process Images** - Run balanced distribution algorithm on all posts
4. **Update Categories** - Manually update categories for existing posts as needed
5. **Test Thoroughly** - Ensure no data loss

### Rollback Plan
If issues occur:
1. Restore from database backup
2. Revert code changes
3. Investigate issue
4. Re-deploy when fixed

---

## Success Criteria

✅ **Functional**
- All 7 categories work correctly
- Category filtering is instant
- Featured article shows most recent post
- Related posts display randomly from same category
- Image distribution is balanced throughout content

✅ **User Experience**
- Horizontal scrollable tabs on mobile
- Category selection is mandatory and clear
- Read time is calculated and displayed
- Visual design matches existing system
- Admins can easily filter by category

✅ **Technical**
- Database migration successful
- No performance degradation
- Cache invalidation works
- API endpoints are secure
- Responsive design works on all devices

---

## Timeline Estimate

- **Phase 1 (Database):** 1-2 hours
- **Phase 2 (API):** 2-3 hours
- **Phase 3 (Blog Index):** 3-4 hours
- **Phase 4 (Blog Post):** 1-2 hours
- **Phase 5 (Admin/Dashboard):** 2-3 hours
- **Phase 6 (Testing):** 1-2 hours

**Total:** 10-16 hours

---

## Notes

- Maintain existing design system colors and patterns
- Use existing Lucide icons
- Keep responsive behavior consistent
- Follow existing component structure
- Maintain approval workflow
- Keep SEO optimization
- Preserve caching strategy

---

*Created: January 9, 2026*
*Status: Planning Complete - Ready for Implementation*