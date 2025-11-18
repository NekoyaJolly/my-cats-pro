-- DisplayPreference model introduction
-- Adds user-specific display name configuration for master data

-- CreateEnum
CREATE TYPE "DisplayNameMode" AS ENUM ('CANONICAL', 'CODE_AND_NAME', 'CUSTOM');

-- CreateTable
CREATE TABLE "display_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "breed_name_mode" "DisplayNameMode" NOT NULL DEFAULT 'CANONICAL',
    "coat_color_name_mode" "DisplayNameMode" NOT NULL DEFAULT 'CANONICAL',
    "breed_name_overrides" JSONB,
    "coat_color_name_overrides" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "display_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "display_preferences_user_id_key" ON "display_preferences"("user_id");

-- AddForeignKey
ALTER TABLE "display_preferences"
ADD CONSTRAINT "display_preferences_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
