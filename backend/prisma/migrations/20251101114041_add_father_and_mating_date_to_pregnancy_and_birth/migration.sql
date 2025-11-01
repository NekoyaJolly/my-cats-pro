-- AlterTable
ALTER TABLE "public"."birth_plans" ADD COLUMN     "father_id" TEXT,
ADD COLUMN     "mating_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."pregnancy_checks" ADD COLUMN     "father_id" TEXT,
ADD COLUMN     "mating_date" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "birth_plans_father_id_idx" ON "public"."birth_plans"("father_id");

-- CreateIndex
CREATE INDEX "pregnancy_checks_father_id_idx" ON "public"."pregnancy_checks"("father_id");
