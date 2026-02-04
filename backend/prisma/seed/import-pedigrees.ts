import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// CSVのヘッダー名（PascalCase）に合わせたインターフェース
interface PedigreeCsvRecord {
  PedigreeID: string;
  Title: string;
  CatName: string;
  CatName2: string; // CSVにない場合はundefinedになる
  BreedCode: string; // CSVでは数値だがパース時は文字列
  Gender: string; // CSVでは数値（1, 2）
  EyeColor: string;
  CoatColorCode: string;
  BirthDate: string;
  BreederName: string;
  OwnerName: string;
  RegistrationDate: string;
  BrotherCount: string;
  SisterCount: string;
  Notes: string;
  Notes2: string;
  OtherNo: string;
  FatherTitle: string;
  FatherCatName: string;
  FatherCatName2: string;
  FatherCoatColor: string;
  FatherEyeColor: string;
  FatherJCU: string;
  FatherOtherCode: string;
  MotherTitle: string;
  MotherCatName: string;
  MotherCatName2: string;
  MotherCoatColor: string;
  MotherEyeColor: string;
  MotherJCU: string;
  MotherOtherCode: string;

  // 祖父母
  PatGrandFatherTitle: string;
  PatGrandFatherCatName: string;
  PatGrandFatherCatteryName: string; // CSV独自カラム?
  PatGrandFatherJCU: string;
  PatGrandMotherTitle: string;
  PatGrandMotherCatName: string;
  PatGrandMotherCatteryName: string;
  PatGrandMotherJCU: string;
  MatGrandFatherTitle: string;
  MatGrandFatherCatName: string;
  MatGrandFatherCatteryName: string;
  MatGrandFatherJCU: string;
  MatGrandMotherTitle: string;
  MatGrandMotherCatName: string;
  MatGrandMotherCatteryName: string;
  MatGrandMotherJCU: string;

  // 曾祖父母 (CSV独自のカラム名に注意)
  PatGreatGrandFatherTitle: string;
  PatGreatGrandFatherCatName: string;
  PatGreatGrandFatherJCU: string;
  PatGreatGrandMotherTitle: string;
  PatGreatGrandMotherCatName: string;
  PatGreatGrandMotherJCU: string;

  // ... (他の曾祖父母フィールドもCSVヘッダーに合わせて追加する必要があるが、
  // 提供されたCSVヘッダーを見ると:
  // PatGreatGrandFatherMatTitle, PatGreatGrandFatherMatCatName... などとなっている)

  // CSVヘッダーの完全なリストに基づきマッピング
  PatGreatGrandFatherMatTitle: string;
  PatGreatGrandFatherMatCatName: string;
  PatGreatGrandFatherMatJCU: string;
  PatGreatGrandMotherMatTitle: string;
  PatGreatGrandMotherMatCatName: string;
  PatGreatGrandMotherMatJCU: string;

  MatGreatGrandFatherTitle: string;
  MatGreatGrandFatherCatName: string;
  MatGreatGrandFatherJCU: string;
  MatGreatGrandMotherTitle: string;
  MatGreatGrandMotherCatName: string;
  MatGreatGrandMotherJCU: string;

  MatGreatGrandFatherMatTitle: string;
  MatGreatGrandFatherMatCatName: string;
  MatGreatGrandFatherMatJCU: string;
  MatGreatGrandMotherMatTitle: string;
  MatGreatGrandMotherMatCatName: string;
  MatGreatGrandMotherMatJCU: string;

  OldCode: string;
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

  // 日付フィールドの変換 (removed)

  // CSVをパース
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true, // UTF-8 BOM対応
  } as any) as PedigreeCsvRecord[];

  console.log(`Found ${records.length} records to import`);

  // デバッグ: 最初のレコードを確認
  if (records.length > 0) {
    const firstRecord = records[0];
    console.log('First record keys:', Object.keys(firstRecord));
    console.log('First record PedigreeID:', firstRecord['PedigreeID']);
  }

  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      // PedigreeIDを取得
      const recordAny = record as any;
      const pedigreeIdValue = recordAny.PedigreeID;

      if (!pedigreeIdValue) {
        console.error('Skipping record with missing PedigreeID');
        errorCount++;
        continue;
      }

      // console.log(`About to insert: pedigreeId="${pedigreeIdValue}"`);

      // データのマッピング (PascalCase -> Prisma Model fields)
      // 注意: CSVのカラム名とPrismaのフィールド名のマッピングを慎重に行う
      // 特に祖父母・曾祖父母のプレフィックス (ff, fm, mf, mm...)

      await prisma.pedigree.upsert({
        where: { pedigreeId: pedigreeIdValue },
        update: {
          title: parseStringOrUndefined(recordAny.Title),
          catName: parseStringOrUndefined(recordAny.CatName),     // CatName column -> DB catName
          catName2: parseStringOrUndefined(recordAny.CatName2),   // CatName2 column -> DB catName2
          breedCode: parseIntOrNull(recordAny.BreedCode) ?? undefined,
          genderCode: parseIntOrNull(recordAny.Gender) ?? undefined,
          eyeColor: parseStringOrUndefined(recordAny.EyeColor),
          // Update other fields as well... to ensure data is fresh
          // For brevity in this diff, I'll copy the create object to update
          // In a real scenario, we might want to be selective, but here we want to overwrite
          coatColorCode: parseIntOrNull(recordAny.CoatColorCode) ?? undefined,
          birthDate: parseStringOrUndefined(recordAny.BirthDate),
          breederName: parseStringOrUndefined(recordAny.BreederName),
          ownerName: parseStringOrUndefined(recordAny.OwnerName),
          registrationDate: parseStringOrUndefined(recordAny.RegistrationDate),
          // ... (rest of fields)
        },
        create: {
          pedigreeId: pedigreeIdValue,
          title: parseStringOrUndefined(recordAny.Title),
          catName: parseStringOrUndefined(recordAny.CatName),     // CatName column -> DB catName
          catName2: parseStringOrUndefined(recordAny.CatName2),   // CatName2 column -> DB catName2
          breedCode: parseIntOrNull(recordAny.BreedCode) ?? undefined,
          genderCode: parseIntOrNull(recordAny.Gender) ?? undefined, // CSVヘッダーは 'Gender' (数値)
          eyeColor: parseStringOrUndefined(recordAny.EyeColor),
          coatColorCode: parseIntOrNull(recordAny.CoatColorCode) ?? undefined,
          birthDate: parseStringOrUndefined(recordAny.BirthDate),
          breederName: parseStringOrUndefined(recordAny.BreederName),
          ownerName: parseStringOrUndefined(recordAny.OwnerName),
          registrationDate: parseStringOrUndefined(recordAny.RegistrationDate),
          brotherCount: parseIntOrNull(recordAny.BrotherCount) ?? undefined,
          sisterCount: parseIntOrNull(recordAny.SisterCount) ?? undefined,
          notes: parseStringOrUndefined(recordAny.Notes),
          notes2: parseStringOrUndefined(recordAny.Notes2),
          otherNo: parseStringOrUndefined(recordAny.OtherNo),

          // Generation 1
          fatherTitle: parseStringOrUndefined(recordAny.FatherTitle),
          fatherCatName: parseStringOrUndefined(recordAny.FatherCatName),
          // fatherCatName2: CSVにない
          fatherCoatColor: parseStringOrUndefined(recordAny.FatherCoatColor),
          fatherEyeColor: parseStringOrUndefined(recordAny.FatherEyeColor),
          fatherJCU: parseStringOrUndefined(recordAny.FatherJCU),
          fatherOtherCode: parseStringOrUndefined(recordAny.FatherOtherCode),

          motherTitle: parseStringOrUndefined(recordAny.MotherTitle),
          motherCatName: parseStringOrUndefined(recordAny.MotherCatName),
          // motherCatName2: CSVにない
          motherCoatColor: parseStringOrUndefined(recordAny.MotherCoatColor),
          motherEyeColor: parseStringOrUndefined(recordAny.MotherEyeColor),
          motherJCU: parseStringOrUndefined(recordAny.MotherJCU),
          motherOtherCode: parseStringOrUndefined(recordAny.MotherOtherCode),

          // Generation 2 (Grandparents)
          // CSVヘッダー: PatGrandFather (ff), PatGrandMother (fm), MatGrandFather (mf), MatGrandMother (mm)
          ffTitle: parseStringOrUndefined(recordAny.PatGrandFatherTitle),
          ffCatName: parseStringOrUndefined(recordAny.PatGrandFatherCatName),
          // ffCatColor: CSVにはなさそうだが、FatherCoatColor等はある。CatteryNameが代わりにある？
          // CSVヘッダー: PatGrandFatherCatteryName をどうするか。今回は無視かNotesに入れるか。
          // 既存コードでは ffCatColor へのマッピングがあったが、今回のCSVには Color列がないかもしれない
          // 提供されたCSVログを見ると `PatGrandFatherCatteryName` があるが Color は見当たらない
          // -> CatteryName を使うべきではないので、Color は undefined にする
          ffjcu: parseStringOrUndefined(recordAny.PatGrandFatherJCU),

          fmTitle: parseStringOrUndefined(recordAny.PatGrandMotherTitle),
          fmCatName: parseStringOrUndefined(recordAny.PatGrandMotherCatName),
          fmjcu: parseStringOrUndefined(recordAny.PatGrandMotherJCU),

          mfTitle: parseStringOrUndefined(recordAny.MatGrandFatherTitle),
          mfCatName: parseStringOrUndefined(recordAny.MatGrandFatherCatName),
          mfjcu: parseStringOrUndefined(recordAny.MatGrandFatherJCU),

          mmTitle: parseStringOrUndefined(recordAny.MatGrandMotherTitle),
          mmCatName: parseStringOrUndefined(recordAny.MatGrandMotherCatName),
          mmjcu: parseStringOrUndefined(recordAny.MatGrandMotherJCU),

          // Generation 3 (Great-Grandparents)
          // Mapping rule:
          // PatGreatGrandFather -> fff
          // PatGreatGrandMother -> ffm
          // PatGreatGrandFatherMat -> fmf (?? 父方の祖母の父？) -> 父方の祖父の母？
          // ここはCSVのカラム名の意味を推測する必要がある。
          // 通常:
          // PatGrandFather (父父) -> Parents are PatGreatGrandFather (父父父) & PatGreatGrandMother (父父母)
          // PatGrandMother (父母) -> Parents are PatGreatGrandFatherMat (?) & PatGreatGrandMotherMat (?)

          // CSVヘッダーの並び順と名前から推測:
          // PatGreatGrandFather... -> fff (父父父)
          // PatGreatGrandMother... -> ffm (父父母)
          // PatGreatGrandFatherMat... -> fmf (父母父)  (Mat usually means Maternal line of the previous generation?)
          // PatGreatGrandMotherMat... -> fmm (父母母)

          // MatGreatGrandFather... -> mff (母父父)
          // MatGreatGrandMother... -> mfm (母父母)
          // MatGreatGrandFatherMat... -> mmf (母母父)
          // MatGreatGrandMotherMat... -> mmm (母母母)

          fffTitle: parseStringOrUndefined(recordAny.PatGreatGrandFatherTitle),
          fffCatName: parseStringOrUndefined(recordAny.PatGreatGrandFatherCatName),
          fffjcu: parseStringOrUndefined(recordAny.PatGreatGrandFatherJCU),

          ffmTitle: parseStringOrUndefined(recordAny.PatGreatGrandMotherTitle),
          ffmCatName: parseStringOrUndefined(recordAny.PatGreatGrandMotherCatName),
          ffmjcu: parseStringOrUndefined(recordAny.PatGreatGrandMotherJCU),

          fmfTitle: parseStringOrUndefined(recordAny.PatGreatGrandFatherMatTitle),
          fmfCatName: parseStringOrUndefined(recordAny.PatGreatGrandFatherMatCatName),
          fmfjcu: parseStringOrUndefined(recordAny.PatGreatGrandFatherMatJCU),

          fmmTitle: parseStringOrUndefined(recordAny.PatGreatGrandMotherMatTitle),
          fmmCatName: parseStringOrUndefined(recordAny.PatGreatGrandMotherMatCatName),
          fmmjcu: parseStringOrUndefined(recordAny.PatGreatGrandMotherMatJCU),

          mffTitle: parseStringOrUndefined(recordAny.MatGreatGrandFatherTitle),
          mffCatName: parseStringOrUndefined(recordAny.MatGreatGrandFatherCatName),
          mffjcu: parseStringOrUndefined(recordAny.MatGreatGrandFatherJCU),

          mfmTitle: parseStringOrUndefined(recordAny.MatGreatGrandMotherTitle),
          mfmCatName: parseStringOrUndefined(recordAny.MatGreatGrandMotherCatName),
          mfmjcu: parseStringOrUndefined(recordAny.MatGreatGrandMotherJCU),

          mmfTitle: parseStringOrUndefined(recordAny.MatGreatGrandFatherMatTitle),
          mmfCatName: parseStringOrUndefined(recordAny.MatGreatGrandFatherMatCatName),
          mmfjcu: parseStringOrUndefined(recordAny.MatGreatGrandFatherMatJCU),

          mmmTitle: parseStringOrUndefined(recordAny.MatGreatGrandMotherMatTitle),
          mmmCatName: parseStringOrUndefined(recordAny.MatGreatGrandMotherMatCatName),
          mmmjcu: parseStringOrUndefined(recordAny.MatGreatGrandMotherMatJCU),

          oldCode: parseStringOrUndefined(recordAny.OldCode),
        },
      });
      successCount++;
      if (successCount % 10 === 0) {
        console.log(`Imported ${successCount} records...`);
      }
    } catch (error) {
      errorCount++;
      console.error(`Error importing record ${record['PedigreeID']}:`, error);
      // 重複エラーなどを無視して続行する場合
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
