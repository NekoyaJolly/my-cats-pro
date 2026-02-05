/**
 * 血統書データCSVをSupabase (PostgreSQL) のPedigreeテーブルへインポートする
 * 移行スクリプト
 *
 * 使用方法:
 *   cd backend
 *   # 通常実行（確認プロンプトあり）
 *   pnpm exec dotenv -e ./.env -- tsx scripts/migrate_csv_to_supabase.ts
 *
 *   # 自動実行（--force フラグ使用）
 *   pnpm exec dotenv -e ./.env -- tsx scripts/migrate_csv_to_supabase.ts --force
 *
 *   # カスタムCSVパス指定
 *   PEDIGREE_CSV_PATH=path/to/file.csv pnpm exec dotenv -e ./.env -- tsx scripts/migrate_csv_to_supabase.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CsvRow {
  pedigreeId: string;
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
  fatherTitle: string;
  fatherCatName: string;
  fatherCatName2: string;
  fatherCoatColor: string;
  fatherEyeColor: string;
  fatherJCU: string;
  fatherOtherCode: string;
  motherTitle: string;
  motherCatName: string;
  motherCatName2: string;
  motherCoatColor: string;
  motherEyeColor: string;
  motherJCU: string;
  motherOtherCode: string;
  ffTitle: string;
  ffCatName: string;
  ffCatColor: string;
  ffjcu: string;
  fmTitle: string;
  fmCatName: string;
  fmCatColor: string;
  fmjcu: string;
  mfTitle: string;
  mfCatName: string;
  mfCatColor: string;
  mfjcu: string;
  mmTitle: string;
  mmCatName: string;
  mmCatColor: string;
  mmjcu: string;
  fffTitle: string;
  fffCatName: string;
  fffCatColor: string;
  fffjcu: string;
  ffmTitle: string;
  ffmCatName: string;
  ffmCatColor: string;
  ffmjcu: string;
  fmfTitle: string;
  fmfCatName: string;
  fmfCatColor: string;
  fmfjcu: string;
  fmmTitle: string;
  fmmCatName: string;
  fmmCatColor: string;
  fmmjcu: string;
  mffTitle: string;
  mffCatName: string;
  mffCatColor: string;
  mffjcu: string;
  mfmTitle: string;
  mfmCatName: string;
  mfmCatColor: string;
  mfmjcu: string;
  mmfTitle: string;
  mmfCatName: string;
  mmfCatColor: string;
  mmfjcu: string;
  mmmTitle: string;
  mmmCatName: string;
  mmmCatColor: string;
  mmmjcu: string;
  oldCode: string;
}

/**
 * CSVをパースする関数（RFC 4180準拠のcsv-parseライブラリ使用）
 */
function parseCsv(content: string): CsvRow[] {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relaxColumnCount: true,
    bom: true, // UTF-8 BOMを自動除去
  }) as CsvRow[];

  return records;
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

/**
 * ユーザーに確認を求める
 */
async function confirmAction(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  console.log('🚀 血統書データ移行スクリプトを開始します...');

  // 本番環境チェック
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ 本番環境ではこのスクリプトを実行できません');
    console.error(
      '   データの移行は慎重に行う必要があります。開発環境で十分にテストしてください。',
    );
    process.exit(1);
  }

  // CSVファイルパスの取得（環境変数で上書き可能）
  const csvRelativePath =
    process.env.PEDIGREE_CSV_PATH ?? '../src/pedigree/pedigree_data_utf8.csv';
  const csvPath = path.join(__dirname, csvRelativePath);
  console.log(`📄 CSVファイル読み込み中: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSVファイルが見つかりません: ${csvPath}`);
    console.error(
      `   環境変数 PEDIGREE_CSV_PATH でパスを指定できます: PEDIGREE_CSV_PATH=path/to/file.csv`,
    );
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(csvContent);
  console.log(`📊 ${rows.length} 行のデータを読み込みました`);

  // 既存データ削除の確認（--forceフラグがない場合）
  const forceFlag = process.argv.includes('--force');
  if (!forceFlag) {
    console.log('');
    console.log('⚠️  このスクリプトは既存のPedigreeデータをすべて削除します。');
    console.log('   この操作は取り消せません。');
    console.log('');

    const confirmed = await confirmAction('既存データを削除して続行しますか？');
    if (!confirmed) {
      console.log('キャンセルしました');
      await prisma.$disconnect();
      process.exit(0);
    }
  }

  // 既存データをクリア
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
      const result = await prisma.pedigree.createMany({
        data: pedigreeData,
        skipDuplicates: true,
      });
      successCount += result.count;
      console.log(
        `✅ バッチ ${Math.floor(i / batchSize) + 1}: ${result.count} 件挿入完了`,
      );
    } catch (error) {
      console.error(
        `❌ バッチ ${Math.floor(i / batchSize) + 1} でエラー（個別インサートを試行します）:`,
        error,
      );
      // バッチ全体が失敗した場合は、1件ずつ挿入して成功・失敗件数を正確にカウントする
      for (let j = 0; j < pedigreeData.length; j++) {
        const record = pedigreeData[j];
        try {
          await prisma.pedigree.create({
            data: record,
          });
          successCount += 1;
        } catch (recordError) {
          errorCount += 1;
          console.error(
            `❌ レコード (バッチ ${Math.floor(i / batchSize) + 1}, インデックス ${j}, pedigreeId: ${record.pedigreeId}) でエラー:`,
            recordError,
          );
        }
      }
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

main().catch(async (e) => {
  console.error('移行中にエラーが発生しました:', e);
  await prisma.$disconnect();
  process.exit(1);
});
