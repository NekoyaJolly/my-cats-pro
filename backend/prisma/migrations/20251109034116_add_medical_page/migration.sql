/*
  Warnings:

  - The values [ACTIVE,RESOLVED,CANCELLED] on the enum `MedicalRecordStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `follow_up_action` on the `medical_records` table. All the data in the column will be lost.
  - You are about to drop the column `symptom_summary` on the `medical_records` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MedicalRecordStatus_new" AS ENUM ('TREATING', 'COMPLETED');
ALTER TABLE "public"."medical_records" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."medical_records" ALTER COLUMN "status" TYPE "public"."MedicalRecordStatus_new" USING ("status"::text::"public"."MedicalRecordStatus_new");
ALTER TYPE "public"."MedicalRecordStatus" RENAME TO "MedicalRecordStatus_old";
ALTER TYPE "public"."MedicalRecordStatus_new" RENAME TO "MedicalRecordStatus";
DROP TYPE "public"."MedicalRecordStatus_old";
ALTER TABLE "public"."medical_records" ALTER COLUMN "status" SET DEFAULT 'TREATING';
COMMIT;

-- AlterTable
ALTER TABLE "public"."medical_records" DROP COLUMN "follow_up_action",
DROP COLUMN "symptom_summary",
ADD COLUMN     "disease_name" TEXT,
ADD COLUMN     "symptom" TEXT,
ALTER COLUMN "status" SET DEFAULT 'TREATING';
