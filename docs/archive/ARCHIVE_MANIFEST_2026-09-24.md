# MyCats Pro アーカイブ台帳

作成日: 2026-09-24  
状態: **退役準備中 / 再現可能アーカイブ化**  
最終機能コード: `63ed3a6098a504ae4071fdb43305313fe55825ac`  
固定スナップショットブランチ: `archive/mycats-pro-final-2026-09-24`

## 1. 位置付け

MyCats Pro は、NEKOYA で最初に作成した統合型の猫舎管理アプリです。
後継の I HUB CATS 群へ主要な役割を移したため、今後は日常運用を目的とせず、
設計・実装・データモデル・業務ロジックを将来参照できるよう、再現可能な形で保存します。

本リポジトリは削除しません。
必要になった場合は、固定スナップショットとDBバックアップから当時の状態を復元できることを保存要件とします。

## 2. 最終構成スナップショット

### アプリケーション

- Frontend: Next.js 16 / React 19 / Mantine 8
- Backend: NestJS 10 / Prisma 6
- Package manager: pnpm
- Node.js: 20 系を推奨
- Backend port: 3004
- Frontend port: 3000

### 本番インフラ

- GCP project: `my-cats-pro`
- Region: `asia-northeast1`
- Cloud Run frontend: `mycats-pro-frontend`
- Cloud Run backend: `mycats-pro-backend`
- 旧 frontend URL: `https://nekoya.co.jp`
- Backend API: `https://api.nekoya.co.jp/api/v1`
- Database: Supabase PostgreSQL
- Supabase project: `my-cats-pro-DB`
- Supabase project ref: `zidrxszbqeipwtwgicin`
- 自動メール: Resend
- From: `noreply@nekoya.co.jp`
- Vercel mirror project: `my-cats-pro-frontend`

### 認証

Supabase Auth は使用していません。
NestJS 側の独自 JWT 認証を使用し、access/refresh token は HttpOnly Cookie と併用しています。

## 3. DBインベントリ

2026-09-24 時点の Supabase `public` schema の概数です。

| Table | Rows |
|---|---:|
| tenants | 0 |
| tenant_settings | 0 |
| invitation_tokens | 0 |
| users | 4 |
| display_preferences | 0 |
| login_attempts | 112 |
| breeds | 113 |
| coat_colors | 408 |
| genders | 4 |
| cats | 99 |
| breeding_records | 0 |
| breeding_ng_rules | 2 |
| breeding_schedules | 156 |
| mating_checks | 4 |
| pregnancy_checks | 15 |
| birth_plans | 18 |
| kitten_dispositions | 0 |
| care_records | 1 |
| weight_records | 0 |
| schedules | 1 |
| schedule_reminders | 0 |
| care_tags | 0 |
| schedule_tags | 0 |
| schedule_cats | 0 |
| medical_visit_types | 0 |
| medical_records | 4 |
| medical_record_attachments | 0 |
| medical_record_tags | 0 |
| tag_categories | 4 |
| tag_groups | 5 |
| tags | 6 |
| pedigrees | 6,580 |
| cat_tags | 236 |
| tag_automation_rules | 3 |
| tag_automation_runs | 466 |
| tag_assignment_history | 142 |
| staff | 12 |
| shift_templates | 0 |
| shifts | 1 |
| shift_tasks | 0 |
| staff_availabilities | 0 |
| shift_settings | 0 |
| graduations | 0 |
| gallery_entries | 8 |
| gallery_media | 18 |
| pedigree_print_settings | 0 |
| print_templates | 6 |
| _prisma_migrations | 41 |
| print_doc_categories | 8 |

## 4. 保存対象

必須:

- GitHub リポジトリ
- 固定スナップショットブランチ
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
- `pnpm-lock.yaml`
- DB外部バックアップ
- 復元手順書
- 必要環境変数の一覧

保存しないもの:

- APIキー本体
- DBパスワード
- JWTシークレット
- Resend APIキー
- GCPサービスアカウント秘密鍵

秘密値は、復元時に新規発行することを原則とします。

## 5. 退役時の原則

1. DB外部バックアップを取得するまで Supabase project を削除しない。
2. 復元確認が完了するまで Cloud Run / Load Balancer / DNS を先に消さない。
3. `nekoya.co.jp` の Resend 用 TXT/MX/DKIM を、受信用メール再編時に誤って削除しない。
4. MyCats Pro の常時稼働終了と、`nekoya.co.jp` の会社ドメイン再編は段階的に行う。
5. I HUB CATS 側で必要な未移管データ・業務ロジックがないか、停止前に最終確認する。

## 6. アーカイブ完了条件

- [x] 最終機能コードSHAを固定
- [x] 固定スナップショットブランチを作成
- [x] DBテーブル/件数を記録
- [x] 復元手順をリポジトリへ保存
- [ ] DB外部バックアップを取得
- [ ] クリーン環境から復元確認
- [ ] MyCats Pro の常時本番公開を停止
- [ ] `nekoya.co.jp` を会社サイト用に解放
- [ ] 不要インフラの停止・削除を確認
