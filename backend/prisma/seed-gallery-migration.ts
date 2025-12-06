/**
 * Graduation → GalleryEntry マイグレーションスクリプト
 *
 * 既存の Graduation レコードを GalleryEntry に移行します。
 *
 * 実行方法:
 *   cd backend
 *   pnpm ts-node prisma/seed-gallery-migration.ts
 */
import { PrismaClient, GalleryCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface CatSnapshot {
  name?: string;
  gender?: string;
  coatColor?: { name?: string };
  breed?: { name?: string };
}

async function migrateGraduationsToGallery(): Promise<void> {
  console.log('Graduation → GalleryEntry マイグレーション開始...');

  const graduations = await prisma.graduation.findMany({
    include: {
      cat: true,
    },
  });

  console.log(`${graduations.length}件のGraduationを移行します`);

  let migrated = 0;
  let skipped = 0;

  for (const grad of graduations) {
    // 既存チェック（同じ catId と category の組み合わせ）
    const existing = await prisma.galleryEntry.findFirst({
      where: {
        catId: grad.catId,
        category: GalleryCategory.GRADUATION,
      },
    });

    if (existing) {
      console.log(`スキップ: ${grad.id} (既に存在)`);
      skipped++;
      continue;
    }

    const snapshot = grad.catSnapshot as CatSnapshot | null;

    await prisma.galleryEntry.create({
      data: {
        category: GalleryCategory.GRADUATION,
        name: snapshot?.name ?? grad.cat?.name ?? 'Unknown',
        gender: snapshot?.gender ?? grad.cat?.gender ?? 'MALE',
        coatColor: snapshot?.coatColor?.name ?? null,
        breed: snapshot?.breed?.name ?? null,
        catId: grad.catId,
        transferDate: grad.transferDate,
        destination: grad.destination,
        transferredBy: grad.transferredBy,
        catSnapshot: grad.catSnapshot,
        notes: grad.notes,
        createdAt: grad.createdAt,
        updatedAt: grad.updatedAt,
      },
    });

    console.log(`移行完了: ${grad.id} → ${snapshot?.name ?? grad.cat?.name ?? 'Unknown'}`);
    migrated++;
  }

  console.log('');
  console.log('=== マイグレーション完了 ===');
  console.log(`移行: ${migrated}件`);
  console.log(`スキップ: ${skipped}件`);
}

migrateGraduationsToGallery()
  .catch((error: unknown) => {
    console.error('マイグレーションエラー:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
