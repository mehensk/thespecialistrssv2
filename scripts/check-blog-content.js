const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBlogContent() {
  try {
    const blogs = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        images: true,
      },
      take: 5,
    });

    console.log('=== Sample Blog Content Analysis ===\n');
    
    blogs.forEach((blog, index) => {
      console.log(`Blog ${index + 1}: ${blog.title}`);
      console.log(`Slug: ${blog.slug}`);
      console.log(`Images count: ${blog.images?.length || 0}`);
      console.log(`Content length: ${blog.content?.length || 0} characters`);
      console.log(`Content preview (first 200 chars):`);
      console.log(blog.content ? blog.content.substring(0, 200) : 'No content');
      console.log(`\nContent format check:`);
      console.log(`- Contains <img> tags: ${blog.content?.includes('<img') ? 'YES' : 'NO'}`);
      console.log(`- Contains <p> tags: ${blog.content?.includes('<p') ? 'YES' : 'NO'}`);
      console.log(`- Contains markdown #: ${blog.content?.includes('# ') ? 'YES' : 'NO'}`);
      console.log(`- Contains newlines: ${blog.content?.includes('\n') ? 'YES' : 'NO'}`);
      console.log('\n' + '='.repeat(80) + '\n');
    });

  } catch (error) {
    console.error('Error checking blog content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBlogContent();
