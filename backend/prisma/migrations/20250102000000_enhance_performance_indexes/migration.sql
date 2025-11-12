-- H2: Database Index Optimization
-- 主要テーブルへのパフォーマンスインデックス追加

-- ==========================================
-- User テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "public"."users"("email");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "public"."users"("role");
CREATE INDEX IF NOT EXISTS "users_is_active_idx" ON "public"."users"("is_active");
CREATE INDEX IF NOT EXISTS "users_last_login_at_idx" ON "public"."users"("last_login_at");
CREATE INDEX IF NOT EXISTS "users_role_is_active_idx" ON "public"."users"("role", "is_active");
CREATE INDEX IF NOT EXISTS "users_is_active_last_login_at_idx" ON "public"."users"("is_active", "last_login_at");

-- ==========================================
-- LoginAttempt テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "login_attempts_user_id_idx" ON "public"."login_attempts"("user_id");
CREATE INDEX IF NOT EXISTS "login_attempts_email_idx" ON "public"."login_attempts"("email");
CREATE INDEX IF NOT EXISTS "login_attempts_success_idx" ON "public"."login_attempts"("success");
CREATE INDEX IF NOT EXISTS "login_attempts_created_at_idx" ON "public"."login_attempts"("created_at");
CREATE INDEX IF NOT EXISTS "login_attempts_email_created_at_idx" ON "public"."login_attempts"("email", "created_at");
CREATE INDEX IF NOT EXISTS "login_attempts_user_id_created_at_idx" ON "public"."login_attempts"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "login_attempts_success_created_at_idx" ON "public"."login_attempts"("success", "created_at");

-- ==========================================
-- Breed テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "breeds_code_idx" ON "public"."breeds"("code");
CREATE INDEX IF NOT EXISTS "breeds_name_idx" ON "public"."breeds"("name");
CREATE INDEX IF NOT EXISTS "breeds_is_active_idx" ON "public"."breeds"("is_active");

-- ==========================================
-- CoatColor テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "coat_colors_code_idx" ON "public"."coat_colors"("code");
CREATE INDEX IF NOT EXISTS "coat_colors_name_idx" ON "public"."coat_colors"("name");
CREATE INDEX IF NOT EXISTS "coat_colors_is_active_idx" ON "public"."coat_colors"("is_active");

-- ==========================================
-- Gender テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "genders_code_idx" ON "public"."genders"("code");
CREATE INDEX IF NOT EXISTS "genders_name_idx" ON "public"."genders"("name");

-- ==========================================
-- Cat テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "cats_name_idx" ON "public"."cats"("name");
CREATE INDEX IF NOT EXISTS "cats_gender_idx" ON "public"."cats"("gender");
CREATE INDEX IF NOT EXISTS "cats_is_in_house_idx" ON "public"."cats"("is_in_house");
CREATE INDEX IF NOT EXISTS "cats_is_graduated_idx" ON "public"."cats"("is_graduated");
CREATE INDEX IF NOT EXISTS "cats_registration_number_idx" ON "public"."cats"("registration_number");
CREATE INDEX IF NOT EXISTS "cats_coat_color_id_idx" ON "public"."cats"("coat_color_id");
CREATE INDEX IF NOT EXISTS "cats_birth_place_idx" ON "public"."cats"("birth_place");
CREATE INDEX IF NOT EXISTS "cats_chip_number_idx" ON "public"."cats"("chip_number");
CREATE INDEX IF NOT EXISTS "cats_breed_id_birth_date_idx" ON "public"."cats"("breed_id", "birth_date");
CREATE INDEX IF NOT EXISTS "cats_gender_birth_date_idx" ON "public"."cats"("gender", "birth_date");
CREATE INDEX IF NOT EXISTS "cats_is_in_house_is_graduated_idx" ON "public"."cats"("is_in_house", "is_graduated");

-- ==========================================
-- Pedigree テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "pedigrees_pedigree_id_idx" ON "public"."pedigrees"("pedigree_id");
CREATE INDEX IF NOT EXISTS "pedigrees_breed_id_idx" ON "public"."pedigrees"("breed_id");
CREATE INDEX IF NOT EXISTS "pedigrees_coat_color_id_idx" ON "public"."pedigrees"("coat_color_id");
CREATE INDEX IF NOT EXISTS "pedigrees_gender_id_idx" ON "public"."pedigrees"("gender_id");
CREATE INDEX IF NOT EXISTS "pedigrees_birth_date_idx" ON "public"."pedigrees"("birth_date");
CREATE INDEX IF NOT EXISTS "pedigrees_pedigree_id_birth_date_idx" ON "public"."pedigrees"("pedigree_id", "birth_date");

-- ==========================================
-- BreedingRecord テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "breeding_records_recorded_by_idx" ON "public"."breeding_records"("recorded_by");
CREATE INDEX IF NOT EXISTS "breeding_records_pregnancy_status_idx" ON "public"."breeding_records"("pregnancy_status");
CREATE INDEX IF NOT EXISTS "breeding_records_male_id_breeding_date_idx" ON "public"."breeding_records"("male_id", "breeding_date");
CREATE INDEX IF NOT EXISTS "breeding_records_female_id_breeding_date_idx" ON "public"."breeding_records"("female_id", "breeding_date");
CREATE INDEX IF NOT EXISTS "breeding_records_status_breeding_date_idx" ON "public"."breeding_records"("status", "breeding_date");
CREATE INDEX IF NOT EXISTS "breeding_records_pregnancy_status_breeding_date_idx" ON "public"."breeding_records"("pregnancy_status", "breeding_date");

-- ==========================================
-- CareRecord テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "care_records_recorded_by_idx" ON "public"."care_records"("recorded_by");
CREATE INDEX IF NOT EXISTS "care_records_next_due_date_idx" ON "public"."care_records"("next_due_date");
CREATE INDEX IF NOT EXISTS "care_records_cat_id_care_date_idx" ON "public"."care_records"("cat_id", "care_date");
CREATE INDEX IF NOT EXISTS "care_records_care_type_care_date_idx" ON "public"."care_records"("care_type", "care_date");
CREATE INDEX IF NOT EXISTS "care_records_recorded_by_care_date_idx" ON "public"."care_records"("recorded_by", "care_date");
CREATE INDEX IF NOT EXISTS "care_records_next_due_date_care_type_idx" ON "public"."care_records"("next_due_date", "care_type");

-- ==========================================
-- Schedule テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "schedules_schedule_type_idx" ON "public"."schedules"("schedule_type");
CREATE INDEX IF NOT EXISTS "schedules_priority_idx" ON "public"."schedules"("priority");
CREATE INDEX IF NOT EXISTS "schedules_is_recurring_idx" ON "public"."schedules"("is_recurring");
CREATE INDEX IF NOT EXISTS "schedules_recurrence_pattern_idx" ON "public"."schedules"("recurrence_pattern");
CREATE INDEX IF NOT EXISTS "schedules_is_completed_idx" ON "public"."schedules"("is_completed");
CREATE INDEX IF NOT EXISTS "schedules_completed_at_idx" ON "public"."schedules"("completed_at");
CREATE INDEX IF NOT EXISTS "schedules_schedule_date_status_idx" ON "public"."schedules"("schedule_date", "status");
CREATE INDEX IF NOT EXISTS "schedules_assigned_to_schedule_date_idx" ON "public"."schedules"("assigned_to", "schedule_date");
CREATE INDEX IF NOT EXISTS "schedules_status_priority_idx" ON "public"."schedules"("status", "priority");
CREATE INDEX IF NOT EXISTS "schedules_schedule_type_schedule_date_idx" ON "public"."schedules"("schedule_type", "schedule_date");
CREATE INDEX IF NOT EXISTS "schedules_is_completed_schedule_date_idx" ON "public"."schedules"("is_completed", "schedule_date");

-- ==========================================
-- PregnancyCheck テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "pregnancy_checks_status_idx" ON "public"."pregnancy_checks"("status");
CREATE INDEX IF NOT EXISTS "pregnancy_checks_recorded_by_idx" ON "public"."pregnancy_checks"("recorded_by");
CREATE INDEX IF NOT EXISTS "pregnancy_checks_breeding_record_id_check_date_idx" ON "public"."pregnancy_checks"("breeding_record_id", "check_date");
CREATE INDEX IF NOT EXISTS "pregnancy_checks_status_check_date_idx" ON "public"."pregnancy_checks"("status", "check_date");

-- ==========================================
-- BirthPlan テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "birth_plans_status_idx" ON "public"."birth_plans"("status");
CREATE INDEX IF NOT EXISTS "birth_plans_recorded_by_idx" ON "public"."birth_plans"("recorded_by");
CREATE INDEX IF NOT EXISTS "birth_plans_actual_birth_date_idx" ON "public"."birth_plans"("actual_birth_date");
CREATE INDEX IF NOT EXISTS "birth_plans_breeding_record_id_expected_birth_date_idx" ON "public"."birth_plans"("breeding_record_id", "expected_birth_date");
CREATE INDEX IF NOT EXISTS "birth_plans_status_expected_birth_date_idx" ON "public"."birth_plans"("status", "expected_birth_date");
CREATE INDEX IF NOT EXISTS "birth_plans_actual_birth_date_status_idx" ON "public"."birth_plans"("actual_birth_date", "status");

-- ==========================================
-- MedicalRecord テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "medical_records_status_idx" ON "public"."medical_records"("status");
CREATE INDEX IF NOT EXISTS "medical_records_recorded_by_idx" ON "public"."medical_records"("recorded_by");
CREATE INDEX IF NOT EXISTS "medical_records_cat_id_visit_date_idx" ON "public"."medical_records"("cat_id", "visit_date");
CREATE INDEX IF NOT EXISTS "medical_records_visit_type_id_visit_date_idx" ON "public"."medical_records"("visit_type_id", "visit_date");
CREATE INDEX IF NOT EXISTS "medical_records_status_visit_date_idx" ON "public"."medical_records"("status", "visit_date");

-- ==========================================
-- Shift テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "shifts_staff_id_shift_date_idx" ON "public"."shifts"("staff_id", "shift_date");
CREATE INDEX IF NOT EXISTS "shifts_shift_date_status_idx" ON "public"."shifts"("shift_date", "status");
CREATE INDEX IF NOT EXISTS "shifts_status_shift_date_idx" ON "public"."shifts"("status", "shift_date");

-- ==========================================
-- Staff テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "staff_name_idx" ON "public"."staff"("name");
CREATE INDEX IF NOT EXISTS "staff_email_idx" ON "public"."staff"("email");
CREATE INDEX IF NOT EXISTS "staff_is_active_idx" ON "public"."staff"("is_active");
CREATE INDEX IF NOT EXISTS "staff_is_active_role_idx" ON "public"."staff"("is_active", "role");

-- ==========================================
-- StaffAvailability テーブル
-- ==========================================
CREATE INDEX IF NOT EXISTS "staff_availabilities_day_of_week_idx" ON "public"."staff_availabilities"("day_of_week");
CREATE INDEX IF NOT EXISTS "staff_availabilities_is_available_idx" ON "public"."staff_availabilities"("is_available");
CREATE INDEX IF NOT EXISTS "staff_availabilities_staff_id_day_of_week_idx" ON "public"."staff_availabilities"("staff_id", "day_of_week");
CREATE INDEX IF NOT EXISTS "staff_availabilities_day_of_week_is_available_idx" ON "public"."staff_availabilities"("day_of_week", "is_available");
