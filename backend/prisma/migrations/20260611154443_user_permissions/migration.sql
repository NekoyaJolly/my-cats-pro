-- AlterTable
ALTER TABLE "users" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 既存ユーザーへのバックフィル: ロールプリセットを permissions に展開する
-- （src/auth/permissions.ts の ROLE_PRESETS と同期。SUPER_ADMIN はガードで常にバイパスされるが、UI表示の一貫性のため全権限を設定）
UPDATE "users" SET "permissions" = ARRAY[
  'cats:write','breeding:write','care:write','medical:write','tags:manage','pedigree:write',
  'gallery:write','staff:manage','graduation:write','data:import_export','users:manage','tenants:manage','settings:manage'
] WHERE "role" = 'SUPER_ADMIN';

UPDATE "users" SET "permissions" = ARRAY[
  'cats:write','breeding:write','care:write','medical:write','tags:manage','pedigree:write',
  'gallery:write','staff:manage','graduation:write','data:import_export','users:manage','settings:manage'
] WHERE "role" = 'TENANT_ADMIN';

UPDATE "users" SET "permissions" = ARRAY[
  'cats:write','breeding:write','care:write','medical:write','tags:manage','pedigree:write',
  'gallery:write','staff:manage','graduation:write','data:import_export','settings:manage'
] WHERE "role" = 'ADMIN';

UPDATE "users" SET "permissions" = ARRAY[
  'cats:write','care:write','medical:write','breeding:write'
] WHERE "role" = 'USER';
