-- CreateTable
CREATE TABLE "pedigree_print_settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "global_key" TEXT,
    "settings" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedigree_print_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pedigree_print_settings_global_key_key" ON "pedigree_print_settings"("global_key");

-- CreateIndex
CREATE UNIQUE INDEX "pedigree_print_settings_tenant_id_key" ON "pedigree_print_settings"("tenant_id");

-- AddForeignKey
ALTER TABLE "pedigree_print_settings" ADD CONSTRAINT "pedigree_print_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
