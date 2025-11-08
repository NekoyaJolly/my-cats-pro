-- CreateEnum
CREATE TYPE "public"."DispositionType" AS ENUM ('TRAINING', 'SALE', 'DECEASED');

-- AlterTable
ALTER TABLE "public"."birth_plans" ADD COLUMN     "completed_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."kitten_dispositions" (
    "id" TEXT NOT NULL,
    "birth_record_id" TEXT NOT NULL,
    "kitten_id" TEXT,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "disposition" "public"."DispositionType" NOT NULL,
    "training_start_date" TIMESTAMP(3),
    "sale_info" JSONB,
    "death_date" TIMESTAMP(3),
    "death_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kitten_dispositions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kitten_dispositions_birth_record_id_idx" ON "public"."kitten_dispositions"("birth_record_id");

-- CreateIndex
CREATE INDEX "kitten_dispositions_kitten_id_idx" ON "public"."kitten_dispositions"("kitten_id");

-- AddForeignKey
ALTER TABLE "public"."kitten_dispositions" ADD CONSTRAINT "kitten_dispositions_birth_record_id_fkey" FOREIGN KEY ("birth_record_id") REFERENCES "public"."birth_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kitten_dispositions" ADD CONSTRAINT "kitten_dispositions_kitten_id_fkey" FOREIGN KEY ("kitten_id") REFERENCES "public"."cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
