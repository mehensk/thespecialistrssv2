-- Phase 4: query-aligned listing indexes for server-side filter/sort/pagination
CREATE INDEX "Listing_isPublished_createdAt_idx" ON "Listing"("isPublished", "createdAt" DESC);
CREATE INDEX "Listing_isPublished_listingType_createdAt_idx" ON "Listing"("isPublished", "listingType", "createdAt" DESC);
CREATE INDEX "Listing_isPublished_propertyType_createdAt_idx" ON "Listing"("isPublished", "propertyType", "createdAt" DESC);
CREATE INDEX "Listing_isPublished_price_idx" ON "Listing"("isPublished", "price");
CREATE INDEX "Listing_isPublished_size_idx" ON "Listing"("isPublished", "size");
