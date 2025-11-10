/*
  Warnings:

  - The primary key for the `medical_record_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `care_tag_id` on the `medical_record_tags` table. All the data in the column will be lost.
  - You are about to drop the column `clinic_name` on the `medical_records` table. All the data in the column will be lost.
  - You are about to drop the column `veterinarian_name` on the `medical_records` table. All the data in the column will be lost.
  - You are about to drop the column `visit_type` on the `medical_records` table. All the data in the column will be lost.
  - Added the required column `tag_id` to the `medical_record_tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."medical_record_tags" DROP CONSTRAINT "medical_record_tags_care_tag_id_fkey";

-- AlterTable
ALTER TABLE "public"."medical_record_tags" DROP CONSTRAINT "medical_record_tags_pkey",
DROP COLUMN "care_tag_id",
ADD COLUMN     "tag_id" TEXT NOT NULL,
ADD CONSTRAINT "medical_record_tags_pkey" PRIMARY KEY ("medical_record_id", "tag_id");

-- AlterTable
ALTER TABLE "public"."medical_records" DROP COLUMN "clinic_name",
DROP COLUMN "veterinarian_name",
DROP COLUMN "visit_type",
ADD COLUMN     "hospital_name" TEXT,
ADD COLUMN     "visit_type_id" TEXT;

-- DropEnum
DROP TYPE "public"."MedicalVisitType";

-- CreateTable
CREATE TABLE "public"."medical_visit_types" (
    "id" TEXT NOT NULL,
    "key" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_visit_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medical_visit_types_key_key" ON "public"."medical_visit_types"("key");

-- CreateIndex
CREATE INDEX "medical_visit_types_display_order_idx" ON "public"."medical_visit_types"("display_order");

-- CreateIndex
CREATE INDEX "medical_records_visit_type_id_idx" ON "public"."medical_records"("visit_type_id");

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_visit_type_id_fkey" FOREIGN KEY ("visit_type_id") REFERENCES "public"."medical_visit_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_record_tags" ADD CONSTRAINT "medical_record_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
