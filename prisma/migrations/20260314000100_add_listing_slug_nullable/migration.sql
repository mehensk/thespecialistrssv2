-- Phase 1 Migration A: add nullable slug column for listings
ALTER TABLE "Listing"
ADD COLUMN "slug" TEXT;

-- Allow nullable slug values during backfill window.
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");

