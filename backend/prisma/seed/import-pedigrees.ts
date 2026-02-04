import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// CSVのヘッダー名（Prismaスキーマ準拠のcamelCase）に合わせたインターフェース
interface PedigreeCsvRecord {
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

  // 両親
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

  // 祖父母
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

  // 曾祖父母
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

// 数値フィールドの変換（空文字列はnullに）
const parseIntOrNull = (value: string | undefined) => {
  if (!value || value.trim() === '') return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

// 文字列フィールドの変換（空文字列はundefinedに）
const parseStringOrUndefined = (value: string | undefined) => {
  if (!value || value.trim() === '') return undefined;
  return value;
};

async function main() {
  // CSVファイルのパスを更新
  const csvFilePath = path.join(process.cwd(), 'src/pedigree/血統書データUTF8Ver.csv');
  console.log(`Reading CSV from: ${csvFilePath}`);

  if (!fs.existsSync(csvFilePath)) {
    console.error(`CSV file not found at ${csvFilePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

  // CSVをパース
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true, // UTF-8 BOM対応
  }) as PedigreeCsvRecord[];

  console.log(`Found ${records.length} records to import`);

  // デバッグ: 最初のレコードを確認
  if (records.length > 0) {
    const firstRecord = records[0];
    console.log('First record keys:', Object.keys(firstRecord));
    console.log('First record pedigreeId:', firstRecord['pedigreeId']);
  }

  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      const pedigreeIdValue = record.pedigreeId;

      if (!pedigreeIdValue) {
        console.error('Skipping record with missing pedigreeId');
        errorCount++;
        continue;
      }

      // データのマッピング (CSVヘッダーがPrismaスキーマと一致するため直接マッピング)
      await prisma.pedigree.upsert({
        where: { pedigreeId: pedigreeIdValue },
        update: {
          title: parseStringOrUndefined(record.title),
          catName: parseStringOrUndefined(record.catName),
          catName2: parseStringOrUndefined(record.catName2),
          breedCode: parseIntOrNull(record.breedCode) ?? undefined,
          genderCode: parseIntOrNull(record.genderCode) ?? undefined,
          eyeColor: parseStringOrUndefined(record.eyeColor),
          coatColorCode: parseIntOrNull(record.coatColorCode) ?? undefined,
          birthDate: parseStringOrUndefined(record.birthDate),
          breederName: parseStringOrUndefined(record.breederName),
          ownerName: parseStringOrUndefined(record.ownerName),
          registrationDate: parseStringOrUndefined(record.registrationDate),
          brotherCount: parseIntOrNull(record.brotherCount) ?? undefined,
          sisterCount: parseIntOrNull(record.sisterCount) ?? undefined,
          notes: parseStringOrUndefined(record.notes),
          notes2: parseStringOrUndefined(record.notes2),
          otherNo: parseStringOrUndefined(record.otherNo),
          // Generation 1 (両親)
          fatherTitle: parseStringOrUndefined(record.fatherTitle),
          fatherCatName: parseStringOrUndefined(record.fatherCatName),
          fatherCatName2: parseStringOrUndefined(record.fatherCatName2),
          fatherCoatColor: parseStringOrUndefined(record.fatherCoatColor),
          fatherEyeColor: parseStringOrUndefined(record.fatherEyeColor),
          fatherJCU: parseStringOrUndefined(record.fatherJCU),
          fatherOtherCode: parseStringOrUndefined(record.fatherOtherCode),
          motherTitle: parseStringOrUndefined(record.motherTitle),
          motherCatName: parseStringOrUndefined(record.motherCatName),
          motherCatName2: parseStringOrUndefined(record.motherCatName2),
          motherCoatColor: parseStringOrUndefined(record.motherCoatColor),
          motherEyeColor: parseStringOrUndefined(record.motherEyeColor),
          motherJCU: parseStringOrUndefined(record.motherJCU),
          motherOtherCode: parseStringOrUndefined(record.motherOtherCode),
          // Generation 2 (祖父母)
          ffTitle: parseStringOrUndefined(record.ffTitle),
          ffCatName: parseStringOrUndefined(record.ffCatName),
          ffCatColor: parseStringOrUndefined(record.ffCatColor),
          ffjcu: parseStringOrUndefined(record.ffjcu),
          fmTitle: parseStringOrUndefined(record.fmTitle),
          fmCatName: parseStringOrUndefined(record.fmCatName),
          fmCatColor: parseStringOrUndefined(record.fmCatColor),
          fmjcu: parseStringOrUndefined(record.fmjcu),
          mfTitle: parseStringOrUndefined(record.mfTitle),
          mfCatName: parseStringOrUndefined(record.mfCatName),
          mfCatColor: parseStringOrUndefined(record.mfCatColor),
          mfjcu: parseStringOrUndefined(record.mfjcu),
          mmTitle: parseStringOrUndefined(record.mmTitle),
          mmCatName: parseStringOrUndefined(record.mmCatName),
          mmCatColor: parseStringOrUndefined(record.mmCatColor),
          mmjcu: parseStringOrUndefined(record.mmjcu),
          // Generation 3 (曾祖父母)
          fffTitle: parseStringOrUndefined(record.fffTitle),
          fffCatName: parseStringOrUndefined(record.fffCatName),
          fffjcu: parseStringOrUndefined(record.fffjcu),
          ffmTitle: parseStringOrUndefined(record.ffmTitle),
          ffmCatName: parseStringOrUndefined(record.ffmCatName),
          ffmjcu: parseStringOrUndefined(record.ffmjcu),
          fmfTitle: parseStringOrUndefined(record.fmfTitle),
          fmfCatName: parseStringOrUndefined(record.fmfCatName),
          fmfjcu: parseStringOrUndefined(record.fmfjcu),
          fmmTitle: parseStringOrUndefined(record.fmmTitle),
          fmmCatName: parseStringOrUndefined(record.fmmCatName),
          fmmjcu: parseStringOrUndefined(record.fmmjcu),
          mffTitle: parseStringOrUndefined(record.mffTitle),
          mffCatName: parseStringOrUndefined(record.mffCatName),
          mffjcu: parseStringOrUndefined(record.mffjcu),
          mfmTitle: parseStringOrUndefined(record.mfmTitle),
          mfmCatName: parseStringOrUndefined(record.mfmCatName),
          mfmjcu: parseStringOrUndefined(record.mfmjcu),
          mmfTitle: parseStringOrUndefined(record.mmfTitle),
          mmfCatName: parseStringOrUndefined(record.mmfCatName),
          mmfjcu: parseStringOrUndefined(record.mmfjcu),
          mmmTitle: parseStringOrUndefined(record.mmmTitle),
          mmmCatName: parseStringOrUndefined(record.mmmCatName),
          mmmjcu: parseStringOrUndefined(record.mmmjcu),
          oldCode: parseStringOrUndefined(record.oldCode),
        },
        create: {
          pedigreeId: pedigreeIdValue,
          title: parseStringOrUndefined(record.title),
          catName: parseStringOrUndefined(record.catName),
          catName2: parseStringOrUndefined(record.catName2),
          breedCode: parseIntOrNull(record.breedCode) ?? undefined,
          genderCode: parseIntOrNull(record.genderCode) ?? undefined,
          eyeColor: parseStringOrUndefined(record.eyeColor),
          coatColorCode: parseIntOrNull(record.coatColorCode) ?? undefined,
          birthDate: parseStringOrUndefined(record.birthDate),
          breederName: parseStringOrUndefined(record.breederName),
          ownerName: parseStringOrUndefined(record.ownerName),
          registrationDate: parseStringOrUndefined(record.registrationDate),
          brotherCount: parseIntOrNull(record.brotherCount) ?? undefined,
          sisterCount: parseIntOrNull(record.sisterCount) ?? undefined,
          notes: parseStringOrUndefined(record.notes),
          notes2: parseStringOrUndefined(record.notes2),
          otherNo: parseStringOrUndefined(record.otherNo),
          // Generation 1 (両親)
          fatherTitle: parseStringOrUndefined(record.fatherTitle),
          fatherCatName: parseStringOrUndefined(record.fatherCatName),
          fatherCatName2: parseStringOrUndefined(record.fatherCatName2),
          fatherCoatColor: parseStringOrUndefined(record.fatherCoatColor),
          fatherEyeColor: parseStringOrUndefined(record.fatherEyeColor),
          fatherJCU: parseStringOrUndefined(record.fatherJCU),
          fatherOtherCode: parseStringOrUndefined(record.fatherOtherCode),
          motherTitle: parseStringOrUndefined(record.motherTitle),
          motherCatName: parseStringOrUndefined(record.motherCatName),
          motherCatName2: parseStringOrUndefined(record.motherCatName2),
          motherCoatColor: parseStringOrUndefined(record.motherCoatColor),
          motherEyeColor: parseStringOrUndefined(record.motherEyeColor),
          motherJCU: parseStringOrUndefined(record.motherJCU),
          motherOtherCode: parseStringOrUndefined(record.motherOtherCode),
          // Generation 2 (祖父母)
          ffTitle: parseStringOrUndefined(record.ffTitle),
          ffCatName: parseStringOrUndefined(record.ffCatName),
          ffCatColor: parseStringOrUndefined(record.ffCatColor),
          ffjcu: parseStringOrUndefined(record.ffjcu),
          fmTitle: parseStringOrUndefined(record.fmTitle),
          fmCatName: parseStringOrUndefined(record.fmCatName),
          fmCatColor: parseStringOrUndefined(record.fmCatColor),
          fmjcu: parseStringOrUndefined(record.fmjcu),
          mfTitle: parseStringOrUndefined(record.mfTitle),
          mfCatName: parseStringOrUndefined(record.mfCatName),
          mfCatColor: parseStringOrUndefined(record.mfCatColor),
          mfjcu: parseStringOrUndefined(record.mfjcu),
          mmTitle: parseStringOrUndefined(record.mmTitle),
          mmCatName: parseStringOrUndefined(record.mmCatName),
          mmCatColor: parseStringOrUndefined(record.mmCatColor),
          mmjcu: parseStringOrUndefined(record.mmjcu),
          // Generation 3 (曾祖父母)
          fffTitle: parseStringOrUndefined(record.fffTitle),
          fffCatName: parseStringOrUndefined(record.fffCatName),
          fffCatColor: parseStringOrUndefined(record.fffCatColor),
          fffjcu: parseStringOrUndefined(record.fffjcu),
          ffmTitle: parseStringOrUndefined(record.ffmTitle),
          ffmCatName: parseStringOrUndefined(record.ffmCatName),
          ffmCatColor: parseStringOrUndefined(record.ffmCatColor),
          ffmjcu: parseStringOrUndefined(record.ffmjcu),
          fmfTitle: parseStringOrUndefined(record.fmfTitle),
          fmfCatName: parseStringOrUndefined(record.fmfCatName),
          fmfCatColor: parseStringOrUndefined(record.fmfCatColor),
          fmfjcu: parseStringOrUndefined(record.fmfjcu),
          fmmTitle: parseStringOrUndefined(record.fmmTitle),
          fmmCatName: parseStringOrUndefined(record.fmmCatName),
          fmmCatColor: parseStringOrUndefined(record.fmmCatColor),
          fmmjcu: parseStringOrUndefined(record.fmmjcu),
          mffTitle: parseStringOrUndefined(record.mffTitle),
          mffCatName: parseStringOrUndefined(record.mffCatName),
          mffCatColor: parseStringOrUndefined(record.mffCatColor),
          mffjcu: parseStringOrUndefined(record.mffjcu),
          mfmTitle: parseStringOrUndefined(record.mfmTitle),
          mfmCatName: parseStringOrUndefined(record.mfmCatName),
          mfmCatColor: parseStringOrUndefined(record.mfmCatColor),
          mfmjcu: parseStringOrUndefined(record.mfmjcu),
          mmfTitle: parseStringOrUndefined(record.mmfTitle),
          mmfCatName: parseStringOrUndefined(record.mmfCatName),
          mmfCatColor: parseStringOrUndefined(record.mmfCatColor),
          mmfjcu: parseStringOrUndefined(record.mmfjcu),
          mmmTitle: parseStringOrUndefined(record.mmmTitle),
          mmmCatName: parseStringOrUndefined(record.mmmCatName),
          mmmCatColor: parseStringOrUndefined(record.mmmCatColor),
          mmmjcu: parseStringOrUndefined(record.mmmjcu),
          oldCode: parseStringOrUndefined(record.oldCode),
        },
      });
      successCount++;
      if (successCount % 100 === 0) {
        console.log(`Imported ${successCount} records...`);
      }
    } catch (error) {
      errorCount++;
      console.error(`Error importing record ${record.pedigreeId}:`, error);
    }
  }

  console.log(`\nImport completed!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
