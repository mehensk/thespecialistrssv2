import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugBlogSlugs() {
  console.log('Debugging blog slugs...\n');

  const blogs = await prisma.blogPost.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
    },
  });

  for (const blog of blogs) {
    console.log(`\nBlog: ${blog.title.substring(0, 40)}...`);
    console.log(`Raw slug length: ${blog.slug.length}`);
    console.log(`Raw slug (escaped): ${JSON.stringify(blog.slug)}`);
    console.log(`Has newline: ${blog.slug.includes('\n') ? 'YES ❌' : 'NO ✅'}`);
    console.log(`Has carriage return: ${blog.slug.includes('\r') ? 'YES ❌' : 'NO ✅'}`);
    
    // Try to fetch with the slug
    try {
      const found = await prisma.blogPost.findUnique({
        where: { slug: blog.slug },
      });
      console.log(`Can fetch by slug: ${found ? 'YES ✅' : 'NO ❌'}`);
    } catch (error) {
      console.log(`Can fetch by slug: NO ❌ (Error: ${error})`);
    }
  }

  await prisma.$disconnect();
}

debugBlogSlugs()
  .then(() => {
    console.log('\n✅ Debug complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
