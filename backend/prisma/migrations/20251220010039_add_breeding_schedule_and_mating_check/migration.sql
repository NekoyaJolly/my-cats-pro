-- CreateEnum
CREATE TYPE "BreedingScheduleStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "breeding_schedules" (
    "id" TEXT NOT NULL,
    "male_id" TEXT NOT NULL,
    "female_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "BreedingScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "recorded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeding_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mating_checks" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "check_date" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mating_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "breeding_schedules_male_id_idx" ON "breeding_schedules"("male_id");

-- CreateIndex
CREATE INDEX "breeding_schedules_female_id_idx" ON "breeding_schedules"("female_id");

-- CreateIndex
CREATE INDEX "breeding_schedules_start_date_idx" ON "breeding_schedules"("start_date");

-- CreateIndex
CREATE INDEX "breeding_schedules_status_idx" ON "breeding_schedules"("status");

-- CreateIndex
CREATE INDEX "breeding_schedules_male_id_start_date_idx" ON "breeding_schedules"("male_id", "start_date");

-- CreateIndex
CREATE INDEX "breeding_schedules_female_id_start_date_idx" ON "breeding_schedules"("female_id", "start_date");

-- CreateIndex
CREATE INDEX "mating_checks_schedule_id_idx" ON "mating_checks"("schedule_id");

-- CreateIndex
CREATE INDEX "mating_checks_check_date_idx" ON "mating_checks"("check_date");

-- AddForeignKey
ALTER TABLE "breeding_schedules" ADD CONSTRAINT "breeding_schedules_male_id_fkey" FOREIGN KEY ("male_id") REFERENCES "cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_schedules" ADD CONSTRAINT "breeding_schedules_female_id_fkey" FOREIGN KEY ("female_id") REFERENCES "cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_schedules" ADD CONSTRAINT "breeding_schedules_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mating_checks" ADD CONSTRAINT "mating_checks_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "breeding_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
