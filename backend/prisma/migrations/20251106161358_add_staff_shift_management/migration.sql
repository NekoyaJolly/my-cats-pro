-- CreateEnum
CREATE TYPE "public"."ShiftMode" AS ENUM ('SIMPLE', 'DETAILED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."ShiftStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ABSENT');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateTable
CREATE TABLE "public"."staff" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'スタッフ',
    "color" TEXT NOT NULL DEFAULT '#4dabf7',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shift_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#4dabf7',
    "break_time" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shifts" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "shift_date" TIMESTAMP(3) NOT NULL,
    "display_name" TEXT,
    "template_id" TEXT,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "break_duration" INTEGER,
    "status" "public"."ShiftStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "actual_start_time" TIMESTAMP(3),
    "actual_end_time" TIMESTAMP(3),
    "metadata" JSONB,
    "mode" "public"."ShiftMode" NOT NULL DEFAULT 'SIMPLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shift_tasks" (
    "id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "task_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'PENDING',
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."staff_availabilities" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shift_settings" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "default_mode" "public"."ShiftMode" NOT NULL DEFAULT 'SIMPLE',
    "enabled_modes" TEXT[] DEFAULT ARRAY['SIMPLE', 'DETAILED']::TEXT[],
    "simple_require_display_name" BOOLEAN NOT NULL DEFAULT false,
    "detailed_require_time" BOOLEAN NOT NULL DEFAULT true,
    "detailed_require_template" BOOLEAN NOT NULL DEFAULT false,
    "detailed_enable_tasks" BOOLEAN NOT NULL DEFAULT true,
    "detailed_enable_actual" BOOLEAN NOT NULL DEFAULT true,
    "custom_fields" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_id_key" ON "public"."staff"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "public"."staff"("email");

-- CreateIndex
CREATE INDEX "staff_user_id_idx" ON "public"."staff"("user_id");

-- CreateIndex
CREATE INDEX "shifts_staff_id_idx" ON "public"."shifts"("staff_id");

-- CreateIndex
CREATE INDEX "shifts_template_id_idx" ON "public"."shifts"("template_id");

-- CreateIndex
CREATE INDEX "shifts_shift_date_idx" ON "public"."shifts"("shift_date");

-- CreateIndex
CREATE INDEX "shifts_status_idx" ON "public"."shifts"("status");

-- CreateIndex
CREATE INDEX "shifts_mode_idx" ON "public"."shifts"("mode");

-- CreateIndex
CREATE INDEX "shift_tasks_shift_id_idx" ON "public"."shift_tasks"("shift_id");

-- CreateIndex
CREATE INDEX "shift_tasks_status_idx" ON "public"."shift_tasks"("status");

-- CreateIndex
CREATE INDEX "staff_availabilities_staff_id_idx" ON "public"."staff_availabilities"("staff_id");

-- AddForeignKey
ALTER TABLE "public"."staff" ADD CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shifts" ADD CONSTRAINT "shifts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shifts" ADD CONSTRAINT "shifts_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."shift_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shift_tasks" ADD CONSTRAINT "shift_tasks_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."staff_availabilities" ADD CONSTRAINT "staff_availabilities_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
