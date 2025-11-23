'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useFileUpload } from '@/hooks/useFileUpload';

export default function NewBlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const {
    processFiles,
    handleImageUpload,
    handleDrop,
    handleDragOver,
    uploadingImages,
    error,
    setError,
    fileInputRef,
  } = useFileUpload({
    maxFiles: 5,
    onUploadSuccess: (url) => {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
    },
  });
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    images: [] as string[],
    coverPhotoIndex: 0, // Index of the cover photo
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title), // Always auto-generate slug from title
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleImageUpload(e, formData.images.length);
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    await handleDrop(e, formData.images.length);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      // Adjust cover photo index if needed
      let newCoverPhotoIndex = prev.coverPhotoIndex;
      if (index < prev.coverPhotoIndex) {
        newCoverPhotoIndex = prev.coverPhotoIndex - 1;
      } else if (index === prev.coverPhotoIndex && newImages.length > 0) {
        // If removing the cover photo, set first image as cover
        newCoverPhotoIndex = 0;
      } else if (newImages.length === 0) {
        newCoverPhotoIndex = 0;
      }
      // Ensure cover photo index is valid
      if (newCoverPhotoIndex >= newImages.length) {
        newCoverPhotoIndex = Math.max(0, newImages.length - 1);
      }
      return {
        ...prev,
        images: newImages,
        coverPhotoIndex: newCoverPhotoIndex,
      };
    });
  };

  const setCoverPhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      coverPhotoIndex: index,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title || !formData.content || !formData.slug) {
      setError('Title, content, and slug are required');
      setLoading(false);
      return;
    }

    try {
      // Reorder images so cover photo is first
      const reorderedImages = formData.images.length > 0
        ? (() => {
            const coverPhoto = formData.images[formData.coverPhotoIndex];
            const otherImages = formData.images.filter((_, i) => i !== formData.coverPhotoIndex);
            return [coverPhoto, ...otherImages];
          })()
        : [];

      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt,
          images: reorderedImages,
        }),
      });

      let data;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setError(`Server error: ${response.status} ${response.statusText}. Check console for details.`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to create blog post';
        const details = data.details ? `: ${data.details}` : '';
        setError(`${errorMsg}${details}`);
        console.error('Blog creation error:', data);
        setLoading(false);
        return;
      }

      // Show success message
      setSuccess(true);
      setError('');
      
      // Clear form
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        images: [],
        coverPhotoIndex: 0,
      });

      // Redirect to blogs list after showing success message
      setTimeout(() => {
        router.push('/dashboard/blogs');
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error('Error creating blog post:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/blogs"
          className="inline-flex items-center gap-2 text-[#111111]/70 hover:text-[#111111] mb-4"
        >
          <ArrowLeft size={20} />
          Back to Blogs
        </Link>
        <h1 className="text-3xl font-semibold text-[#111111]">Create New Blog Post</h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-8">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
            <CheckCircle size={20} />
            <span>Blog post created successfully! Redirecting to your blogs...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[#111111] mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              required
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
              placeholder="Enter blog post title"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-[#111111] mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: generateSlug(e.target.value) })
              }
              required
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent bg-gray-50"
              placeholder="url-friendly-slug"
            />
            <p className="text-sm text-[#111111]/70 mt-1">
              Auto-generated from title (URL-friendly version)
            </p>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-[#111111] mb-2">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent"
              placeholder="Short summary of the blog post"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-[#111111] mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={15}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1F2937] focus:border-transparent font-mono text-sm"
              placeholder="Write your blog post content here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111111] mb-2">
              Images <span className="text-[#111111]/50 font-normal">(Max 5 images)</span>
            </label>
            <p className="text-sm text-[#111111]/70 mb-3">
              Select a cover photo by clicking on an image. The cover photo will be used as the blog cover and card image. The rest will be evenly spaced throughout the content.
            </p>
            
            {/* Image Upload Area */}
            <div
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-[#E5E7EB] rounded-md p-6 text-center hover:border-[#1F2937] transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={formData.images.length >= 5}
              />
              <Upload size={32} className="mx-auto text-[#111111]/50 mb-2" />
              <p className="text-sm text-[#111111]/70 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-[#111111]/50">
                {formData.images.length >= 5 
                  ? 'Maximum 5 images reached' 
                  : `${formData.images.length}/5 images uploaded`}
              </p>
            </div>

            {/* Uploaded Images Preview */}
            {formData.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-[#111111]/70 mb-3">
                  Click on an image to set it as the cover photo
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {formData.images.map((imageUrl, index) => (
                    <div
                      key={index}
                      className={`relative group cursor-pointer ${
                        formData.coverPhotoIndex === index
                          ? 'ring-2 ring-[#1F2937] ring-offset-2 rounded-md'
                          : ''
                      }`}
                      onClick={() => setCoverPhoto(index)}
                    >
                      <div className="relative aspect-video rounded-md overflow-hidden border border-[#E5E7EB]">
                        <Image
                          src={imageUrl}
                          alt={`Upload ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 20vw"
                        />
                        {formData.coverPhotoIndex === index && (
                          <div className="absolute top-2 left-2 bg-[#1F2937] text-white text-xs px-2 py-1 rounded font-medium">
                            Cover Photo
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {uploadingImages.length > 0 && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                          <Loader2 size={24} className="animate-spin text-[#1F2937]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Blog Post'}
            </button>
            <Link
              href="/dashboard/blogs"
              className="bg-white border-2 border-[#1F2937] text-[#1F2937] px-6 py-3 rounded-md hover:bg-[#1F2937] hover:text-white transition-all duration-300 font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your blog post will be created but marked as "Pending Approval". 
          An admin will need to approve it before it's published and visible to the public.
        </p>
      </div>
    </div>
  );
}

