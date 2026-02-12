import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugSlugDetails() {
  console.log('🔍 Debugging blog slug details...\n');

  const blogs = await prisma.blogPost.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
    },
  });

  for (const blog of blogs) {
    console.log(`\n📝 Blog: ${blog.title.substring(0, 40)}...`);
    console.log(`   Slug length: ${blog.slug.length}`);
    console.log(`   Slug (raw): "${blog.slug}"`);
    console.log(`   Slug (JSON): ${JSON.stringify(blog.slug)}`);
    console.log(`   Has newline: ${blog.slug.includes('\n') ? 'YES ❌' : 'NO ✅'}`);
    console.log(`   Has CR: ${blog.slug.includes('\r') ? 'YES ❌' : 'NO ✅'}`);
    console.log(`   Has tab: ${blog.slug.includes('\t') ? 'YES ❌' : 'NO ✅'}`);
    console.log(`   Is published: ${blog.isPublished}`);
    
    // Test if we can find it by slug
    const found = await prisma.blogPost.findUnique({
      where: { slug: blog.slug },
      select: { id: true },
    });
    console.log(`   Can find by slug: ${found ? 'YES ✅' : 'NO ❌'}`);
  }

  await prisma.$disconnect();
}

debugSlugDetails()
  .then(() => {
    console.log('\n✅ Debug complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
