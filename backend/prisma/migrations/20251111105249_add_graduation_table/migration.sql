-- AlterTable
ALTER TABLE "public"."cats" ADD COLUMN     "is_graduated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."graduations" (
    "id" TEXT NOT NULL,
    "cat_id" TEXT NOT NULL,
    "transfer_date" TIMESTAMP(3) NOT NULL,
    "destination" TEXT NOT NULL,
    "notes" TEXT,
    "cat_snapshot" JSONB NOT NULL,
    "transferred_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "graduations_cat_id_key" ON "public"."graduations"("cat_id");

-- CreateIndex
CREATE INDEX "graduations_transfer_date_idx" ON "public"."graduations"("transfer_date");

-- CreateIndex
CREATE INDEX "graduations_cat_id_idx" ON "public"."graduations"("cat_id");

-- AddForeignKey
ALTER TABLE "public"."graduations" ADD CONSTRAINT "graduations_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "public"."cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
