# 本番運用アプリケーション全体検証レポート（2026-06-11）

## 概要

本番運用中の mycats-pro について、隔離環境（ローカル PostgreSQL 15 + シードデータ）でアプリケーションを実際に起動し、UIから遷移できる全ページの CRUD 操作と重点機能（タグ自動運用 / ケアスケジュール / スタッフシフト / 交配記録）を API レベル・UI レベルの両面から検証した。**本レポートは検証結果と修正候補の提示のみであり、アプリケーションコードの修正は行っていない。**

### 検証方法

| 項目 | 内容 |
|---|---|
| 環境 | リモートコンテナ内 Docker PostgreSQL 15（port 5433）+ `pnpm db:migrate` + シード投入。**本番 DB（Supabase）には一切接続していない** |
| API 検証 | シード管理者（admin@example.com / ADMIN ロール）でログインし、全リソースの作成→取得→更新→削除を実データで一巡 |
| UI 検証 | ヘッドレス Chrome（CDP 接続の Playwright）でログイン後、全 16 ルートを巡回しコンソールエラー・失敗 API を収集 |
| 自動テスト | backend e2e 全 14 スイート、frontend 単体テスト 9 スイートを実行しベースライン取得 |
| コード調査 | 不具合の原因箇所をソースまで遡って特定（ファイルパス・行番号付き） |

### 結果サマリ

- **全 16 ページのレンダリング自体は正常**（404・クラッシュなし）。基本的な CRUD は大半のリソースで動作する。
- 一方で、**重大не具合 5 件・高 8 件・中 8 件**を確認。特に「タグの自動運用」は**実質的に全経路が機能していない**こと、**開発環境でバックエンドが起動不能**であることが判明した。
- frontend 単体テスト: 27 件 全パス。backend e2e: 14 スイート中 4 スイート失敗（大半はテスト側の仕様乖離。詳細は §5）。

---

## 1. 重大（CRITICAL）— データ消失・機能不全・開発不能

### C-1. 開発環境でバックエンドが起動不能（しかもエラーが一切出ない）

- **症状**: `pnpm dev` でバックエンドが「Starting Cat Management System API...」のログを最後に**無言で死ぬ**。ポート 3004 は開かない。エラーログなし。
- **原因（2段階）**:
  1. `@nestjs/swagger@7.4.2` が Swagger ドキュメント生成時（`backend/src/main.ts:273-283`、`NODE_ENV !== "production"` のときのみ実行）に `pathToRegexp.parse is not a function` の TypeError を投げる。Express 5 / path-to-regexp v8 系と @nestjs/swagger 7.x の非互換（`app.module.ts:81-83` のコメントにある既知の問題系と同根）。
  2. その例外を `main.ts:309-311` の catch が `logger.error` → `process.exit(1)` するが、`bufferLogs: true` + pino の worker transport が flush される前にプロセスが死ぬため、**エラーが標準出力に一切出ない**。
- **影響**: 本番（`NODE_ENV=production`）は Swagger 生成をスキップするため発症しないが、**開発・検証・Swagger ドキュメント（/api/docs）が全滅**。今回の検証は dist の Swagger 部分を一時的に無効化して実施した。
- **修正方針案**:
  - `@nestjs/swagger` を Express 5 対応バージョン（v8 系 / NestJS 11 系列）へ更新するか、`SwaggerModule.createDocument` を try-catch で包んで失敗時は警告ログのみで起動継続にする（工数: 小〜中）。
  - 併せて `main.ts` の catch で `process.exit` 前に `Logger.flush()` 相当（または `console.error(error)` のフォールバック）を入れ、起動失敗が必ず可視化されるようにする（工数: 小）。

### C-2. タグの自動運用が実質全経路で機能していない

ユーザー指摘の「タグの自動運用」を重点検証した結果、**UI から作成できるルールが動作する経路が存在しない**ことを確認した。

| ルール種別（UIで作成可能） | 実挙動 | 原因 |
|---|---|---|
| PAGE_ACTION | **動作しない** | `tag.automation.page.action` イベントの発火箇所がバックエンド・フロントエンドのどこにも存在しない（grep で全件確認）。発火されるイベントは `cats.service.ts:144` の KITTEN_REGISTERED **1箇所のみ** |
| AGE_THRESHOLD | **動作しない** | 毎日0時の cron（`age-threshold-checker.service.ts`）は config に `{kitten:{minDays,maxDays}, adult:{minMonths,maxMonths}}` を要求するが、UI（`frontend/src/app/tags/page.tsx:717-729`）は `{ageType,threshold,tagIds,actionType}` を保存する。**スキーマ不整合により `shouldTriggerRule` が常に false** |
| TAG_ASSIGNED | **動作しない** | イベント発火箇所ゼロ。さらに手動実行 API（`tag-automation.controller.ts` の execute）の switch に TAG_ASSIGNED の case がなく `{"success":false,"message":"Unsupported event type"}` を **HTTP 200** で返すため、UI 上はエラーにすら見えない |
| （UI作成不可）KITTEN_REGISTERED | ✅ 唯一動作 | 母猫付き子猫登録で発火し、子猫・母猫・父猫にタグ付与されることを実機確認（タグ3件付与・実行履歴記録 OK） |

- **「今すぐ実行」ボタンも機能しない**: フロントは空ペイロードで execute を呼ぶが（`tags/page.tsx:704-712`）、コントローラはダミー値（`catId:"test-cat-id"` 等）でイベントを合成するため、実猫が対象にならず常に「Assigned 0 tags」になる（実機ログで確認）。
- **修正方針案**（工数: 中〜大。優先度順）:
  1. AGE_THRESHOLD: cron の `shouldTriggerRule` を UI の config 形式（`ageType`/`threshold`）に対応させる（チェッカー側の修正のみで開通。工数: 小）。
  2. PAGE_ACTION: 猫作成/更新等の Service に `eventEmitter.emit(PAGE_ACTION, {...})` を追加（KITTEN_REGISTERED と同じパターンを横展開。工数: 中）。
  3. TAG_ASSIGNED: `tags.service` のタグ付与処理でイベント発火 + execute switch に case 追加（工数: 小〜中）。
  4. execute エンドポイントは「ルールの対象猫を実データから解決して即時適用」する仕様に変更（テストイベント合成をやめる。工数: 中）。

### C-3. 関連データを持つ猫の削除が 500 エラー（既存データの削除が不可）

- **症状**: ケア履歴・医療記録等を持つ猫を `DELETE /api/v1/cats/:id` すると **500 Internal Server Error**（日本語メッセージなし）。実機で再現確認済み（`Foreign key constraint violated: care_records_cat_id_fkey`）。
- **原因**: `cats.service.ts:392-409` の `remove()` は kittenDisposition しか事前削除せず、Prisma スキーマの Cat 関連（CareRecord / MedicalRecord / BreedingRecord / PregnancyCheck / BirthPlan / motherId・fatherId 参照等）は大半が `onDelete` 未指定（= Restrict）のため FK violation で落ちる。P2003 のハンドリングもない。
- **影響**: **一度でもケア完了・医療記録登録・交配記録を持った猫は UI から削除できない**。運用上「既存データの削除が間違いなくできるか」という要件に対する最大の障害。
- **修正方針案**: 削除ポリシーを決めた上で、(a) 関連データをトランザクション内でカスケード削除（または論理削除へ転換）、(b) 残す場合は P2003 を捕捉して「ケア履歴があるため削除できません。先に〜」という日本語 `BadRequestException` を返す（工数: 中。論理削除化なら大）。

### C-4. 配種スケジュールが DB に保存されない（交配記録ページ）

- **症状**: 交配管理ページで作成した配種スケジュールはサーバーに送信されず、`GET /breeding/schedules` は常に空。localStorage 保存のみのため、**別端末・別ブラウザ・キャッシュクリアで消失し、複数ユーザー間でも共有されない**（同一ブラウザのリロードでは localStorage により残るため気づきにくい）。
- **原因**: バックエンドには `BreedingSchedule` モデルと `/api/v1/breeding/schedules` の CRUD API が**完備**されており、フロントにも API フック（`use-breeding.ts:783-`）と同期関数（`useBreedingSchedule.ts:302-348` の `createScheduleOnServer` 等）が**実装済み**。しかし `breeding/page.tsx` がこれらを**一切呼んでいない**（`setBreedingSchedule` でローカル更新のみ。`page.tsx:514` 付近）。サーバー→ローカルの読込側（`useBreedingSchedule.ts:190-217`）は配線済みなので、書き込み側の配線漏れ。
- **修正方針案**: `page.tsx` のスケジュール登録/成功・失敗確定/削除ハンドラから `createScheduleOnServer` / `updateScheduleOnServer` / `deleteScheduleOnServer` を呼ぶだけで開通する。**新規 API・スキーマ変更は不要**（工数: 小〜中）。

### C-5. 医療記録の詳細取得・更新・削除 API が未実装（既存データの修正・削除が不可）

- **症状**: `GET/PATCH/DELETE /api/v1/care/medical-records/:id` がいずれも 404（実機確認済み）。一覧と作成のみ存在（`care.controller.ts`）。
- **影響**: 医療データページで既存記録の修正・削除が構造的に不可能。
- **修正方針案**: Prisma モデル（MedicalRecord + 添付・タグの Cascade 設定済み）はあるため、Controller/Service に 3 エンドポイントを追加し、フロント `use-care.ts` に update/delete フックを追加（工数: 小〜中）。

---

## 2. 高（HIGH）— 運用上の明確な制約

### H-1. 出産詳細登録ハンドラが空実装
`frontend/src/app/breeding/page.tsx:946-948` の `onDetailSubmit` が `// 詳細登録ハンドラー（実装中）` のまま空。出産記録モーダルの詳細登録ボタンは押しても何も起きない。
**修正案**: 簡易登録 `handleBirthInfoSubmit` と同様に `useUpdateBirthPlan` / `useCreateCat`（子猫詳細付き）を呼ぶ実装を追加（工数: 中）。

### H-2. NGペアルールがバックエンドで強制されない
ルールの定義 CRUD は動作するが、交配記録・配種スケジュール作成時の照合ロジックが `breeding.service.ts` に存在しない（NG ペアで `POST /breeding` しても素通し）。フロントは `window.confirm` の警告のみで**強行可能**（`breeding/page.tsx:460-471`）。
**修正案**: `create`/`createBreedingSchedule` 内で NG ルール（TAG_COMBINATION / INDIVIDUAL_PROHIBITION / GENERATION_LIMIT）を照合し、違反時は日本語 `BadRequestException`。強行を許す運用なら `force` フラグを設ける（工数: 中）。

### H-3. ケアスケジュールのステータス切替 Switch が disabled 固定
`care/page.tsx:702-708`。有効/無効の表示だけで変更不可。バックエンドの `PATCH /care/schedules/:id` は status 変更を受け付けるため、フロントの配線のみで解決（工数: 小）。

### H-4. 卒業記録（Graduation）の更新 API がない
`PATCH /graduations/:id` は 404（実機確認）。卒業日・譲渡先の入力ミスは削除→再作成しか手段がない。**修正案**: PATCH エンドポイント追加（工数: 小）。

### H-5. ADMIN ロールでユーザー設定ページが全面 403
`GET /tenants` は SUPER_ADMIN 専用、`GET /users` は SUPER_ADMIN / TENANT_ADMIN 専用（RoleGuard ログで確認）。シードで作られる管理者は **ADMIN** ロールのため、`/tenants`（ユーザー設定）ページの API が全て 403 になる。ロール体系（ADMIN と TENANT_ADMIN の関係）の設計矛盾。
**修正案**: ロール要件の見直し（ADMIN を許可するか、シード/運用ユーザーを TENANT_ADMIN にする）+ フロントでの権限不足時の日本語案内（工数: 小〜中）。

### H-6. テナント未所属ユーザーでタグ管理ページが常時 400 を出す
`GET /tenant-settings/tag-color-defaults` は `user.tenantId` が null だと「テナント情報が不足しています」の 400（`tenant-settings.controller.ts:54-56`）。シード管理者は tenantId=null のため、/tags ページを開くたびに 400 が発生し、タグ色デフォルト設定も保存不可。
**修正案**: tenantId 未設定時はデフォルト値を 200 で返す、またはユーザーへのテナント割当を必須化（工数: 小）。

### H-7. error.tsx / global-error.tsx が一つも存在しない
`frontend/src/app` 配下に error boundary が 0 件（find で確認）。レンダリングエラー時は Next.js の素のエラー画面になる。loading.tsx も 16 ルート中 9 のみ（export / import / print-templates / tenants / more / staff/shifts 等が欠如）。
**修正案**: ルートに `global-error.tsx` + 主要セグメントに日本語の `error.tsx` を配置（工数: 小）。

### H-8. 論理削除済みスタッフと同じメールアドレスで再登録すると 500
`POST /staff` で email 重複（論理削除済み含む）時に Prisma P2002 が未ハンドリングで 500（実機確認）。「退職→再雇用」で詰まる。
**修正案**: P2002 捕捉で日本語 409/400 を返し、論理削除済みなら復元を案内（工数: 小）。

---

## 3. 中（MEDIUM）

| # | 内容 | 根拠 / 修正案 |
|---|---|---|
| M-1 | `GET /cats/genders` がルート定義順の問題で常に 400（`@Get("genders")` が `@Get(":id")` より後: `cats.controller.ts:155/252`）。フロントは `/master/genders` を使うため実害は顕在化していないがデッドルート | `genders` を `:id` より前へ移動 or 削除 |
| M-2 | `pnpm test:e2e` をローカルで実行すると、`.env.test` は testdb を指すのに Prisma が `backend/.env` の `DIRECT_URL`（開発DB）を拾い、**開発DBが `migrate reset` の対象になる**（CI では DIRECT_URL を上書きしているため顕在化しない） | `.env.test` に DIRECT_URL を明記する |
| M-3 | ShiftTemplate / ShiftTask は Prisma モデルだけ存在し API ゼロ（デッドモデル）。シフトのテンプレート入力は実際には Staff.workTimeTemplate / workingDays で実現されており動作する | モデル削除 or 将来仕様の明確化 |
| M-4 | 品種マスタに `code:0, name:""` の空レコードがあり（`breed-master.data.ts:13`）、品種選択肢の先頭に空項目が出る。猫詳細のレスポンスでも `breed.name=""` になる | マスタから除外 or UI でフィルタ |
| M-5 | ギャラリー作成 DTO の `@IsEnum(['MALE',...])` は配列を渡す誤用（`create-gallery-entry.dto.ts:69`）で、バリデーションエラーが「gender must be one of the following values: 」と**空のまま**返る | `@IsIn([...])` に変更 |
| M-6 | UI「今すぐ実行」失敗時も HTTP 200 のため通知が成功扱いになり得る（C-2 と同根） | C-2 の修正に含める |
| M-7 | /cats ページでコンソール警告 `Unsupported style property &::-webkit-scrollbar`（インラインスタイルへの擬似要素指定。プロジェクト規約のインラインスタイル禁止にも抵触） | Mantine styles API / CSS Modules へ移行 |
| M-8 | タグ自動化ルールの priority フィールドは保存されるが実行順制御に未使用 | 仕様確定後に対応（低優先） |

---

## 4. 動作確認済み（正常）

以下は追加→一覧→（詳細）→更新→削除の一巡を実データで確認し、問題なし:

- **猫**: CRUD ＋ タブ統計（/cats/statistics）＋ 子猫一覧（/cats/kittens）
- **体重記録**: CRUD（個別・取得・更新・削除）
- **ケアスケジュール**: CRUD ＋ 完了処理 ＋ **RRULE（FREQ=MONTHLY）完了時の次回スケジュール自動生成**（完了後に PENDING の新スケジュールが生成されることを確認）
- **医療記録**: 作成・一覧（更新・削除は C-5 のとおり API 自体がない）
- **タグ**: カテゴリ→グループ→タグの3階層 CRUD、猫への付与/剥奪、付与中タグの削除時も猫側は正しくクリーンアップ（Cascade 動作確認）
- **タグ自動化**: KITTEN_REGISTERED 経路のみ実動作（子猫・母猫・父猫へ自動付与、実行履歴記録）
- **スタッフ**: CRUD ＋ 論理削除/復元、シフト: CRUD ＋ カレンダー取得（startDate/endDate）
- **交配記録**: 配種スケジュール API・配種チェック・妊娠確認・出産予定・子猫処遇の各 CRUD、出産完了処理、**出産予定の削除保護**（子猫処遇が残っている場合は日本語エラーで正しく拒否）
- **血統書**: CRUD（作成・更新・削除）
- **エクスポート**: `POST /export {dataType, format}` で CSV 本文が正しく返る
- **認証**: ログイン / トークンリフレッシュ / 保護エンドポイントの 401
- **UI**: 全 16 ルートのレンダリング（ログイン後巡回、クラッシュ・404 なし）
- **frontend 単体テスト**: 9 スイート 27 件 全パス

---

## 5. 自動テスト基盤の課題（backend e2e: 4/14 スイート失敗）

| スイート | 失敗 | 原因分類 |
|---|---|---|
| pedigree.e2e-spec.ts | 9/10 | **テストが未認証アクセスで 200 を期待**しており現行の JWT 必須仕様と乖離（製品バグではなくテスト未整備） |
| export.e2e-spec.ts | 5/7 | テストは 200 + `Content-Disposition: attachment` を期待、実装は 201 + ヘッダなしで CSV 本文を返す（機能自体は動作。どちらに合わせるか要決定） |
| auth-jwt.e2e-spec.ts | 2/17 | Helmet / CORS ヘッダは `main.ts` でのみ設定されるため、TestingModule 起動のテストでは付与されない（テスト構成の問題） |
| auth-seed-user.e2e-spec.ts | 1〜2/3 | シード投入前提のテスト。シード後も CSRF 関連 1 件が不安定 |

加えてカバレッジ欠落: 交配スケジュール/配種チェック・子猫処遇・シフト・タグ自動化・AGE_THRESHOLD cron に e2e テストが存在しない。

---

## 6. 修正ロードマップ（推奨順）

1. **C-1 起動不能の解消 + エラー可視化**（他の全修正の前提。開発環境が直らないと検証もできない）
2. **C-3 猫削除の 500**（データ運用の根幹。削除ポリシー決定が必要）
3. **C-5 医療記録 update/delete API 追加** ＋ H-4 卒業 PATCH（小工数で「既存データの修正・削除」要件を回復）
4. **C-4 配種スケジュールのサーバー同期配線** ＋ H-1 出産詳細登録（交配ページの機能完成）
5. **C-2 タグ自動運用の開通**（まず AGE_THRESHOLD の config 不整合解消 → PAGE_ACTION / TAG_ASSIGNED のイベント発火実装）
6. **H-2 NGルールのバックエンド強制**、H-3 ケア Switch、H-5/H-6 ロール・テナント設計の整理
7. H-7 error.tsx / loading.tsx、H-8 ほか M 項目、e2e テストの仕様追従と未カバー領域の追加

---

## 付記

- 検証中に作成したデータはすべてローカル検証 DB 内のみ。本番環境・本番 DB への変更は一切ない。
- 検証環境の制約: Swagger 起動不能の回避（dist の一時パッチ、未コミット）、Playwright ブラウザは CDN 遮断のため CDP 接続のヘッドレス Chrome を使用。
- `lodash@4.18.1` が依存に含まれる。4.17.21 以降の新系列のため、念のためサプライチェーン観点でリリース元の確認を推奨（未検証・参考情報）。
