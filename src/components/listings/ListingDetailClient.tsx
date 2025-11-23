'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Share2, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ListingDetailContent } from './ListingDetailContent';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | null;
  location: string;
  city: string | null;
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size: number | null;
  propertyType: string | null;
  listingType: string | null;
  images: string[];
  yearBuilt: number | null;
  parking: number | null;
  floor: number | null;
  totalFloors: number | null;
  amenities: any;
  propertyId: string | null;
  available: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface ListingDetailClientProps {
  listing: Listing;
}

export function ListingDetailClient({ listing }: ListingDetailClientProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);

  // Keyboard navigation for zoom modal
  useEffect(() => {
    if (!isZoomed || !listing?.images) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomed(false);
        document.body.style.overflow = 'unset';
      } else if (e.key === 'ArrowLeft' && listing.images && listing.images.length > 0) {
        setZoomImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
      } else if (e.key === 'ArrowRight' && listing.images && listing.images.length > 0) {
        setZoomImageIndex((prev) => (prev + 1) % listing.images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed, listing?.images]);

  const nextImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const openZoom = (index: number) => {
    setZoomImageIndex(index);
    setIsZoomed(true);
    document.body.style.overflow = 'hidden';
  };

  const closeZoom = () => {
    setIsZoomed(false);
    document.body.style.overflow = 'unset';
  };

  const nextZoomImage = () => {
    if (listing.images && listing.images.length > 0) {
      setZoomImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevZoomImage = () => {
    if (listing.images && listing.images.length > 0) {
      setZoomImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const goToZoomImage = (index: number) => {
    setZoomImageIndex(index);
  };

  const handleRequestInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowRequestInfoModal(true);
  };

  const handleConfirmRequestInfo = () => {
    if (!listing) return;
    
    // Build the property link
    const propertyLink = typeof window !== 'undefined' 
      ? `${window.location.origin}/listings/${listing.id}`
      : `/listings/${listing.id}`;
    
    // Build the message according to user's format
    const propertyTitle = listing.title || 'Property';
    const propertyId = listing.propertyId || listing.id;
    const inquiryText = `Inquiry: ${propertyTitle}, Property ID ${propertyId} Property Link ${propertyLink}`;
    const messageText = 'I am interested in learning more about your property. Please contact me about it';
    const fullMessage = `${inquiryText}\n\nMessage: ${messageText}`;
    
    // Determine interest value based on listing type
    const interestValue = listing.listingType === 'rent' ? 'renting' : 'buying';
    
    // Build URL with query parameters
    const params = new URLSearchParams();
    params.set('interest', interestValue);
    params.set('message', fullMessage);
    
    // Navigate to contact page
    router.push(`/contact?${params.toString()}`);
    setShowRequestInfoModal(false);
  };

  return (
    <>
      <ListingDetailContent
        listing={listing}
        currentImageIndex={currentImageIndex}
        isSaved={isSaved}
        onImageChange={setCurrentImageIndex}
        onSaveToggle={() => setIsSaved(!isSaved)}
        onImageNavigation={{ next: nextImage, prev: prevImage, goTo: goToImage }}
        onZoom={openZoom}
        onRequestInfo={handleRequestInfoClick}
      />

      {/* Zoom Modal with Carousel */}
      {isZoomed && listing.images && listing.images.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeZoom}
        >
          {/* Close Button */}
          <button
            onClick={closeZoom}
            className="absolute top-4 right-4 z-60 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all backdrop-blur-sm"
            aria-label="Close zoom"
          >
            <X size={24} />
          </button>

          {/* Main Zoomed Image Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            {listing.images.length > 1 && (
              <button
                onClick={prevZoomImage}
                className="absolute left-4 md:left-8 z-60 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Zoomed Image */}
            <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center">
              <Image
                src={listing.images[zoomImageIndex]}
                alt={`${listing.title || 'Property Image'} - Image ${zoomImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Next Button */}
            {listing.images.length > 1 && (
              <button
                onClick={nextZoomImage}
                className="absolute right-4 md:right-8 z-60 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            )}

            {/* Image Counter */}
            {listing.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full text-lg z-60 backdrop-blur-sm">
                {zoomImageIndex + 1} / {listing.images.length}
              </div>
            )}

            {/* Thumbnail Carousel at Bottom */}
            {listing.images.length > 1 && (
              <div className="absolute bottom-20 left-0 right-0 z-60 px-4 md:px-8">
                <div className="max-w-7xl mx-auto overflow-x-auto pb-4">
                  <div className="flex gap-3 justify-center">
                    {listing.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => goToZoomImage(index)}
                        className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                          zoomImageIndex === index
                            ? 'border-white shadow-lg scale-110'
                            : 'border-white/30 hover:border-white/60'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Information Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRequestInfoModal}
        onClose={() => setShowRequestInfoModal(false)}
        onConfirm={handleConfirmRequestInfo}
        title="Request Information"
        message="Do you like more information for this listing?"
      />
    </>
  );
}

