'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ListingDetailContent } from './ListingDetailContent';
import { buildCanonicalListingPath } from '@/lib/listing-slug';

interface Listing {
  id: string;
  slug?: string | null;
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
  amenities: unknown;
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
  const imageCount = listing.images?.length ?? 0;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [canScrollMainPrev, setCanScrollMainPrev] = useState(imageCount > 1);
  const [canScrollMainNext, setCanScrollMainNext] = useState(imageCount > 1);
  const [canScrollZoomPrev, setCanScrollZoomPrev] = useState(imageCount > 1);
  const [canScrollZoomNext, setCanScrollZoomNext] = useState(imageCount > 1);
  const zoomOpenIndexRef = useRef(0);
  const canUsePortal = typeof window !== 'undefined' && typeof document !== 'undefined';

  const [mainViewportRef, mainEmblaApi] = useEmblaCarousel({
    loop: imageCount > 1,
    align: 'start',
    dragFree: false,
  });

  const [zoomViewportRef, zoomEmblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    dragFree: false,
  });

  const prefetchImage = useCallback((url: string | undefined) => {
    if (!url || typeof window === 'undefined') return;
    const img = new window.Image();
    img.decoding = 'async';
    img.src = url;
  }, []);

  useEffect(() => {
    if (!mainEmblaApi || imageCount <= 0) return;

    const updateMainState = () => {
      const index = mainEmblaApi.selectedScrollSnap();
      setCurrentImageIndex(index);
      setCanScrollMainPrev(imageCount > 1 && mainEmblaApi.canScrollPrev());
      setCanScrollMainNext(imageCount > 1 && mainEmblaApi.canScrollNext());
    };

    mainEmblaApi.on('select', updateMainState);
    mainEmblaApi.on('reInit', updateMainState);
    updateMainState();

    return () => {
      mainEmblaApi.off('select', updateMainState);
      mainEmblaApi.off('reInit', updateMainState);
    };
  }, [imageCount, mainEmblaApi]);

  useEffect(() => {
    if (!zoomEmblaApi || imageCount <= 0 || !isZoomed) return;

    const updateZoomState = () => {
      const index = zoomEmblaApi.selectedScrollSnap();
      setZoomImageIndex(index);
      setCanScrollZoomPrev(imageCount > 1 && zoomEmblaApi.canScrollPrev());
      setCanScrollZoomNext(imageCount > 1 && zoomEmblaApi.canScrollNext());
    };

    zoomEmblaApi.on('select', updateZoomState);
    zoomEmblaApi.on('reInit', updateZoomState);
    updateZoomState();

    return () => {
      zoomEmblaApi.off('select', updateZoomState);
      zoomEmblaApi.off('reInit', updateZoomState);
    };
  }, [imageCount, isZoomed, zoomEmblaApi]);

  useEffect(() => {
    if (!mainEmblaApi || mainEmblaApi.selectedScrollSnap() === currentImageIndex) return;
    mainEmblaApi.scrollTo(currentImageIndex, false);
  }, [currentImageIndex, mainEmblaApi]);

  useEffect(() => {
    if (!isZoomed || !zoomEmblaApi || imageCount === 0) return;

    const raf = window.requestAnimationFrame(() => {
      zoomEmblaApi.reInit();
      zoomEmblaApi.scrollTo(zoomOpenIndexRef.current, true);
    });

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [imageCount, isZoomed, zoomEmblaApi]);

  useEffect(() => {
    if (imageCount <= 1) return;
    const nextIndex = (currentImageIndex + 1) % imageCount;
    const prevIndex = (currentImageIndex - 1 + imageCount) % imageCount;
    prefetchImage(listing.images[nextIndex]);
    prefetchImage(listing.images[prevIndex]);
  }, [currentImageIndex, imageCount, listing.images, prefetchImage]);

  useEffect(() => {
    if (!isZoomed || imageCount <= 1) return;
    const nextIndex = (zoomImageIndex + 1) % imageCount;
    const prevIndex = (zoomImageIndex - 1 + imageCount) % imageCount;
    prefetchImage(listing.images[nextIndex]);
    prefetchImage(listing.images[prevIndex]);
  }, [imageCount, isZoomed, listing.images, prefetchImage, zoomImageIndex]);

  useEffect(() => {
    if (!isZoomed) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isZoomed]);

  useEffect(() => {
    if (!isZoomed || imageCount === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomed(false);
        return;
      }

      if (e.key === 'ArrowLeft') {
        zoomEmblaApi?.scrollPrev();
      }

      if (e.key === 'ArrowRight') {
        zoomEmblaApi?.scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageCount, isZoomed, zoomEmblaApi]);

  const nextMainImage = useCallback(() => {
    mainEmblaApi?.scrollNext();
  }, [mainEmblaApi]);

  const prevMainImage = useCallback(() => {
    mainEmblaApi?.scrollPrev();
  }, [mainEmblaApi]);

  const goToMainImage = useCallback(
    (index: number) => {
      setCurrentImageIndex(index);
      mainEmblaApi?.scrollTo(index, false);
    },
    [mainEmblaApi]
  );

  const openZoom = useCallback(
    (index: number) => {
      zoomOpenIndexRef.current = index;
      setZoomImageIndex(index);
      setIsZoomed(true);
    },
    []
  );

  const closeZoom = useCallback(() => {
    setIsZoomed(false);
  }, []);

  const nextZoomImage = useCallback(() => {
    zoomEmblaApi?.scrollNext();
  }, [zoomEmblaApi]);

  const prevZoomImage = useCallback(() => {
    zoomEmblaApi?.scrollPrev();
  }, [zoomEmblaApi]);

  const goToZoomImage = useCallback(
    (index: number) => {
      setZoomImageIndex(index);
      zoomEmblaApi?.scrollTo(index, false);
    },
    [zoomEmblaApi]
  );

  const handleRequestInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowRequestInfoModal(true);
  };

  const handleConfirmRequestInfo = () => {
    if (!listing) return;
    const listingPath = listing.slug ? buildCanonicalListingPath(listing.slug, listing.id) : `/listings/${listing.id}`;
    const propertyLink = typeof window !== 'undefined' ? `${window.location.origin}${listingPath}` : listingPath;
    const propertyTitle = listing.title || 'Property';
    const propertyId = listing.propertyId || listing.id;
    const inquiryText = `Inquiry: ${propertyTitle}, Property ID ${propertyId} Property Link ${propertyLink}`;
    const messageText = 'I am interested in learning more about your property. Please contact me about it';
    const fullMessage = `${inquiryText}\n\nMessage: ${messageText}`;
    const interestValue = listing.listingType === 'rent' ? 'renting' : 'buying';

    const params = new URLSearchParams();
    params.set('interest', interestValue);
    params.set('message', fullMessage);

    router.push(`/contact?${params.toString()}`);
    setShowRequestInfoModal(false);
  };

  return (
    <>
      <ListingDetailContent
        listing={listing}
        currentImageIndex={currentImageIndex}
        isSaved={isSaved}
        onSaveToggle={() => setIsSaved(!isSaved)}
        mainViewportRef={mainViewportRef}
        canScrollMainPrev={canScrollMainPrev}
        canScrollMainNext={canScrollMainNext}
        onMainPrev={prevMainImage}
        onMainNext={nextMainImage}
        onMainGoTo={goToMainImage}
        onMainImageLoaded={(index) => {
          if (index !== currentImageIndex) return;
          const nextIndex = (index + 1) % imageCount;
          const prevIndex = (index - 1 + imageCount) % imageCount;
          prefetchImage(listing.images[nextIndex]);
          prefetchImage(listing.images[prevIndex]);
        }}
        onZoom={openZoom}
        onRequestInfo={handleRequestInfoClick}
      />

      {isZoomed && imageCount > 0 && canUsePortal
        ? createPortal(
            <div className="fixed inset-0 z-[120] bg-black/95" onClick={closeZoom}>
              <div className="h-[100svh] w-full px-0 py-4 md:h-[100dvh] md:p-6" onClick={(e) => e.stopPropagation()}>
                <div className="relative flex h-full w-full min-h-0 min-w-0 flex-col gap-4">
                  <button
                    onClick={closeZoom}
                    className="absolute right-4 top-4 z-[70] rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                    aria-label="Close zoom"
                  >
                    <X size={24} />
                  </button>

                  <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg bg-black/60">
                    <div ref={zoomViewportRef} className="h-full w-full min-w-0 overflow-hidden">
                      <div className="flex h-full w-full">
                        {listing.images.map((image, index) => (
                          <div key={image + index} className="relative h-full min-w-0 shrink-0 grow-0 basis-full">
                            <div className="relative h-full w-full">
                              <div className="flex h-full w-full items-center justify-center">
                                <img
                                  src={image}
                                  alt={`${listing.title || 'Property Image'} - Image ${index + 1}`}
                                  className="block h-full w-full select-none object-contain object-center"
                                  loading={index === zoomImageIndex ? 'eager' : 'lazy'}
                                  draggable={false}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {imageCount > 1 && (
                      <>
                        <button
                          onClick={prevZoomImage}
                          disabled={!canScrollZoomPrev}
                          className="absolute left-3 top-1/2 z-[65] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={28} />
                        </button>
                        <button
                          onClick={nextZoomImage}
                          disabled={!canScrollZoomNext}
                          className="absolute right-3 top-1/2 z-[65] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Next image"
                        >
                          <ChevronRight size={28} />
                        </button>
                      </>
                    )}

                    {imageCount > 1 && (
                      <div className="absolute bottom-4 left-1/2 z-[65] -translate-x-1/2 rounded-full bg-black/70 px-5 py-2 text-base text-white backdrop-blur-sm">
                        {zoomImageIndex + 1} / {imageCount}
                      </div>
                    )}
                  </div>

                  {imageCount > 1 && (
                    <div className="h-28 min-w-0 rounded-xl bg-white/5 px-2 py-2 backdrop-blur-sm md:h-32 md:px-3">
                      <div className="h-full w-full min-w-0 overflow-x-auto overflow-y-hidden">
                        <div className="inline-flex h-full flex-nowrap items-center gap-2 md:gap-3">
                          {listing.images.map((image, index) => (
                            <button
                              key={image + index}
                              onClick={() => goToZoomImage(index)}
                              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all md:h-24 md:w-24 ${
                                zoomImageIndex === index
                                  ? 'scale-105 border-white shadow-lg'
                                  : 'border-white/30 hover:border-white/60'
                              }`}
                            >
                              <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="96px"
                                loading="lazy"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

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
