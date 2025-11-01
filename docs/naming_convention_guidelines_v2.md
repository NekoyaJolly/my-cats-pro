# 🧭 Naming & Convention Guidelines — Complete Edition
**Version:** 2.0  
**Last Updated:** 2025-10-19  
**Scope:** 全プロジェクト（NestJS / Next.js / Prisma / CLI / Scripts / Tests / Infra）

---

## 1. 基本原則

- 命名は **一貫性・可読性・自動検証可能性** を最重視する。
- 全ての命名は「役割・責務・レイヤー」を明示し、**コンテキスト依存の略語を避ける**。
- 英単語はすべて**英語正式語または承認済み略語**を用いる。
- **Public API 名**（外部仕様に露出するもの）は**破壊的変更を避ける**。

---

## 2. ファイル命名規則

| 種別 | 命名形式 | 例 |
|---|---|---|
| 一般TS | `kebab-case.ts` | `user-service.ts` |
| Reactコンポーネント | `PascalCase.tsx` | `UserCard.tsx` |
| React Hook | `useCamelCase.ts` | `useUserData.ts` |
| NestJS構成 | `*.module.ts` / `*.controller.ts` / `*.service.ts` / `*.guard.ts` / `*.interceptor.ts` / `*.filter.ts` | 例: `cats.controller.ts` |
| テスト | `*.spec.ts` / `*.test.ts` | `user.service.spec.ts` |
| Prisma | `schema.prisma` 固定 |  |
| Config / Env | `.env`, `.env.local`, `.env.production` |  |

### 補足ルール
- Barrel (`index.ts`) は**再エクスポート専用**。実装コードを混在させない。
- Barrel は**エクスポート名 = 実体名**を維持。
- default export は禁止（例外は Next.js ページコンポーネントのみ）。

---

## 3. シンボル命名規則

| 種別 | 命名形式 | 例 |
|---|---|---|
| クラス / 型 / インターフェース / コンポーネント | PascalCase | `UserService`, `CreateCatDto` |
| 関数 / メソッド / 変数 / プロパティ | camelCase | `createUser`, `fetchData` |
| 列挙型 | Name=PascalCase, Member=SCREAMING_SNAKE_CASE | `Color.RED` |
| 定数（不変） | SCREAMING_SNAKE_CASE | `DEFAULT_LIMIT` |
| Prisma Model | PascalCase | `Cat`, `UserProfile` |
| Prisma フィールド | camelCase | `birthDate` |
| DB テーブル / カラム | snake_case | `cat_breed`, `birth_date` |

---

## 4. API & DTO 命名規則

- REST ルートは `kebab-case` を用い、バージョン付き `/api/v1/...` とする。
- クエリパラメータとレスポンスキーは `snake_case`。
- DTO / Response クラスは `PascalCaseDto` / `PascalCaseResponse`。
- エラー応答共通構造：

```json
{ "success": false, "error": { "code": "INVALID_PARAMETER", "message": "..." } }
```

---

## 5. エラー・イベント・ログ命名

| 種別 | 命名形式 | 例 |
|---|---|---|
| 例外クラス | PascalCase + `Exception` | `ValidationException` |
| エラーコード | SCREAMING_SNAKE_CASE | `UNAUTHORIZED_ACCESS` |
| ログイベント名 | `domain.action`（小文字ドット区切り） | `cat.registered`, `auth.login.success` |

---

## 6. ワークスペース / パッケージ

| 項目 | 規則 |
|---|---|
| npm workspace 名 | `@org/kebab-case` |
| ディレクトリ名 | ファイルと同一規則 |
| サービス単位 | `apps/`（実行系）・`packages/`（共通ライブラリ）・`infra/`（構成管理）に分類 |

---

## 7. テスト・UI 属性・CSS

| 項目 | 規則 |
|---|---|
| data-testid | `kebab-case`、ページごとに名前空間付与（例：`cat-form-submit`） |
| CSS Modules | `kebab-case` |
| BEM | 必要に応じて採用。Block=PascalCase, element=camelCase |

---

## 8. スクリプト命名（package.json）

| コマンド | 目的 |
|---|---|
| `lint:naming` | ESLint命名検査（--max-warnings=0） |
| `fix:naming` | 自動修正（安全範囲のみ） |
| `typecheck` | tsc検査 |
| `test:unit` / `test:e2e` | テスト群 |
| `ci:verify` | lint + typecheck + test |

---

## 9. Git運用規約

| 項目 | 規則 |
|---|---|
| ブランチ名 | `feature/...`, `fix/...`, `chore/...`（kebab-case） |
| コミットメッセージ | Conventional Commits 準拠（例：`feat(api): add cat register endpoint`） |
| タグ | `vX.Y.Z`（SemVer） |

---

## 10. 承認済み略語表（例）

| 略語 | 意味 | 許可対象 |
|---|---|---|
| dto | Data Transfer Object | OK（末尾のみ） |
| id | Identifier | OK |
| api | Application Programming Interface | OK |
| ui | User Interface | OK（末尾限定） |
| db | Database | OK |
| env | Environment | OK |

> Glossary 未承認略語を使用する場合は、PR で Glossary 更新を伴う。

---

## 11. 命名例外申請プロセス

例外を許可する場合は **Issue テンプレート**を利用し、次を必須記載：

| 項目 | 内容 |
|---|---|
| 理由 | 一時的・外部仕様・後方互換維持など |
| 対象 | ファイル/クラス名 |
| 影響範囲 | 内部限定 or 外部API含む |
| 代替案 | 将来的なリネーム計画 |
| 有効期限 | YYYY-MM-DD（例外の再審査日） |

---

## 12. Barrel / パスエイリアス整合

- `index.ts` は再エクスポート専用。
- 相対パスは深さ2以上を禁止し、`@/` alias 経由に統一。
- `tsconfig.json` の `paths` と物理ディレクトリ名は**ケース一致**必須。

---

## 13. CI/CD 自動検証設定例

**ESLint設定（抜粋）**

```json
{
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      { "selector": "class", "format": ["PascalCase"] },
      { "selector": "variable", "format": ["camelCase", "UPPER_CASE"] },
      { "selector": "typeLike", "format": ["PascalCase"] }
    ],
    "filenames/match-regex": ["error", "^[a-z0-9]+(-[a-z0-9]+)*$", true],
    "filenames/match-exported": ["error", "pascal"]
  }
}
```

**CI設定例（GitHub Actions）**

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run lint:naming
```

---

## 14. Prisma & DB 命名一貫性

- Prisma モデルは PascalCase、フィールドは camelCase。
- 実DBのテーブル・カラムは snake_case。
- `@@map` および `@map` で対応：

```prisma
model Cat {
  id        Int     @id @default(autoincrement()) @map("cat_id")
  birthDate DateTime @map("birth_date")
  @@map("cats")
}
```

---

## 15. 運用フロー・監査手順

1. **監査**  
   `npm run lint:naming` をリポジトリルートで実行。
2. **自動修正 (Dry-run)**  
   `npm run fix:naming -- --dry-run`
3. **手動レビュー**  
   Public API影響ありはPRにラベル `naming-exception` を付与。
4. **適用**  
   `npm run fix:naming`
5. **CI固定**  
   以後は必須ゲート化。

---

## 16. 将来拡張予定

- Lintルールで**Glossary未承認略語の検出**を自動化。
- `ts-morph`を用いた**import参照の自動リネーム更新**。
- CIに**命名差分検出（前回 vs 今回）**を追加。

---

## 17. ドキュメント維持管理

- このファイルは `docs/naming-guidelines.md` に配置。
- 更新時は **Pull Request タイトルを必ず `[docs] naming-guidelines update`** にする。
- リリースノートには「命名規約更新」として明記。

---

### ✅ 最終チェックリスト

| 分類 | チェック |
|---|---|
| Barrelの実装混在禁止 | ☐ |
| tsconfig.pathsと実ディレクトリ一致 | ☐ |
| Public API命名の安定化 | ☐ |
| 略語Glossary更新済 | ☐ |
| ESLint命名ルール有効化 | ☐ |
| CIゲート（lint:naming）必須化 | ☐ |

