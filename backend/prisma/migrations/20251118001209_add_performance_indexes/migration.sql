-- CreateIndex
CREATE INDEX "cats_created_at_idx" ON "cats"("created_at");

-- CreateIndex
CREATE INDEX "cats_updated_at_idx" ON "cats"("updated_at");

-- CreateIndex
CREATE INDEX "pedigrees_cat_name2_idx" ON "pedigrees"("cat_name2");

-- CreateIndex
CREATE INDEX "pedigrees_eye_color_idx" ON "pedigrees"("eye_color");

-- CreateIndex
CREATE INDEX "pedigrees_breeder_name_idx" ON "pedigrees"("breeder_name");

-- CreateIndex
CREATE INDEX "pedigrees_owner_name_idx" ON "pedigrees"("owner_name");

-- CreateIndex
CREATE INDEX "pedigrees_birth_date_idx" ON "pedigrees"("birth_date");

-- CreateIndex
CREATE INDEX "pedigrees_registration_date_idx" ON "pedigrees"("registration_date");

-- CreateIndex
CREATE INDEX "pedigrees_created_at_idx" ON "pedigrees"("created_at");

-- CreateIndex
CREATE INDEX "pedigrees_updated_at_idx" ON "pedigrees"("updated_at");

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_pedigree_id_fkey" FOREIGN KEY ("pedigree_id") REFERENCES "pedigrees"("pedigree_id") ON DELETE SET NULL ON UPDATE CASCADE;
