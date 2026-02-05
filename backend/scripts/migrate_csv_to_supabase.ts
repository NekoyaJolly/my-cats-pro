/**
 * 血統書データCSVをSupabase (PostgreSQL) のPedigreeテーブルへインポートする
 * 移行スクリプト
 *
 * 使用方法:
 *   cd backend
 *   pnpm exec dotenv -e ./.env -- tsx scripts/migrate_csv_to_supabase.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CsvRow {
  pedigreeId: string;
  championFlag: string;
  title: string;
  catName: string;
  catName2: string;
  breedCode: string;
  genderCode: string;
  eyeColor: string;
  coatColorCode: string;
  birthDate: string;
  breederName: string;
  ownerName: string;
  registrationDate: string;
  brotherCount: string;
  sisterCount: string;
  notes: string;
  notes2: string;
  otherNo: string;
  fatherChampionFlag: string;
  fatherTitle: string;
  fatherCatName: string;
  fatherCatName2: string;
  fatherCoatColor: string;
  fatherEyeColor: string;
  fatherJCU: string;
  fatherOtherCode: string;
  motherChampionFlag: string;
  motherTitle: string;
  motherCatName: string;
  motherCatName2: string;
  motherCoatColor: string;
  motherEyeColor: string;
  motherJCU: string;
  motherOtherCode: string;
  ffChampionFlag: string;
  ffTitle: string;
  ffCatName: string;
  ffCatColor: string;
  ffjcu: string;
  fmChampionFlag: string;
  fmTitle: string;
  fmCatName: string;
  fmCatColor: string;
  fmjcu: string;
  mfChampionFlag: string;
  mfTitle: string;
  mfCatName: string;
  mfCatColor: string;
  mfjcu: string;
  mmChampionFlag: string;
  mmTitle: string;
  mmCatName: string;
  mmCatColor: string;
  mmjcu: string;
  fffChampionFlag: string;
  fffTitle: string;
  fffCatName: string;
  fffCatColor: string;
  fffjcu: string;
  ffmChampionFlag: string;
  ffmTitle: string;
  ffmCatName: string;
  ffmCatColor: string;
  ffmjcu: string;
  fmfChampionFlag: string;
  fmfTitle: string;
  fmfCatName: string;
  fmfCatColor: string;
  fmfjcu: string;
  fmmChampionFlag: string;
  fmmTitle: string;
  fmmCatName: string;
  fmmCatColor: string;
  fmmjcu: string;
  mffChampionFlag: string;
  mffTitle: string;
  mffCatName: string;
  mffCatColor: string;
  mffjcu: string;
  mfmChampionFlag: string;
  mfmTitle: string;
  mfmCatName: string;
  mfmCatColor: string;
  mfmjcu: string;
  mmfChampionFlag: string;
  mmfTitle: string;
  mmfCatName: string;
  mmfCatColor: string;
  mmfjcu: string;
  mmmChampionFlag: string;
  mmmTitle: string;
  mmmCatName: string;
  mmmCatColor: string;
  mmmjcu: string;
  oldCode: string;
}

/**
 * CSVをパースする簡易関数（ダブルクォート対応）
 */
function parseCsv(content: string): CsvRow[] {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSV行をパース（シンプルなカンマ分割）
    const values = line.split(',');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CSV parsing requires dynamic key assignment
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length && j < values.length; j++) {
      row[headers[j]] = values[j]?.trim() ?? '';
    }
    rows.push(row as unknown as CsvRow);
  }
  return rows;
}

/**
 * 文字列を整数に変換（空文字やNaNの場合はnull）
 */
function toIntOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const num = parseInt(trimmed, 10);
  return isNaN(num) ? null : num;
}

/**
 * 空文字をnullに変換
 */
function toStringOrNull(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

async function main() {
  console.log('🚀 血統書データ移行スクリプトを開始します...');

  // CSVファイルを読み込み
  const csvPath = path.join(
    __dirname,
    '../src/pedigree/血統書データUTF8Ver.csv',
  );
  console.log(`📄 CSVファイル読み込み中: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSVファイルが見つかりません: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(csvContent);
  console.log(`📊 ${rows.length} 行のデータを読み込みました`);

  // 既存データをクリア（オプション）
  console.log('🗑️  既存のPedigreeデータを削除中...');
  await prisma.pedigree.deleteMany({});

  // データを挿入
  let successCount = 0;
  let errorCount = 0;
  const batchSize = 100;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const pedigreeData = batch.map((row) => ({
      pedigreeId: row.pedigreeId?.trim() || `UNKNOWN-${i}`,
      title: toStringOrNull(row.title),
      catName: toStringOrNull(row.catName),
      catName2: toStringOrNull(row.catName2),
      breedCode: toIntOrNull(row.breedCode),
      genderCode: toIntOrNull(row.genderCode),
      eyeColor: toStringOrNull(row.eyeColor),
      coatColorCode: toIntOrNull(row.coatColorCode),
      birthDate: toStringOrNull(row.birthDate),
      breederName: toStringOrNull(row.breederName),
      ownerName: toStringOrNull(row.ownerName),
      registrationDate: toStringOrNull(row.registrationDate),
      brotherCount: toIntOrNull(row.brotherCount),
      sisterCount: toIntOrNull(row.sisterCount),
      notes: toStringOrNull(row.notes),
      notes2: toStringOrNull(row.notes2),
      otherNo: toStringOrNull(row.otherNo),
      fatherTitle: toStringOrNull(row.fatherTitle),
      fatherCatName: toStringOrNull(row.fatherCatName),
      fatherCatName2: toStringOrNull(row.fatherCatName2),
      fatherCoatColor: toStringOrNull(row.fatherCoatColor),
      fatherEyeColor: toStringOrNull(row.fatherEyeColor),
      fatherJCU: toStringOrNull(row.fatherJCU),
      fatherOtherCode: toStringOrNull(row.fatherOtherCode),
      motherTitle: toStringOrNull(row.motherTitle),
      motherCatName: toStringOrNull(row.motherCatName),
      motherCatName2: toStringOrNull(row.motherCatName2),
      motherCoatColor: toStringOrNull(row.motherCoatColor),
      motherEyeColor: toStringOrNull(row.motherEyeColor),
      motherJCU: toStringOrNull(row.motherJCU),
      motherOtherCode: toStringOrNull(row.motherOtherCode),
      ffTitle: toStringOrNull(row.ffTitle),
      ffCatName: toStringOrNull(row.ffCatName),
      ffCatColor: toStringOrNull(row.ffCatColor),
      ffjcu: toStringOrNull(row.ffjcu),
      fmTitle: toStringOrNull(row.fmTitle),
      fmCatName: toStringOrNull(row.fmCatName),
      fmCatColor: toStringOrNull(row.fmCatColor),
      fmjcu: toStringOrNull(row.fmjcu),
      mfTitle: toStringOrNull(row.mfTitle),
      mfCatName: toStringOrNull(row.mfCatName),
      mfCatColor: toStringOrNull(row.mfCatColor),
      mfjcu: toStringOrNull(row.mfjcu),
      mmTitle: toStringOrNull(row.mmTitle),
      mmCatName: toStringOrNull(row.mmCatName),
      mmCatColor: toStringOrNull(row.mmCatColor),
      mmjcu: toStringOrNull(row.mmjcu),
      fffTitle: toStringOrNull(row.fffTitle),
      fffCatName: toStringOrNull(row.fffCatName),
      fffCatColor: toStringOrNull(row.fffCatColor),
      fffjcu: toStringOrNull(row.fffjcu),
      ffmTitle: toStringOrNull(row.ffmTitle),
      ffmCatName: toStringOrNull(row.ffmCatName),
      ffmCatColor: toStringOrNull(row.ffmCatColor),
      ffmjcu: toStringOrNull(row.ffmjcu),
      fmfTitle: toStringOrNull(row.fmfTitle),
      fmfCatName: toStringOrNull(row.fmfCatName),
      fmfCatColor: toStringOrNull(row.fmfCatColor),
      fmfjcu: toStringOrNull(row.fmfjcu),
      fmmTitle: toStringOrNull(row.fmmTitle),
      fmmCatName: toStringOrNull(row.fmmCatName),
      fmmCatColor: toStringOrNull(row.fmmCatColor),
      fmmjcu: toStringOrNull(row.fmmjcu),
      mffTitle: toStringOrNull(row.mffTitle),
      mffCatName: toStringOrNull(row.mffCatName),
      mffCatColor: toStringOrNull(row.mffCatColor),
      mffjcu: toStringOrNull(row.mffjcu),
      mfmTitle: toStringOrNull(row.mfmTitle),
      mfmCatName: toStringOrNull(row.mfmCatName),
      mfmCatColor: toStringOrNull(row.mfmCatColor),
      mfmjcu: toStringOrNull(row.mfmjcu),
      mmfTitle: toStringOrNull(row.mmfTitle),
      mmfCatName: toStringOrNull(row.mmfCatName),
      mmfCatColor: toStringOrNull(row.mmfCatColor),
      mmfjcu: toStringOrNull(row.mmfjcu),
      mmmTitle: toStringOrNull(row.mmmTitle),
      mmmCatName: toStringOrNull(row.mmmCatName),
      mmmCatColor: toStringOrNull(row.mmmCatColor),
      mmmjcu: toStringOrNull(row.mmmjcu),
      oldCode: toStringOrNull(row.oldCode),
    }));

    try {
      await prisma.pedigree.createMany({
        data: pedigreeData,
        skipDuplicates: true,
      });
      successCount += batch.length;
      console.log(
        `✅ バッチ ${Math.floor(i / batchSize) + 1}: ${batch.length} 件挿入完了`,
      );
    } catch (error) {
      errorCount += batch.length;
      console.error(
        `❌ バッチ ${Math.floor(i / batchSize) + 1} でエラー:`,
        error,
      );
    }
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('📈 移行結果:');
  console.log(`  ✅ 成功: ${successCount} 件`);
  console.log(`  ❌ 失敗: ${errorCount} 件`);
  console.log('='.repeat(50));

  // 投入後の件数確認
  const finalCount = await prisma.pedigree.count();
  console.log(`📊 Pedigreeテーブルの最終レコード数: ${finalCount}`);

  await prisma.$disconnect();
  console.log('🎉 移行完了！');
}

main().catch((e) => {
  console.error('移行中にエラーが発生しました:', e);
  prisma.$disconnect();
  process.exit(1);
});
