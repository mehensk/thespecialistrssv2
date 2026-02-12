import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBlogSlugs() {
  console.log('Checking for malformed blog slugs...\n');

  // Get all blog posts
  const blogs = await prisma.blogPost.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
    },
  });

  let fixedCount = 0;

  for (const blog of blogs) {
    const originalSlug = blog.slug;
    
    // Remove any newline, carriage return, or other whitespace characters from slug
    const cleanSlug = blog.slug
      .replace(/[\n\r\t]/g, '')  // Remove newlines and tabs
      .replace(/\s+/g, '-')        // Replace multiple spaces with single hyphen
      .replace(/-+/g, '-')         // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens

    if (originalSlug !== cleanSlug) {
      console.log(`\nFixing blog: ${blog.title.substring(0, 50)}...`);
      console.log(`  Original slug: "${originalSlug}"`);
      console.log(`  Clean slug:    "${cleanSlug}"`);

      // Check if clean slug already exists
      const existing = await prisma.blogPost.findUnique({
        where: { slug: cleanSlug },
      });

      if (existing && existing.id !== blog.id) {
        console.log(`  ⚠️  Conflict: Clean slug already exists for another blog. Skipping.`);
        continue;
      }

      // Update the slug
      await prisma.blogPost.update({
        where: { id: blog.id },
        data: { slug: cleanSlug },
      });

      console.log(`  ✅ Fixed!`);
      fixedCount++;
    }
  }

  console.log(`\n✅ Done! Fixed ${fixedCount} blog post slugs.`);

  await prisma.$disconnect();
}

fixBlogSlugs()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
