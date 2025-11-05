#!/bin/bash
# 在舎猫データをシードデータとしてエクスポートするスクリプト

# 環境変数の設定
export DATABASE_URL="postgresql://mycats:mycats_dev_password@localhost:5433/mycats_development"

# 出力ファイル
OUTPUT_FILE="../backend/prisma/seed-cats-data.sql"

echo "-- 在舎猫データのシードデータ (自動生成: $(date))" > $OUTPUT_FILE
echo "-- このファイルは現在の在舎猫データから生成されました" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# PostgreSQLからデータをエクスポート
psql $DATABASE_URL << 'EOSQL' >> $OUTPUT_FILE

-- 品種データ
\echo '-- 品種データ'
COPY (
  SELECT 
    'INSERT INTO "breeds" ("id", "name", "description", "createdAt", "updatedAt") VALUES ' ||
    '(' || quote_literal(id) || ', ' || quote_literal(name) || ', ' || 
    COALESCE(quote_literal(description), 'NULL') || ', ' || 
    quote_literal(to_char("createdAt", 'YYYY-MM-DD HH24:MI:SS')) || ', ' ||
    quote_literal(to_char("updatedAt", 'YYYY-MM-DD HH24:MI:SS')) || ')' ||
    CASE WHEN row_number() OVER () < count(*) OVER () THEN ',' ELSE ' ON CONFLICT (id) DO NOTHING;' END
  FROM breeds
  WHERE id IN (SELECT DISTINCT "breedId" FROM cats WHERE "isInHouse" = true AND "breedId" IS NOT NULL)
) TO STDOUT;

\echo ''
\echo '-- 毛色データ'
COPY (
  SELECT 
    'INSERT INTO "coat_colors" ("id", "name", "description", "createdAt", "updatedAt") VALUES ' ||
    '(' || quote_literal(id) || ', ' || quote_literal(name) || ', ' || 
    COALESCE(quote_literal(description), 'NULL') || ', ' || 
    quote_literal(to_char("createdAt", 'YYYY-MM-DD HH24:MI:SS')) || ', ' ||
    quote_literal(to_char("updatedAt", 'YYYY-MM-DD HH24:MI:SS')) || ')' ||
    CASE WHEN row_number() OVER () < count(*) OVER () THEN ',' ELSE ' ON CONFLICT (id) DO NOTHING;' END
  FROM coat_colors
  WHERE id IN (SELECT DISTINCT "coatColorId" FROM cats WHERE "isInHouse" = true AND "coatColorId" IS NOT NULL)
) TO STDOUT;

\echo ''
\echo '-- 在舎猫データ'
COPY (
  SELECT 
    'INSERT INTO "cats" ("id", "name", "gender", "birthDate", "breedId", "coatColorId", "microchipNumber", "registrationNumber", "description", "isInHouse", "adoptedAt", "deathDate", "fatherId", "motherId", "ownerId", "createdAt", "updatedAt") VALUES ' ||
    '(' || 
    quote_literal(id) || ', ' || 
    quote_literal(name) || ', ' || 
    quote_literal(gender) || ', ' || 
    quote_literal("birthDate") || ', ' || 
    COALESCE(quote_literal("breedId"), 'NULL') || ', ' || 
    COALESCE(quote_literal("coatColorId"), 'NULL') || ', ' || 
    COALESCE(quote_literal("microchipNumber"), 'NULL') || ', ' || 
    COALESCE(quote_literal("registrationNumber"), 'NULL') || ', ' || 
    COALESCE(quote_literal(description), 'NULL') || ', ' || 
    "isInHouse" || ', ' || 
    COALESCE(quote_literal("adoptedAt"), 'NULL') || ', ' || 
    COALESCE(quote_literal("deathDate"), 'NULL') || ', ' || 
    COALESCE(quote_literal("fatherId"), 'NULL') || ', ' || 
    COALESCE(quote_literal("motherId"), 'NULL') || ', ' || 
    quote_literal("ownerId") || ', ' || 
    quote_literal(to_char("createdAt", 'YYYY-MM-DD HH24:MI:SS')) || ', ' ||
    quote_literal(to_char("updatedAt", 'YYYY-MM-DD HH24:MI:SS')) || ')' ||
    CASE WHEN row_number() OVER (ORDER BY name) < count(*) OVER () THEN ',' ELSE ' ON CONFLICT (id) DO NOTHING;' END
  FROM cats
  WHERE "isInHouse" = true
  ORDER BY name
) TO STDOUT;

EOSQL

echo ""
echo "✅ シードデータのエクスポートが完了しました: $OUTPUT_FILE"
