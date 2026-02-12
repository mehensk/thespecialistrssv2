import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBlogStatus() {
  console.log('Checking blog post status...\n');

  // Get all blog posts
  const blogs = await prisma.blogPost.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
      userId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`Found ${blogs.length} recent blog posts:\n`);

  blogs.forEach((blog) => {
    console.log(`ID: ${blog.id}`);
    console.log(`Title: ${blog.title}`);
    console.log(`Slug: ${blog.slug}`);
    console.log(`Is Published: ${blog.isPublished ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Created: ${blog.createdAt.toISOString()}`);
    console.log(`User ID: ${blog.userId}`);
    console.log('---');
  });

  // Check for any unpublished blogs
  const unpublished = await prisma.blogPost.findMany({
    where: { isPublished: false },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  console.log(`\nTotal unpublished blogs: ${unpublished.length}`);
  if (unpublished.length > 0) {
    console.log('Unpublished blog slugs:');
    unpublished.forEach((b) => console.log(`  - ${b.slug}`));
  }

  await prisma.$disconnect();
}

checkBlogStatus()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
