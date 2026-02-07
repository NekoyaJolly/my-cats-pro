-- カテゴリ管理テーブルを作成
CREATE TABLE "print_doc_categories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "default_fields" JSONB,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "print_doc_categories_pkey" PRIMARY KEY ("id")
);

-- インデックス追加
CREATE INDEX "print_doc_categories_tenant_id_idx" ON "print_doc_categories"("tenant_id");
CREATE INDEX "print_doc_categories_is_active_idx" ON "print_doc_categories"("is_active");
CREATE UNIQUE INDEX "print_doc_categories_tenant_id_slug_key" ON "print_doc_categories"("tenant_id", "slug");

-- category カラムを enum から text に安全に変換
-- 1. 既存データを保持しつつ text カラムとして再作成
ALTER TABLE "print_templates" ADD COLUMN "category_new" TEXT NOT NULL DEFAULT 'CUSTOM';
UPDATE "print_templates" SET "category_new" = "category"::text;
ALTER TABLE "print_templates" DROP COLUMN "category";
ALTER TABLE "print_templates" RENAME COLUMN "category_new" TO "category";

-- category_id カラムを追加（PrintDocCategory への FK）
ALTER TABLE "print_templates" ADD COLUMN "category_id" TEXT;
CREATE INDEX "print_templates_category_id_idx" ON "print_templates"("category_id");

-- FK 制約
ALTER TABLE "print_templates" ADD CONSTRAINT "print_templates_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "print_doc_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- enum 型を削除（もう使わない）
DROP TYPE IF EXISTS "PrintTemplateCategory";

-- 既存インデックスの再作成（category カラムの型変更に合わせて）
DROP INDEX IF EXISTS "print_templates_category_idx";
CREATE INDEX "print_templates_category_idx" ON "print_templates"("category");
DROP INDEX IF EXISTS "print_templates_tenant_id_category_is_active_idx";
CREATE INDEX "print_templates_tenant_id_category_is_active_idx" ON "print_templates"("tenant_id", "category", "is_active");

-- デフォルトカテゴリのシードデータ挿入
INSERT INTO "print_doc_categories" ("id", "tenant_id", "name", "slug", "description", "default_fields", "display_order", "is_active", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), NULL, '血統書', 'PEDIGREE', '血統書の印刷テンプレート', '[{"key":"catName","label":"猫名","dataSourceType":"cat","dataSourceField":"name"},{"key":"pedigreeId","label":"血統書番号","dataSourceType":"pedigree","dataSourceField":"pedigreeId"},{"key":"breed","label":"品種","dataSourceType":"cat","dataSourceField":"breed"},{"key":"birthDate","label":"生年月日","dataSourceType":"cat","dataSourceField":"birthDate"},{"key":"gender","label":"性別","dataSourceType":"cat","dataSourceField":"gender"},{"key":"eyeColor","label":"目の色","dataSourceType":"pedigree","dataSourceField":"eyeColor"},{"key":"coatColor","label":"毛色","dataSourceType":"cat","dataSourceField":"coatColor"},{"key":"breederName","label":"繁殖者","dataSourceType":"pedigree","dataSourceField":"breederName"},{"key":"ownerName","label":"所有者","dataSourceType":"pedigree","dataSourceField":"ownerName"}]', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), NULL, '子猫譲渡証明書', 'KITTEN_TRANSFER', '子猫の譲渡時に発行する証明書', '[{"key":"kittenName","label":"子猫名","dataSourceType":"cat","dataSourceField":"name"},{"key":"breed","label":"品種","dataSourceType":"cat","dataSourceField":"breed"},{"key":"birthDate","label":"生年月日","dataSourceType":"cat","dataSourceField":"birthDate"},{"key":"gender","label":"性別","dataSourceType":"cat","dataSourceField":"gender"},{"key":"microchipNo","label":"マイクロチップ番号","dataSourceType":"cat","dataSourceField":"microchipNumber"},{"key":"breederName","label":"繁殖者名","dataSourceType":"tenant","dataSourceField":"name"},{"key":"transferDate","label":"譲渡日","dataSourceType":"static","dataSourceField":"value"},{"key":"buyerName","label":"購入者名","dataSourceType":"static","dataSourceField":"value"}]', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), NULL, '健康診断書', 'HEALTH_CERTIFICATE', '健康診断結果の証明書', '[{"key":"catName","label":"猫名","dataSourceType":"cat","dataSourceField":"name"},{"key":"breed","label":"品種","dataSourceType":"cat","dataSourceField":"breed"},{"key":"birthDate","label":"生年月日","dataSourceType":"cat","dataSourceField":"birthDate"},{"key":"ownerName","label":"飼い主","dataSourceType":"static","dataSourceField":"value"},{"key":"checkDate","label":"検査日","dataSourceType":"medical","dataSourceField":"visitDate"},{"key":"hospitalName","label":"病院名","dataSourceType":"medical","dataSourceField":"hospitalName"},{"key":"diagnosis","label":"診断内容","dataSourceType":"medical","dataSourceField":"diagnosis"}]', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), NULL, 'ワクチン接種記録', 'VACCINATION_RECORD', 'ワクチン接種の記録', '[{"key":"catName","label":"猫名","dataSourceType":"cat","dataSourceField":"name"},{"key":"breed","label":"品種","dataSourceType":"cat","dataSourceField":"breed"},{"key":"birthDate","label":"生年月日","dataSourceType":"cat","dataSourceField":"birthDate"},{"key":"vaccineName","label":"ワクチン名","dataSourceType":"static","dataSourceField":"value"},{"key":"vaccinationDate","label":"接種日","dataSourceType":"medical","dataSourceField":"visitDate"},{"key":"nextDueDate","label":"次回接種予定日","dataSourceType":"static","dataSourceField":"value"},{"key":"veterinarian","label":"獣医師","dataSourceType":"static","dataSourceField":"value"}]', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), NULL, '繁殖記録', 'BREEDING_RECORD', '交配・出産の記録書類', '[{"key":"maleName","label":"父猫名","dataSourceType":"breeding","dataSourceField":"maleName"},{"key":"femaleName","label":"母猫名","dataSourceType":"breeding","dataSourceField":"femaleName"},{"key":"matingDate","label":"交配日","dataSourceType":"breeding","dataSourceField":"breedingDate"},{"key":"expectedDueDate","label":"出産予定日","dataSourceType":"breeding","dataSourceField":"expectedDueDate"},{"key":"actualBirthDate","label":"実際の出産日","dataSourceType":"breeding","dataSourceField":"actualDueDate"},{"key":"numberOfKittens","label":"子猫数","dataSourceType":"breeding","dataSourceField":"numberOfKittens"}]', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), NULL, '契約書', 'CONTRACT', '各種契約書', '[{"key":"title","label":"タイトル","dataSourceType":"static","dataSourceField":"value"},{"key":"date","label":"日付","dataSourceType":"static","dataSourceField":"value"},{"key":"partyA","label":"甲","dataSourceType":"tenant","dataSourceField":"name"},{"key":"partyB","label":"乙","dataSourceType":"static","dataSourceField":"value"},{"key":"content","label":"内容","dataSourceType":"static","dataSourceField":"value"},{"key":"signature1","label":"署名1","dataSourceType":"static","dataSourceField":"value"},{"key":"signature2","label":"署名2","dataSourceType":"static","dataSourceField":"value"}]', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), NULL, '請求書/領収書', 'INVOICE', '請求書や領収書', '[{"key":"invoiceNo","label":"請求書番号","dataSourceType":"static","dataSourceField":"value"},{"key":"date","label":"日付","dataSourceType":"static","dataSourceField":"value"},{"key":"customerName","label":"顧客名","dataSourceType":"static","dataSourceField":"value"},{"key":"items","label":"明細","dataSourceType":"static","dataSourceField":"value"},{"key":"subtotal","label":"小計","dataSourceType":"static","dataSourceField":"value"},{"key":"tax","label":"消費税","dataSourceType":"static","dataSourceField":"value"},{"key":"total","label":"合計","dataSourceType":"static","dataSourceField":"value"}]', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), NULL, 'カスタム書類', 'CUSTOM', '自由にフィールドを設定できるカスタム書類', '[{"key":"field1","label":"フィールド1","dataSourceType":"static","dataSourceField":"value"},{"key":"field2","label":"フィールド2","dataSourceType":"static","dataSourceField":"value"},{"key":"field3","label":"フィールド3","dataSourceType":"static","dataSourceField":"value"}]', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
