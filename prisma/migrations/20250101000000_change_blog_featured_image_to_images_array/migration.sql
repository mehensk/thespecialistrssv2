-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing featuredImage data to images array
UPDATE "BlogPost" 
SET "images" = CASE 
  WHEN "featuredImage" IS NOT NULL AND "featuredImage" != '' 
  THEN ARRAY["featuredImage"] 
  ELSE ARRAY[]::TEXT[] 
END;

-- DropTable
ALTER TABLE "BlogPost" DROP COLUMN "featuredImage";

