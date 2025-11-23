// Script to find and delete blog posts with external image URLs (i.ibb.co)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteExternalImageBlogs() {
  try {
    console.log('Searching for blog posts with external image URLs...\n');

    // Find all blog posts
    const allBlogs = await prisma.blogPost.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter blogs that have external image URLs (i.ibb.co)
    const blogsWithExternalImages = allBlogs.filter((blog) =>
      blog.images.some((img) => img.includes('i.ibb.co'))
    );

    if (blogsWithExternalImages.length === 0) {
      console.log('✅ No blog posts found with external image URLs (i.ibb.co).');
      return;
    }

    console.log(`Found ${blogsWithExternalImages.length} blog post(s) with external images:\n`);
    blogsWithExternalImages.forEach((blog, index) => {
      console.log(`  ${index + 1}. ${blog.title}`);
      console.log(`     ID: ${blog.id}`);
      console.log(`     Slug: ${blog.slug}`);
      console.log(`     Author: ${blog.user.name} (${blog.user.email})`);
      console.log(`     Published: ${blog.isPublished ? 'Yes' : 'No'}`);
      console.log(`     Images: ${blog.images.length}`);
      blog.images.forEach((img) => {
        if (img.includes('i.ibb.co')) {
          console.log(`       - ${img}`);
        }
      });
      console.log('');
    });

    console.log('Deleting these blog posts...\n');

    // Delete each blog post
    for (const blog of blogsWithExternalImages) {
      await prisma.blogPost.delete({
        where: { id: blog.id },
      });
      console.log(`✅ Deleted: ${blog.title} (${blog.id})`);
    }

    console.log(`\n✅ Successfully deleted ${blogsWithExternalImages.length} blog post(s) with external images.`);
  } catch (error) {
    console.error('Error deleting blog posts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteExternalImageBlogs();

