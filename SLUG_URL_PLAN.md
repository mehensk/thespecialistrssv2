**Listing Slug URL Plan**

This plan is intentionally deferred until after all landing page edits are complete.

**Phase 0: Timing Gate**
We will not start this work until the landing page edits are done and confirmed.

**Phase 1: Schema + Data Design**
I will add a new `slug` field to the `Listing` model in `prisma/schema.prisma` and make it unique.
I will decide and document how slugs are generated and how uniqueness is enforced.
I will also confirm whether slugs should change when titles change or remain stable.

**Phase 2: Backfill Existing Listings**
I will write a one-time script to generate slugs for existing listings based on their titles.
If duplicates exist, I will append a short suffix to keep them unique.

**Phase 3: API and Validation**
I will update the listing creation and update APIs to generate and store the slug.
I will add validation to ensure the slug format is clean and safe for URLs.

**Phase 4: Routing and Links**
I will change the public listing route from `/listings/[id]` to `/listings/[slug]`.
I will update all links and caches to use `slug` instead of `id`.

**Phase 5: Compatibility (Optional)**
If you want old URLs to keep working, I will add a redirect or fallback lookup from `id` to `slug`.
If you prefer a hard cutover, I will skip this.

**Phase 6: Verification**
I will confirm that new listings get correct slugs, existing listings resolve, and links/caches are correct.
I will run a quick manual check of the listing list and detail pages.
