import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMalformedSlugs() {
  console.log('🔍 Checking for malformed blog and listing slugs...\n');

  let blogFixed = 0;
  let listingFixed = 0;

  // Fix Blog Slugs
  console.log('=== BLOGS ===');
  const blogs = await prisma.blogPost.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  for (const blog of blogs) {
    const originalSlug = blog.slug;
    
    // Clean slug - remove newlines and other whitespace issues
    let cleanSlug = blog.slug
      .replace(/[\n\r\t]/g, '')    // Remove newlines, carriage returns, tabs
      .replace(/\s+/g, '-')        // Replace multiple spaces with single hyphen
      .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens

    if (originalSlug !== cleanSlug) {
      console.log(`\n📝 Blog: ${blog.title.substring(0, 50)}...`);
      console.log(`   Original: "${originalSlug.substring(0, 60)}${originalSlug.length > 60 ? '...' : ''}"`);
      console.log(`   Cleaned:  "${cleanSlug.substring(0, 60)}${cleanSlug.length > 60 ? '...' : ''}"`);

      // Check for conflicts
      const existing = await prisma.blogPost.findFirst({
        where: { 
          slug: cleanSlug,
          id: { not: blog.id }
        },
      });

      if (existing) {
        console.log(`   ⚠️  CONFLICT: Slug already exists. Skipping.`);
        continue;
      }

      // Update
      await prisma.blogPost.update({
        where: { id: blog.id },
        data: { slug: cleanSlug },
      });

      console.log(`   ✅ FIXED!`);
      blogFixed++;
    }
  }

  // Fix Listing Slugs
  console.log('\n=== LISTINGS ===');
  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  for (const listing of listings) {
    const originalId = listing.id;
    const title = listing.title;
    
    // Listings use ID for routing, but let's verify IDs are clean
    if (originalId.includes('\n') || originalId.includes('\r')) {
      console.log(`\n🏠 Listing: ${title.substring(0, 50)}...`);
      console.log(`   ID has newlines - this shouldn't happen`);
      console.log(`   Skipping (listings use ID for routing)`);
    }
  }

  console.log(`\n✅ COMPLETE!`);
  console.log(`   Blogs fixed: ${blogFixed}`);
  console.log(`   Listings checked: ${listings.length}`);

  await prisma.$disconnect();
}

fixMalformedSlugs()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
