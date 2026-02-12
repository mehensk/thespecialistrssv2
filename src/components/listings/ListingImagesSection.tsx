'use client';

import { Loader2, Upload, X } from 'lucide-react';

interface ListingImagesSectionProps {
  images: string[];
  coverPhotoIndex: number;
  uploadingImages: string[];
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void>;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onSetCoverPhoto: (index: number) => void;
  onRemoveImage: (index: number) => void;
}

export function ListingImagesSection({
  images,
  coverPhotoIndex,
  uploadingImages,
  isDragging,
  fileInputRef,
  onFileUpload,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onSetCoverPhoto,
  onRemoveImage,
}: ListingImagesSectionProps) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-[#111111] border-b border-[#E5E7EB] pb-2">
        Images
      </h2>

      <div className="space-y-3">
        <div>
          <label htmlFor="imageUpload" className="block text-sm font-medium text-[#111111] mb-1.5">
            Upload Images
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer ${
              isDragging ? 'border-[#1F2937] bg-[#F3F4F6]' : 'border-[#E5E7EB] hover:border-[#1F2937]'
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={onFileUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-1.5 text-[#111111]/70 hover:text-[#111111] transition-colors">
              <Upload size={24} className="text-[#1F2937]" />
              <span className="text-sm font-medium">Click to upload images</span>
              <span className="text-xs hidden sm:block">or drag and drop</span>
              <span className="text-[10px] text-[#111111]/50">
                Recommended: 2000 x 1500px (4:3 ratio), Max 20MB per image
              </span>
            </div>
          </div>
        </div>

        {uploadingImages.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#111111]/70">
            <Loader2 size={14} className="animate-spin" />
            <span>Uploading {uploadingImages.length} image(s)...</span>
          </div>
        )}

        {images.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-[#111111]">Uploaded Images ({images.length})</p>
              <p className="text-[10px] text-[#111111]/70">Tap image to set cover photo</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative group cursor-pointer ${
                    coverPhotoIndex === index ? 'ring-2 ring-[#1F2937] ring-offset-2' : ''
                  }`}
                  onClick={() => onSetCoverPhoto(index)}
                >
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-28 sm:h-24 lg:h-32 object-cover rounded-md border border-[#E5E7EB]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EInvalid Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(index);
                    }}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X size={14} />
                  </button>
                  <div
                    className={`absolute bottom-0 left-0 right-0 text-white text-[10px] p-0.5 text-center ${
                      coverPhotoIndex === index ? 'bg-[#1F2937] font-semibold' : 'bg-black/50'
                    }`}
                  >
                    {coverPhotoIndex === index ? 'Cover' : `${index + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
