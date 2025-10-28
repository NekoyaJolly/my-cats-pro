-- CreateTable
CREATE TABLE "public"."schedule_cats" (
    "schedule_id" TEXT NOT NULL,
    "cat_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_cats_pkey" PRIMARY KEY ("schedule_id","cat_id")
);

-- AddForeignKey
ALTER TABLE "public"."schedule_cats" ADD CONSTRAINT "schedule_cats_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_cats" ADD CONSTRAINT "schedule_cats_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "public"."cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
