-- DropIndex
DROP INDEX "birth_plans_actual_birth_date_status_idx";

-- DropIndex
DROP INDEX "breeding_records_status_breeding_date_idx";

-- DropIndex
DROP INDEX "care_records_recorded_by_care_date_idx";

-- DropIndex
DROP INDEX "cats_breed_id_birth_date_idx";

-- DropIndex
DROP INDEX "cats_gender_birth_date_idx";

-- DropIndex
DROP INDEX "pedigrees_birth_date_idx";

-- DropIndex
DROP INDEX "pedigrees_pedigree_id_birth_date_idx";

-- CreateIndex
CREATE INDEX "birth_plans_expected_birth_date_status_idx" ON "birth_plans"("expected_birth_date", "status");

-- CreateIndex
CREATE INDEX "breeding_records_male_id_female_id_idx" ON "breeding_records"("male_id", "female_id");

-- CreateIndex
CREATE INDEX "breeding_records_breeding_date_status_idx" ON "breeding_records"("breeding_date", "status");

-- CreateIndex
CREATE INDEX "care_records_cat_id_care_type_idx" ON "care_records"("cat_id", "care_type");

-- CreateIndex
CREATE INDEX "cats_breed_id_name_idx" ON "cats"("breed_id", "name");

-- CreateIndex
CREATE INDEX "cats_birth_date_gender_idx" ON "cats"("birth_date", "gender");

-- CreateIndex
CREATE INDEX "pedigrees_breed_code_cat_name_idx" ON "pedigrees"("breed_code", "cat_name");

-- CreateIndex
CREATE INDEX "schedules_cat_id_schedule_date_idx" ON "schedules"("cat_id", "schedule_date");

-- CreateIndex
CREATE INDEX "shift_templates_name_idx" ON "shift_templates"("name");

-- CreateIndex
CREATE INDEX "shift_templates_display_order_idx" ON "shift_templates"("display_order");
