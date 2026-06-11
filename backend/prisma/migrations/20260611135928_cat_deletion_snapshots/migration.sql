-- DropForeignKey
ALTER TABLE "birth_plans" DROP CONSTRAINT "birth_plans_mother_id_fkey";

-- DropForeignKey
ALTER TABLE "breeding_records" DROP CONSTRAINT "breeding_records_female_id_fkey";

-- DropForeignKey
ALTER TABLE "breeding_records" DROP CONSTRAINT "breeding_records_male_id_fkey";

-- DropForeignKey
ALTER TABLE "breeding_schedules" DROP CONSTRAINT "breeding_schedules_female_id_fkey";

-- DropForeignKey
ALTER TABLE "breeding_schedules" DROP CONSTRAINT "breeding_schedules_male_id_fkey";

-- DropForeignKey
ALTER TABLE "medical_records" DROP CONSTRAINT "medical_records_cat_id_fkey";

-- DropForeignKey
ALTER TABLE "pregnancy_checks" DROP CONSTRAINT "pregnancy_checks_mother_id_fkey";

-- AlterTable
ALTER TABLE "birth_plans" ADD COLUMN     "father_name" TEXT,
ADD COLUMN     "mother_name" TEXT,
ALTER COLUMN "mother_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "breeding_records" ADD COLUMN     "female_name" TEXT,
ADD COLUMN     "male_name" TEXT,
ALTER COLUMN "male_id" DROP NOT NULL,
ALTER COLUMN "female_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "breeding_schedules" ADD COLUMN     "female_name" TEXT,
ADD COLUMN     "male_name" TEXT,
ALTER COLUMN "male_id" DROP NOT NULL,
ALTER COLUMN "female_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "cats" ADD COLUMN     "father_name" TEXT,
ADD COLUMN     "mother_name" TEXT;

-- AlterTable
ALTER TABLE "medical_records" ADD COLUMN     "cat_name" TEXT,
ALTER COLUMN "cat_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pregnancy_checks" ADD COLUMN     "father_name" TEXT,
ADD COLUMN     "mother_name" TEXT,
ALTER COLUMN "mother_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_female_id_fkey" FOREIGN KEY ("female_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_male_id_fkey" FOREIGN KEY ("male_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_schedules" ADD CONSTRAINT "breeding_schedules_male_id_fkey" FOREIGN KEY ("male_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_schedules" ADD CONSTRAINT "breeding_schedules_female_id_fkey" FOREIGN KEY ("female_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancy_checks" ADD CONSTRAINT "pregnancy_checks_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "birth_plans" ADD CONSTRAINT "birth_plans_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
