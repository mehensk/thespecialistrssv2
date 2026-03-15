-- Phase 1 Migration B: enforce slug required after backfill completion
ALTER TABLE "Listing"
ALTER COLUMN "slug" SET NOT NULL;

