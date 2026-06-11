-- AlterTable
ALTER TABLE "invitation_tokens" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];
