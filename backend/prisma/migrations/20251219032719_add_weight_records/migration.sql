-- CreateTable
CREATE TABLE "weight_records" (
    "id" TEXT NOT NULL,
    "cat_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "recorded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weight_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weight_records_cat_id_idx" ON "weight_records"("cat_id");

-- CreateIndex
CREATE INDEX "weight_records_recorded_at_idx" ON "weight_records"("recorded_at");

-- CreateIndex
CREATE INDEX "weight_records_cat_id_recorded_at_idx" ON "weight_records"("cat_id", "recorded_at");

-- AddForeignKey
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
