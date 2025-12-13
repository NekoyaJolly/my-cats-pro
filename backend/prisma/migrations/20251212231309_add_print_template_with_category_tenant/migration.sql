-- CreateEnum
CREATE TYPE "PrintTemplateCategory" AS ENUM ('PEDIGREE', 'KITTEN_TRANSFER', 'HEALTH_CERTIFICATE', 'VACCINATION_RECORD', 'BREEDING_RECORD', 'CONTRACT', 'INVOICE', 'CUSTOM');

-- CreateTable
CREATE TABLE "print_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "PrintTemplateCategory" NOT NULL DEFAULT 'PEDIGREE',
    "paper_width" INTEGER NOT NULL,
    "paper_height" INTEGER NOT NULL,
    "background_url" TEXT,
    "background_opacity" INTEGER NOT NULL DEFAULT 100,
    "positions" JSONB NOT NULL,
    "font_sizes" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "print_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "print_templates_tenant_id_idx" ON "print_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "print_templates_category_idx" ON "print_templates"("category");

-- CreateIndex
CREATE INDEX "print_templates_is_active_idx" ON "print_templates"("is_active");

-- CreateIndex
CREATE INDEX "print_templates_name_idx" ON "print_templates"("name");

-- CreateIndex
CREATE INDEX "print_templates_tenant_id_category_is_active_idx" ON "print_templates"("tenant_id", "category", "is_active");
