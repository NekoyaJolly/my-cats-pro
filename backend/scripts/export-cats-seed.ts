// 在舎猫データをシードデータとしてエクスポートするスクリプト
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportCatsData() {
  console.log('🔄 在舎猫データをエクスポート中...');

  const outputFile = path.join(__dirname, '..', 'prisma', 'seed-cats-data.sql');
  const sqlStatements: string[] = [];

  // ヘッダー
  sqlStatements.push(`-- 在舎猫データのシードデータ (自動生成: ${new Date().toISOString()})`);
  sqlStatements.push(`-- このファイルは現在の在舎猫データから生成されました`);
  sqlStatements.push('');

  // 在舎猫データを取得
  const cats = await prisma.cat.findMany({
    where: { isInHouse: true },
    include: {
      breed: true,
      coatColor: true,
    },
    orderBy: { name: 'asc' },
  });

  console.log(`📦 ${cats.length}頭の在舎猫を発見`);

  // 品種データを収集
  const breeds = new Map();
  const coatColors = new Map();

  cats.forEach(cat => {
    if (cat.breed) breeds.set(cat.breed.id, cat.breed);
    if (cat.coatColor) coatColors.set(cat.coatColor.id, cat.coatColor);
  });

  // 品種データをエクスポート
  if (breeds.size > 0) {
    console.log(`🎨 ${breeds.size}品種をエクスポート`);
    sqlStatements.push('-- 品種データ');
    breeds.forEach(breed => {
      sqlStatements.push(
        `INSERT INTO "breeds" ("id", "name", "description", "createdAt", "updatedAt") VALUES (` +
        `'${breed.id}', '${escapeSql(breed.name)}', ` +
        `${breed.description ? `'${escapeSql(breed.description)}'` : 'NULL'}, ` +
        `'${breed.createdAt.toISOString()}', '${breed.updatedAt.toISOString()}') ` +
        `ON CONFLICT (id) DO NOTHING;`
      );
    });
    sqlStatements.push('');
  }

  // 毛色データをエクスポート
  if (coatColors.size > 0) {
    console.log(`🌈 ${coatColors.size}毛色をエクスポート`);
    sqlStatements.push('-- 毛色データ');
    coatColors.forEach(color => {
      sqlStatements.push(
        `INSERT INTO "coat_colors" ("id", "name", "description", "createdAt", "updatedAt") VALUES (` +
        `'${color.id}', '${escapeSql(color.name)}', ` +
        `${color.description ? `'${escapeSql(color.description)}'` : 'NULL'}, ` +
        `'${color.createdAt.toISOString()}', '${color.updatedAt.toISOString()}') ` +
        `ON CONFLICT (id) DO NOTHING;`
      );
    });
    sqlStatements.push('');
  }

  // 在舎猫データをエクスポート
  console.log(`🐱 ${cats.length}頭の在舎猫をエクスポート`);
  sqlStatements.push('-- 在舎猫データ');
  cats.forEach(cat => {
    sqlStatements.push(
      `INSERT INTO "cats" ("id", "name", "gender", "birthDate", "breedId", "coatColorId", ` +
      `"microchipNumber", "registrationNumber", "description", "isInHouse", ` +
      `"fatherId", "motherId", "createdAt", "updatedAt") VALUES (` +
      `'${cat.id}', '${escapeSql(cat.name)}', '${cat.gender}', '${cat.birthDate.toISOString()}', ` +
      `${cat.breedId ? `'${cat.breedId}'` : 'NULL'}, ` +
      `${cat.coatColorId ? `'${cat.coatColorId}'` : 'NULL'}, ` +
      `${cat.microchipNumber ? `'${escapeSql(cat.microchipNumber)}'` : 'NULL'}, ` +
      `${cat.registrationNumber ? `'${escapeSql(cat.registrationNumber)}'` : 'NULL'}, ` +
      `${cat.description ? `'${escapeSql(cat.description)}'` : 'NULL'}, ` +
      `${cat.isInHouse}, ` +
      `${cat.fatherId ? `'${cat.fatherId}'` : 'NULL'}, ` +
      `${cat.motherId ? `'${cat.motherId}'` : 'NULL'}, ` +
      `'${cat.createdAt.toISOString()}', '${cat.updatedAt.toISOString()}') ` +
      `ON CONFLICT (id) DO NOTHING;`
    );
  });

  // ファイルに書き込み
  fs.writeFileSync(outputFile, sqlStatements.join('\n'), 'utf8');

  console.log('');
  console.log(`✅ シードデータのエクスポートが完了しました: ${outputFile}`);
  console.log('');
  console.log('📝 次のステップ:');
  console.log('   1. backend/prisma/seed-cats-data.sql を確認');
  console.log('   2. database/init/02-seed-cats.sql にコピー:');
  console.log('      Copy-Item backend\\prisma\\seed-cats-data.sql database\\init\\02-seed-cats.sql');
  console.log('   3. Gitにコミット&プッシュ');
}

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

exportCatsData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
