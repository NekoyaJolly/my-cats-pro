# backend/AGENTS ガイドライン

## 0. 目的と適用範囲

- 本書は `backend/` ディレクトリで動作する NestJS 10 + Prisma 6 + PostgreSQL 15 向けの専用運用ガイドです。
- ルート `AGENTS.md` の共通規約に **追加要件** を与えるものです。競合した場合は本書の記述を優先しつつ、差分理由を PR で明示してください。
- 対象読者: API / バッチ / Prisma スキーマを改修するエンジニア。

---

## 1. クイックリファレンス

### 1-1. セットアップ & 実行

- 依存同期: ルートで `pnpm install` → `pnpm setup`。個別実行は `pnpm --filter backend install` を許可。
- 開発サーバー: `pnpm dev`（ルート）でバックエンド → フロントの順に起動。単体で動かす場合は `pnpm --filter backend run start:dev`。
- 本番ビルド: `pnpm --filter backend run build` で `dist/` を再生成。`start:prod` は `dist/main` を Node.js で直接起動。
- Prisma 同期: `pnpm --filter backend run prisma:generate` を **スキーマ更新ごとに必ず** 実行。

### 1-2. 品質ゲート（Backend スコープ）

| フェーズ | コマンド | 備考 |
| --- | --- | --- |
| Lint | `pnpm --filter backend run lint` | eslint + prettier、自動修正あり |
| 型チェック | `pnpm --filter backend run type-check` | `tsconfig.json` に対する `tsc --noEmit` |
| Unit | `pnpm --filter backend run test` | Jest。mock は `@nestjs/testing` を利用 |
| E2E | `pnpm --filter backend run test:e2e` | 実行前に `.env.test` を読み込み、`prisma migrate reset --force` を自動実行 |
| Build | `pnpm --filter backend run build` | `scripts/ensure-dev-build.mjs` が `node_modules/.prisma` 入りを保護 |

### 1-3. DB オペレーション

- マイグレーション作成: `pnpm --filter backend run prisma:migrate`（= `prisma migrate dev`）。開発中のみ使用。
- 本番適用: `pnpm --filter backend run prisma:deploy`。CI/CD でも同一コマンドを使用し、ダウンタイムを避ける。
- スキーマ差異確認: `pnpm --filter backend run prisma:status`。
- シード: `pnpm --filter backend run seed`。PostgreSQL 15+ 前提で管理者ロールを使用。

---

## 2. アーキテクチャ原則（NestJS レイヤリング）

1. **Controller → Service → Repository/PrismaService** の境界を厳守し、Controller から Prisma を直接呼び出さない。
2. DTO / Entity / Presenter は `src/modules/<domain>/dto` 等で整理し、`class-validator` + `class-transformer` を組み合わせて I/O を型安全化。
3. DI コンテナ: `@Injectable()` を付与し、コンストラクタインジェクションをデフォルトとする。循環依存がある場合のみ `forwardRef()`。
4. エラー処理: `HttpException` 系（`BadRequestException`, `ForbiddenException`, ...）で統一し、日本語メッセージを返却。
5. Config: `@nestjs/config` のスキーマに `zod` を組み合わせ、必須環境変数（`DATABASE_URL`, `JWT_SECRET`, `REDIS_URL` 等）を事前検証。
6. ロギング: `nestjs-pino` を共通 Logger とし、PII を除去した構造化ログを出力。
7. スケジュール/Bulk: `@nestjs/schedule` を使用する処理は専用モジュールを切り出し、`CronExpression` を `enum` 化して重複を防ぐ。

> 参考: [NestJS Prisma レシピ](https://docs.nestjs.com/recipes/prisma) は PrismaService を `PrismaClient` から拡張し、`tsconfig.build.json` に生成物を含めるベストプラクティスを明示。

---

## 3. API 設計 & バリデーション

- DTO 命名: `CreateCatDto`, `UpdateShiftDto` のように動詞 + 対象 + `Dto`。
- バリデーション
   - 文字列: `@IsString()` + `@IsNotEmpty()` を基本に、ID は `@IsUUID()`。
   - 日時計算は `Zod` でサーバー側再検証し、DTO では ISO8601 文字列を受け取る。
- レスポンス: `ClassSerializerInterceptor` で隠すフィールド（`passwordHash` 等）を `@Exclude()`。
- 認証: `@nestjs/passport` + JWT（`@nestjs/jwt`）でアクセストークンを発行。CSRF 保護が必要なフォームは `csurf` を `cookie-parser` と併用。
- レート制御: 公開 API は `@nestjs/throttler` で `/auth/*` に個別設定。
- Swagger: `pnpm --filter backend run swagger:gen` で `openapi.json` を再生成し、フロントと同期。

---

## 4. Prisma / データアクセス指針

1. **型ファースト**: スキーマ更新 → `prisma generate` → DTO/Service 実装 → テストの順序で作業。
2. Query 最適化:
   - 必要なフィールドのみ `select` / `include` で取得し、N+1 を防止。
   - 複雑なリレーションは `Prisma.transaction` や `Prisma.$transaction` を利用。
3. マイグレーション:
   - 開発: `prisma migrate dev` で `migration.sql` を自動生成。
   - 本番: `prisma migrate deploy` で手動入力なしに適用（[NestJS Prisma Starter README](https://github.com/notiz-dev/nestjs-prisma-starter/blob/master/README.md) 参照）。
4. 生成物の扱い:
   - `node_modules/.prisma` を Git 無視し、`dist/` へ含めるため `tsconfig.build.json` の include パスに `prisma/generated` を追加済みか確認。
5. Connection Pool / グローバルキャッシュ:
   - 高トラフィック環境では Prisma Accelerate (connection pooling + global cache) を採用し、`prisma-examples/accelerate/*` の構成を参考に `DATABASE_URL` を `prisma://` に切り替え。
6. 監視: `prisma:status` を CI で実行し、スキーマドリフト検知を義務化。

> 参考: [NestJS Prisma Starter](https://github.com/notiz-dev/nestjs-prisma-starter/blob/master/README.md) は dev→prod で `migrate dev` と `migrate deploy` を使い分ける手順や `prisma generate --watch` を推奨。
>
> 参考: [Prisma Examples README](https://raw.githubusercontent.com/prisma/prisma-examples/latest/README.md) の Accelerate/Optimize セクションで接続プールとクエリ最適化の推奨構成が公開。

---

## 5. PostgreSQL 運用ベストプラクティス

- チューニング初期値（PostgreSQL 18 doc より）
   - `shared_buffers`: 専用サーバーでは RAM の 25% 程度を目安に設定。40% を超えない。
   - `work_mem`: 複雑なハッシュ/ソートが多い場合は 4MB → 16MB へ段階的に増やし、`hash_mem_multiplier` と併せて監視。
   - `maintenance_work_mem`: VACUUM/インデックス作成時のバッファ。デフォルト 64MB から業務に応じて拡張。
   - `autovacuum_work_mem`: `maintenance_work_mem` と独立制御し、ワーカー数 × メモリが物理 RAM を超えないようにする。
- I/O
   - `bgwriter_*` と `effective_io_concurrency` を調整し、チェックポイント時のスパイクを抑制。
   - `temp_file_limit` を設定し、誤ったクエリの無制限一時領域確保を阻止。
- 監査: `pg_stat_statements` をオンにし、`prisma optimize` 推奨事項（全件走査, 非インデックス列フィルタなど）を定期レビュー。

> 参考: [PostgreSQL 19.4 Resource Consumption](https://www.postgresql.org/docs/current/runtime-config-resource.html) はメモリ・I/O パラメータの推奨帯域を提示。

---

## 6. ヘルスチェック / 可観測性

- `/health/live` `/health/ready` を `@nestjs/terminus` で実装し、HTTP + Prisma + Redis + ディスクのインジケータを登録。
- Terminus の `gracefulShutdownTimeoutMs` でローリングデプロイにおけるゼロダウンタイムを確保。
- `nestjs-pino` と Sentry (`@sentry/node`) を統合し、リクエスト ID を `AsyncLocalStorage` で伝播。

> 参考: [NestJS Terminus ガイド](https://docs.nestjs.com/recipes/terminus) はヘルスインジケータと graceful shutdown の設定例を提示。

---

## 7. セキュリティ & コンプライアンス

- HTTP ヘッダー: `helmet` を全ルートに適用し、`crossOriginResourcePolicy` を `same-site`。
- 認証情報: `argon2` をデフォルトハッシュに使用。`bcryptjs` は互換用レガシーのみ。
- CSRF: Cookie ベース認証パスは `csurf` のトークンを hidden input で往復。
- Secrets 管理: ルートの `pnpm run generate-secrets` で環境依存のキーを生成し、`.env` との差分を `git update-index --assume-unchanged` で保護。
- 入力ファイル: `multer` を使う場合、ファイル種別ホワイトリスト + アップロードサイズ制限を必須。

---

## 8. テスト戦略

- Unit: Service / Guard / Pipe ごとに `*.spec.ts` 作成。Prisma 依存部は `@nestjs/testing` + `PrismaService` のモック（`jest.mock`）で代替。
- Integration/E2E: `test/*.e2e-spec.ts` を `test:e2e` で直列実行。各ケース冒頭で `await prisma.$transaction([prisma.model.deleteMany(), ...])` してデータ汚染を防ぐ。
- コードカバレッジ: global 70% 以上。重要ユースケースは 90% 超を目標。

---

## 9. 開発フロー チェックリスト

1. 変更範囲の `CODE_GUIDE.md` が存在するか確認（現状 backend 配下は未定義）。
2. 作業前に `pnpm lint` + `pnpm backend:build` の最新結果を把握。
3. **型 → 実装 → テスト → Prisma migrate → ドキュメント** の順で更新。
4. 変更後は最低でも `pnpm lint`, `pnpm backend:build`, `pnpm --filter backend run test` を PASS させる。
5. Prisma 変更時は `pnpm db:migrate` + `pnpm db:seed` で差分を再現。
6. PR には:
   - 変更理由と影響範囲
   - 新規/更新コマンドの実行ログ
   - 既知の未対応事項（例: 追加マイグレーション案）
   を日本語で添付。

---

## 10. 参考リンク

- NestJS 公式: [Prisma レシピ](https://docs.nestjs.com/recipes/prisma), [Terminus / Health Checks](https://docs.nestjs.com/recipes/terminus)
- Prisma: [NestJS Prisma Starter README](https://github.com/notiz-dev/nestjs-prisma-starter/blob/master/README.md), [Prisma Examples README](https://raw.githubusercontent.com/prisma/prisma-examples/latest/README.md)
- PostgreSQL: [Resource Consumption (19.4)](https://www.postgresql.org/docs/current/runtime-config-resource.html)

以上の方針から逸脱する必要がある場合は、根拠とリスク緩和策を PR 説明または `docs/` 配下の設計資料に残してください。
