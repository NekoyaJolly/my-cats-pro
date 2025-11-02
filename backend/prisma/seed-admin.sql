-- 管理者ユーザーの作成（Passw0rd!）
INSERT INTO "users" (
  "id",
  "clerk_id",
  "email",
  "password_hash",
  "role",
  "first_name",
  "last_name",
  "created_at",
  "updated_at"
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'local_admin_001',
  'admin@example.com',
  '$argon2id$v=19$m=65536,t=3,p=4$g7EcC8gFxc8iRStAz0GnQA$9B/pdSQ1lVCIVlww5X001ajQGOY4jFMxngLjMX4hbLw',
  'ADMIN',
  'Admin',
  'User',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE
SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  updated_at = CURRENT_TIMESTAMP;
