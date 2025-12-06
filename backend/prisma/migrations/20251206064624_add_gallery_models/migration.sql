-- CreateEnum
CREATE TYPE "GalleryCategory" AS ENUM ('KITTEN', 'FATHER', 'MOTHER', 'GRADUATION');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'YOUTUBE');

-- CreateTable
CREATE TABLE "gallery_entries" (
    "id" TEXT NOT NULL,
    "category" "GalleryCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "coat_color" TEXT,
    "breed" TEXT,
    "cat_id" TEXT,
    "transfer_date" TIMESTAMP(3),
    "destination" TEXT,
    "external_link" TEXT,
    "transferred_by" TEXT,
    "cat_snapshot" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_media" (
    "id" TEXT NOT NULL,
    "gallery_entry_id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gallery_entries_category_idx" ON "gallery_entries"("category");

-- CreateIndex
CREATE INDEX "gallery_entries_cat_id_idx" ON "gallery_entries"("cat_id");

-- CreateIndex
CREATE INDEX "gallery_entries_created_at_idx" ON "gallery_entries"("created_at");

-- CreateIndex
CREATE INDEX "gallery_entries_category_created_at_idx" ON "gallery_entries"("category", "created_at");

-- CreateIndex
CREATE INDEX "gallery_media_gallery_entry_id_idx" ON "gallery_media"("gallery_entry_id");

-- CreateIndex
CREATE INDEX "gallery_media_order_idx" ON "gallery_media"("order");

-- AddForeignKey
ALTER TABLE "gallery_entries" ADD CONSTRAINT "gallery_entries_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_media" ADD CONSTRAINT "gallery_media_gallery_entry_id_fkey" FOREIGN KEY ("gallery_entry_id") REFERENCES "gallery_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
