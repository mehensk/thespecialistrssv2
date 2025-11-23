'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseFileUploadOptions {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  listingTitle?: string; // Optional listing title for folder organization
}

interface UseFileUploadReturn {
  processFiles: (files: FileList | File[], currentImageCount?: number) => Promise<string[]>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, currentImageCount?: number) => Promise<string[]>;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, currentImageCount?: number) => Promise<string[]>;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  uploadingImages: string[];
  error: string;
  setError: (error: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const {
    maxFiles,
    maxFileSize = 20 * 1024 * 1024, // 20MB default
    onUploadSuccess,
    onUploadError,
    listingTitle,
  } = options;

  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Use ref to store current listing title so it's always up-to-date
  const listingTitleRef = useRef<string | undefined>(listingTitle);
  
  // Update ref when listingTitle changes
  useEffect(() => {
    listingTitleRef.current = listingTitle;
  }, [listingTitle]);

  const processFiles = useCallback(
    async (files: FileList | File[], currentImageCount: number = 0): Promise<string[]> => {
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
      
      // First, validate all files and create tempIds for valid ones
      const validFiles: { file: File; tempId: string }[] = [];
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

        const tempId = `${Date.now()}-${Math.random()}-${file.name}`;
        validFiles.push({ file, tempId });
      }

      // Add all valid files to uploadingImages at once
      if (validFiles.length > 0) {
        setUploadingImages((prev) => [...prev, ...validFiles.map(f => f.tempId)]);
      }

      // Now process each valid file
      for (const { file, tempId } of validFiles) {

        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          
          // Include listing title if provided for folder organization
          // Use ref to get the most current title value
          const currentTitle = listingTitleRef.current;
          if (currentTitle) {
            uploadFormData.append('listingTitle', currentTitle);
          }

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
            credentials: 'include', // Ensure cookies are sent with the request
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
    },
    [maxFiles, maxFileSize, onUploadSuccess, onUploadError]
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, currentImageCount: number = 0): Promise<string[]> => {
      const files = e.target.files;
      if (!files || files.length === 0) return [];
      return await processFiles(files, currentImageCount);
    },
    [processFiles]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>, currentImageCount: number = 0): Promise<string[]> => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        return await processFiles(files, currentImageCount);
      }
      return [];
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

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

