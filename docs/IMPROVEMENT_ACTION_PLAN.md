# MyCats Pro - 改善実装アクションプラン（Week 47 更新）

**初版:** 2025-11-11  
**最終更新:** 2025-11-18  
**目的:** コードレビュー指摘を最新実装状況と照合し、優先度・担当・期限を明示する。PWA 公開と医療/血統系機能の品質確保に必要なタスクを段階的に完了させる。

---

- ✅ **基盤タスク完了:** マスターデータ seed/同期、UI Combobox 改修は 11/17 完了。Lint/Build/Test もグリーン。
- 🚧 **公開条件アップデート:** H1（レート制限）は Guard/テストまで完了済み。現在は H2 の DB 最適化（索引用マイグレーション + verify SQL + N+1 解消）を進行中。
- 🎯 **今週(Week47) ゴール:** CSRF ミドルウェアとフロント実装、ENV バリデーションとシークレット生成導入。H1 の仕様固めまで実施。
- 🔜 **Week48-49:** DB パフォーマンス (H2) + 型安全性 (H3) を並行。Pedigree/Medical 型同期と API チューニングを含む。
- 📅 **Week50 以降:** アクセシビリティ (M1)、テスト強化 (M2)、パフォーマンス/Docs (M3/L1/L2) を段階実施。

---

## 1. 進捗サマリ
| 領域 | 状態 | メモ |
| --- | --- | --- |
| セキュリティ Phase1 (C1/C2/H1) | 🟢 Done | CSRF/ENV + H1（レート制限）まで実装完了。|
| データ品質 / マスタ同期 | 🟢 Done | Seed/同期スクリプト整備済み。Combobox も最新マスタに連動。|
| フロント UX 基盤 | 🟡 Partial | Combobox 改修済。フォーム型安全化やアクセシビリティは未着手。|
| Pedigree / Medical | 🟡 Partial | UI は稼働。API 型同期と印刷/レポート機能は未着手。|
| PWA / モバイル対応 | 🟥 Blocked | Manifestのみ。Service Worker, Offline, HTTPS 条件は Phase1 後。|
| QA / Docs / Monitoring | 🔶 Planned | Week50 以降に集中投入予定。|

---

## 2. 完了済みタスク（最新 2 週間）
| 日付 | タスク | 成果 |
| --- | --- | --- |
| 2025-11-15 | Prisma Seed/マスタ同期を cron 化 | 新規環境で猫種・毛色マスタが自動投入。DB 差分事故を防止。|
| 2025-11-17 | Combobox UX 改修 | 空レコード除外、検索レスポンス改善。|
| 2025-11-17 | Frontend lint/build/test 実行 | 既存変更に対する品質ゲート通過を確認。|
| 進行中 | Medical Records UI 実装 | React Query 化済。API 型とのズレ解消が残タスク。|

---

## 3. 優先度別タスク（ステータス付き）

### 🔴 CRITICAL（Week47 完了必須）
| ID | ゴール | 所要時間 | Owner | 状態 | 次アクション |
| --- | --- | --- | --- | --- | --- |
| C1 | CSRF 保護（サーバー + クライアント + E2E）| 4h | Backend/Frontend | 🟢 Done | `csurf` 導入、`/csrf-token` GET、`apiClient` 自動添付、E2E を 2025-11-18 に完了。|
| C2 | ENV バリデーション + シークレット管理 | 8h | DevOps/Backend | 🟢 Done | `validateEnv()` + `.env.example` 最小化 + `scripts/generate-secrets.ts` を 2025-11-18 に完了。|

### 🟠 HIGH（Week48-49 で並行）
| ID | ゴール | 所要時間 | Owner | 状態 | 備考 |
| --- | --- | --- | --- | --- | --- |
| H1 | API レート制限強化（エンドポイント別）| 4h | Backend | 🟢 Done | Enhanced Guard + Decorator + integration test を 11/18 に完了。|
| H2 | DB インデックス/N+1 最適化 | 4h | Backend | 🟡 In Progress | Prisma インデックス追加 + `verify-indexes.sql` + Cats/Pedigree include 整備を実装済み。|
| H3 | Front 型安全性（ESLint+Zod+RHF）| 16h | Frontend | 未着手 | Cats フォーム→Medical へ段階移行。|

### 🟡 MEDIUM（Week49-50 予定）
| ID | ゴール | 所要時間 | Owner | 状態 |
| --- | --- | --- | --- | --- |
| M1 | アクセシビリティ改善 (WCAG 2.1 AA) | 32h | Frontend | 未着手 |
| M2 | テストカバレッジ 70% | 64h | All | 未着手 |
| M3 | パフォーマンス最適化 | 32h | All | 未着手 |

### 🟢 LOW（12月後半〜）

| ID | ゴール | 所要時間 | Owner | 状態 |
| --- | --- | --- | --- | --- |
| L1 | Docs 拡充（API 使用例, 運用手順）| 16h | All | 未着手 |
| L2 | 監視/ロギング強化 | 16h | DevOps | 未着手 |

---


## 4. フェーズ別ロードマップ（最新版）

### Phase 0: Foundation（完了）

- Prisma Seed/マスタ同期、自動 combobox リロード。
- Frontend lint/build/test のヘルスチェック。

### Phase 1: Security Hardening（Week47-48）

| Deliverable | 内容 | Owner | 期日 |
| --- | --- | --- | --- |
| CSRF Middleware & `/csrf-token` | `csurf` + cookie 設定、GET エンドポイントとE2E（✅ 2025-11-18 完了） | Backend | Week47 |
| CSRF Token Client | `frontend/src/lib/api/csrf.ts` と `apiClient` で自動添付（✅ 2025-11-18 完了） | Frontend | Week47 |
| ENV Validation | `validateEnv()` を ConfigModule 起動前に適用（✅ 2025-11-18 完了） | Backend | Week47 |
| Secret Generator Script | `scripts/generate-secrets.ts` + README 追記（✅ 2025-11-18 完了） | DevOps | Week48 |

### Phase 2: API & Data Optimization（Week48-49）

- H1 レート制限: Auth API を最優先。429 レスポンス仕様を整備。
- H2 DB 最適化: Prisma schema インデックス + `EXPLAIN ANALYZE` で検証。Pedigree/Medical API 型同期も同フェーズで完了。

### Phase 3: Frontend Quality（Week49-50）

- H3 型安全性: ESLint ルール厳格化 → Zod/RHF でフォームリファクタ。
- M1 アクセシビリティ: `AppLayout`, `CatForm`, `MedicalRecords` の3画面を axe 監査で PASS させる。

### Phase 4: Reliability & Docs（Week50-52）

- M2/M3: Jest/Playwright/E2E で 70% カバレッジ、パフォーマンス計測。
- L1/L2: README/SETUP/SECURITY の改訂、監視・ログ集約の導入。

---

## 5. 依存関係 & タイムライン

```text
Week 47  : [C1][C2]
Week 48  : [H1][H2]-----
Week 49  :     [H3]--------
Week 50  :           [M1]------
Week 51+ :                [M2]----------
Week 52+ :                       [M3][L1][L2]
```

- **PWA 対応**は `C1 + C2 + H1` が揃うまで着手禁止。
- **Medical / Pedigree API 調整**は H2 と同スプリントで進め、DB最適化とセットで回帰テスト。

---

## 6. 詳細タスクブレークダウン

### C1: CSRF 保護

- [x] `backend/src/main.ts` に `csurf` ミドルウェアを追加（cookie 設定: `httpOnly`, `sameSite=strict`, `secure=prod`）。
- [x] `/api/v1/csrf-token` GET を追加し、token を JSON 返却。
- [x] `frontend/src/lib/api/csrf.ts` を新設し、token キャッシュ・再取得ロジックを実装。
- [x] `apiClient` の POST/PUT/PATCH/DELETE リクエストで `X-CSRF-Token` を自動添付。
- [x] 403 応答のメッセージを日本語化し、E2E テスト（トークン有/無）を backend/test に追加。

### C2: 環境変数 & シークレット

- [x] `backend/src/common/config/env.validation.ts` に Zod スキーマを定義し、ConfigModule の `validate` で適用。
- [x] `.env.example` を最小構成に更新（実値を空にし説明コメントのみ）。
- [x] `scripts/generate-secrets.ts` を追加して 32+ 文字のランダム値を生成。
- [x] `SETUP_GUIDE.md` と `README.md` に使用方法を追記。

### H1: レート制限

1. `RateLimit` デコレータと `EnhancedThrottlerGuard` を作成。
2. Auth API（login/register/refresh/forgot-password）へ適用し、429 JSON を統一フォーマットに。
3. `/health` 等のヘルスチェックはスキップ条件に追加。
4. `pnpm backend:test:e2e` に RateLimit テストを追加。

### H2: DB 最適化

1. Prisma schema に必要なインデックスを追加し `pnpm prisma migrate dev --name add_performance_indexes` 実行。
2. `prisma/seed/verify-indexes.sql` を作成し、CI で EXPLAIN をログ出力。
3. Pedigree/Cats API の N+1 を `include/select` で解消し、API 応答型を再利用。

### H3: 型安全性

1. Frontend ESLint を厳格設定（`no-explicit-any`, `no-non-null-assertion` など）。
2. `src/lib/schemas` に Zod 定義を移設、`react-hook-form` と `zodResolver` を組み合わせ。
3. Cats フォームを先行リファクタし、Medical/Pedigree へ波及。

---

## 7. チェックリスト

- [x] C1: CSRF ミドルウェア + `/csrf-token` + E2E.
- [x] C1: Front `apiClient` で `X-CSRF-Token` 自動添付。
- [x] C2: `validateEnv` 実装、`.env.example` 更新、`generate-secrets` 追加。
- [x] H1: Auth API 用レート制限 + 429 メッセージ整備。
- [x] H2: Prisma インデックス追加、N+1 解消、EXPLAIN で効果検証。
- [ ] H3: ESLint ルール厳格化、Zod/RHF 導入、Cats フォーム更新。
- [ ] M1: `AppLayout`/`CatForm`/`MedicalRecords` の axe PASS。
- [ ] M2: Backend/Frontend の Jest カバレッジ 70% 設定と達成。
- [ ] L1: README/SETUP/SECURITY の更新と秘密情報の排除。

---

## 8. 運用ルール

- 本ドキュメントは **タスク完了後速やかに更新**。
- ステータス変更・期限変更があれば当日中に反映。
- 進捗報告フォーマット: `ID / 状態 / ブロッカー / 次アクション / 予定完了日` をユーザーに報告

---

_このアクションプランは Security Phase1 完了まで DAILY で確認する。各タスク完了時は該当 PR とテスト結果を添えてドキュメントを更新すること。_
