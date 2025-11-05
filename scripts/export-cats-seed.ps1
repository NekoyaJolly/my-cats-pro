# 在舎猫データをシードデータとしてエクスポートするスクリプト (PowerShell)

$ErrorActionPreference = "Stop"

# 環境変数の設定
$env:PGPASSWORD = "mycats_dev_password"
$DB_HOST = "localhost"
$DB_PORT = "5433"
$DB_NAME = "mycats_development"
$DB_USER = "mycats"
$OUTPUT_FILE = "..\backend\prisma\seed-cats-data.sql"

Write-Host "🔄 在舎猫データをエクスポート中..." -ForegroundColor Cyan

# ヘッダーを書き込み
@"
-- 在舎猫データのシードデータ (自動生成: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
-- このファイルは現在の在舎猫データから生成されました

"@ | Out-File -FilePath $OUTPUT_FILE -Encoding UTF8

# 品種データのエクスポート
Write-Host "📦 品種データをエクスポート中..." -ForegroundColor Yellow
$breedQuery = @"
SELECT 
  'INSERT INTO "breeds" ("id", "name", "description", "createdAt", "updatedAt") VALUES (' ||
  quote_literal(id) || ', ' || quote_literal(name) || ', ' || 
  COALESCE(quote_literal(description), 'NULL') || ', ' || 
  quote_literal("createdAt"::text) || ', ' ||
  quote_literal("updatedAt"::text) || ');'
FROM breeds
WHERE id IN (SELECT DISTINCT "breedId" FROM cats WHERE "isInHouse" = true AND "breedId" IS NOT NULL)
ORDER BY name;
"@

"-- 品種データ" | Add-Content -Path $OUTPUT_FILE -Encoding UTF8
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -A -c $breedQuery | Add-Content -Path $OUTPUT_FILE -Encoding UTF8
"" | Add-Content -Path $OUTPUT_FILE -Encoding UTF8

# 毛色データのエクスポート
Write-Host "🎨 毛色データをエクスポート中..." -ForegroundColor Yellow
$colorQuery = @"
SELECT 
  'INSERT INTO "coat_colors" ("id", "name", "description", "createdAt", "updatedAt") VALUES (' ||
  quote_literal(id) || ', ' || quote_literal(name) || ', ' || 
  COALESCE(quote_literal(description), 'NULL') || ', ' || 
  quote_literal("createdAt"::text) || ', ' ||
  quote_literal("updatedAt"::text) || ');'
FROM coat_colors
WHERE id IN (SELECT DISTINCT "coatColorId" FROM cats WHERE "isInHouse" = true AND "coatColorId" IS NOT NULL)
ORDER BY name;
"@

"-- 毛色データ" | Add-Content -Path $OUTPUT_FILE -Encoding UTF8
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -A -c $colorQuery | Add-Content -Path $OUTPUT_FILE -Encoding UTF8
"" | Add-Content -Path $OUTPUT_FILE -Encoding UTF8

# 在舎猫データのエクスポート
Write-Host "🐱 在舎猫データをエクスポート中..." -ForegroundColor Yellow
$catsQuery = @"
SELECT 
  'INSERT INTO "cats" ("id", "name", "gender", "birthDate", "breedId", "coatColorId", ' ||
  '"microchipNumber", "registrationNumber", "description", "isInHouse", "adoptedAt", ' ||
  '"deathDate", "fatherId", "motherId", "ownerId", "createdAt", "updatedAt") VALUES (' ||
  quote_literal(id) || ', ' || 
  quote_literal(name) || ', ' || 
  quote_literal(gender) || ', ' || 
  quote_literal("birthDate"::text) || ', ' || 
  COALESCE(quote_literal("breedId"), 'NULL') || ', ' || 
  COALESCE(quote_literal("coatColorId"), 'NULL') || ', ' || 
  COALESCE(quote_literal("microchipNumber"), 'NULL') || ', ' || 
  COALESCE(quote_literal("registrationNumber"), 'NULL') || ', ' || 
  COALESCE(quote_literal(description), 'NULL') || ', ' || 
  "isInHouse"::text || ', ' || 
  COALESCE(quote_literal("adoptedAt"::text), 'NULL') || ', ' || 
  COALESCE(quote_literal("deathDate"::text), 'NULL') || ', ' || 
  COALESCE(quote_literal("fatherId"), 'NULL') || ', ' || 
  COALESCE(quote_literal("motherId"), 'NULL') || ', ' || 
  quote_literal("ownerId") || ', ' || 
  quote_literal("createdAt"::text) || ', ' ||
  quote_literal("updatedAt"::text) || ') ON CONFLICT (id) DO NOTHING;'
FROM cats
WHERE "isInHouse" = true
ORDER BY name;
"@

"-- 在舎猫データ" | Add-Content -Path $OUTPUT_FILE -Encoding UTF8
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -A -c $catsQuery | Add-Content -Path $OUTPUT_FILE -Encoding UTF8

Write-Host ""
Write-Host "✅ シードデータのエクスポートが完了しました: $OUTPUT_FILE" -ForegroundColor Green
Write-Host ""
Write-Host "📝 次のステップ:" -ForegroundColor Cyan
Write-Host "   1. backend/prisma/seed-cats-data.sql を確認"
Write-Host "   2. docker-compose.yml の database/init にコピー"
Write-Host "   3. Macでdocker-compose upを実行"
