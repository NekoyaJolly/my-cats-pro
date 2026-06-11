# 権限管理システム設計書（ロール + 個別権限のハイブリッド方式）

**Status:** Draft（レビュー待ち）
**作成日:** 2026-06-11
**関連:** 検証レポート H-5（ADMINロールで /tenants・/users が403になるロール設計の矛盾）

---

## 1. 背景と課題

### 1.1 現状の仕組み

- ロールは `UserRole` enum の4種固定: `USER` / `ADMIN` / `SUPER_ADMIN` / `TENANT_ADMIN`
- エンドポイントごとに `@Roles(UserRole.SUPER_ADMIN, ...)` がハードコードされ、`RoleGuard` が照合する
- ユーザーに「何ができるか」を個別に設定する手段がない

### 1.2 課題

1. **ロール設計の矛盾（H-5）**: テナント・ユーザー管理は SUPER_ADMIN / TENANT_ADMIN 前提で設計されているが、シードや管理者作成スクリプトは `ADMIN` を作るため、初期管理者がユーザー設定ページを一切使えない。`ADMIN` はマルチテナント導入前の旧ロールの名残で、現在は居場所がない
2. **シードによるロール巻き戻し**: シードがデプロイごとに `ADMIN_EMAIL` のユーザーのロールを `ADMIN` へ強制リセットしていた（→ 本設計と同時に修正済み: 新規作成は SUPER_ADMIN、既存ユーザーのロールには触れない）
3. **運用要件**: スタッフごとに「できること」が異なる。例えば「記録の入力はできるが削除はさせたくない」「ユーザー管理は渡したくない」など。**登録時に SUPER_ADMIN がチェックボックスで権限を付与できる**のが理想（オーナー要望）

### 1.3 現在の本番ユーザー構成（2026-06 時点）

| アカウント | ロール | 備考 |
|---|---|---|
| オーナー | SUPER_ADMIN | 全機能利用可 |
| もう1つの管理アカウント | SUPER_ADMIN | 全機能利用可 |
| テスト管理者 | ADMIN | ユーザー設定ページのみ403（他機能は利用可） |

---

## 2. 設計方針

**ロールを「権限のプリセット」に格下げし、実際のアクセス制御は権限（Permission）ベースで行う。**

- 権限の粒度は**機能ドメイン単位**（決定済み。CRUD単位の細分化はしない）
- 既存の `@Roles` ガードとは**併存させて段階移行**する（ビッグバン置換しない）
- `SUPER_ADMIN` は常に全権限（権限チェックをバイパス、UI上も変更不可）

## 3. 権限一覧（機能ドメイン単位）

閲覧（GET系）は全ログインユーザー共通とし、権限は**書き込み・管理操作**に対して定義する。

| 権限キー | 名称（UI表示） | 対象範囲 |
|---|---|---|
| `cats:write` | 猫情報の登録・編集・削除 | /cats 系の POST/PATCH/DELETE、体重記録 |
| `breeding:write` | 交配管理 | 交配記録・配種スケジュール・妊娠確認・出産予定・子猫処遇・NGルール |
| `care:write` | ケアスケジュール管理 | ケア予定の作成・更新・完了・削除・ステータス変更 |
| `medical:write` | 医療記録管理 | 医療記録の作成・更新・削除 |
| `tags:manage` | タグ管理・自動化ルール | タグ3階層 CRUD・並び替え・自動化ルール・手動実行 |
| `pedigree:write` | 血統書管理 | 血統書 CRUD・印刷設定 |
| `gallery:write` | ギャラリー管理 | ギャラリー CRUD・アップロード |
| `staff:manage` | スタッフ・シフト管理 | スタッフ CRUD・復元・シフト CRUD |
| `graduation:write` | 卒業（譲渡）管理 | 卒業記録の作成・更新・削除 |
| `data:import_export` | データ入出力 | CSVインポート・エクスポート |
| `users:manage` | ユーザー管理 | ユーザー招待・ロール/権限変更・削除（現 TENANT_ADMIN 相当） |
| `tenants:manage` | テナント管理 | テナント CRUD・管理者招待（現 SUPER_ADMIN 専用相当） |
| `settings:manage` | システム設定 | テナント設定（タグ色等）・印刷テンプレート・表示設定 |

> タグの**付与/剥奪**（猫へのタグ付け）は `cats:write` に含める（タグ定義の管理とは分離）。

## 4. ロールプリセット

ロールは新規ユーザー登録時の**初期チェック状態**を決めるだけで、登録時・登録後に個別調整できる。

| ロール | プリセット内容 |
|---|---|
| `SUPER_ADMIN` | 全権限（バイパス。UI上もチェックボックス無効＝常に全ON） |
| `ADMIN` | `users:manage` / `tenants:manage` 以外の全権限（=現場の全権管理者） |
| `USER` | `cats:write` / `care:write` / `medical:write` / `breeding:write`（日常記録のみ） |
| `TENANT_ADMIN` | ADMIN + `users:manage`（自テナント内） |

**テスト管理者（既存 ADMIN）の扱い**: Phase 1 のデータ移行で ADMIN プリセット相当の `permissions` を付与する（ユーザー管理は付与しない）。それ以上の権限が必要になれば UI から個別付与。

## 5. データモデル

```prisma
model User {
  // 既存フィールドはそのまま
  role        UserRole @default(USER)        // プリセット選択用として存続
  /// 機能ドメイン単位の個別権限（§3 の権限キーの配列）
  permissions String[] @default([]) @map("permissions")
}
```

- マイグレーション1本（列追加のみ、破壊的変更なし）
- 既存ユーザーへのバックフィル: ロールに応じたプリセットを `permissions` に展開する data migration を同梱
- 権限キーの定義はコード側の定数（`backend/src/auth/permissions.ts`）を単一の真実とし、DBには文字列で保存

## 6. バックエンド設計

### 6.1 権限定数とデコレータ

```ts
// backend/src/auth/permissions.ts
export const PERMISSIONS = {
  CATS_WRITE: 'cats:write',
  BREEDING_WRITE: 'breeding:write',
  // ...（§3 の13権限）
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// 使用例
@RequirePermissions(PERMISSIONS.STAFF_MANAGE)
@Post()
createStaff(...) {}
```

### 6.2 PermissionsGuard

- `RoleGuard` と同じ流儀で実装（`@Public` / `AUTH_DISABLED` の扱いも踏襲）
- 判定順序:
  1. `user.role === 'SUPER_ADMIN'` → 常に許可
  2. `requiredPermissions` がメタデータに無い → 許可（未適用エンドポイントは従来どおり）
  3. `user.permissions` に必要権限がすべて含まれる → 許可
  4. それ以外 → 403 +「この操作を行う権限がありません（必要な権限: 〇〇）」の日本語メッセージ
- **permissions の取得**: JWT ペイロードに `permissions` を含める（毎リクエストのDB参照を避ける）。アクセストークンは15分expiryのため、権限変更の反映遅延は最大15分で許容。即時失効が必要になったら将来 jti ブラックリスト等で対応

### 6.3 既存 @Roles との併存・移行

- `@Roles` と `RoleGuard` は当面残す（両方付いている場合は AND）
- 移行が完了したエンドポイントから `@Roles` を `@RequirePermissions` に置換
- 全面移行後に `ADMIN` ロールの廃止（enum からの削除 + data migration）を検討する（Phase 3）

## 7. フロントエンド設計

### 7.1 権限付与 UI（ユーザー設定ページ）

- **招待モーダル / ユーザー編集モーダル**に権限セクションを追加:
  1. ロール（プリセット）選択 → チェックボックスが初期状態に変わる
  2. 13個のチェックボックス（§3 の名称で日本語表示、3グループに区分け: 「日常記録」「マスタ・設定」「管理」）
  3. SUPER_ADMIN 選択時はチェックボックス無効（全ON固定）
- 招待 API / ユーザー更新 API に `permissions: string[]` を追加

### 7.2 画面の出し分け

- `useAuth`（または users/me）から `permissions` を取得し、`can('staff:manage')` ヘルパーを提供
- ナビゲーション: 権限のないページ（例: ユーザー設定）はサイドバーから非表示
- ページ内: 権限のない操作ボタンは非表示（disabled ではなく非表示を基本とする）
- 直接URLアクセスや権限変更直後の403には、日本語の権限不足バナーを表示（現状の無言の403を解消）

## 8. 段階移行計画

| Phase | 内容 | 規模感 |
|---|---|---|
| **Phase 1** | スキーマ追加 + バックフィル / 権限定数・デコレータ・ガード基盤 / JWTへの権限埋め込み / 招待・編集UIのチェックボックス / **users:manage・tenants:manage の適用**（ユーザー設定ページの403解消、テスト管理者の扱い確定） | 中 |
| **Phase 2** | 書き込み系エンドポイントへ `@RequirePermissions` を段階適用（cats → breeding → care/medical → その他）+ フロントの出し分け | 中〜大（機械的） |
| **Phase 3** | `@Roles` の撤去、`ADMIN` ロール廃止の検討、権限変更の即時失効対応（必要なら） | 小〜中 |

### 実施済み（本設計と同時にコミット）

- シード / 管理者作成スクリプトが新規作成する管理者を `SUPER_ADMIN` に変更
- シードが既存ユーザーのロールをデプロイごとに `ADMIN` へ強制リセットするロジックを撤去

## 9. テスト戦略

- PermissionsGuard のユニットテスト（SUPER_ADMINバイパス / 権限一致 / 不足 / メタデータなし）
- e2e: 権限なしユーザーでの 403（日本語メッセージ）、権限付与後の 200
- 招待→権限付与→ログイン→操作可否の一連フロー（Playwright）

## 10. 未決事項（実装前に確認）

1. `USER` プリセットの初期権限の範囲（§4 案で良いか。例えば medical:write を外すか）
2. 権限チェックボックスのグループ分け・文言（UI モック段階で確認）
3. TENANT_ADMIN の `users:manage` がテナント越え操作を防ぐ既存ロジックとの整合（users.service 内の tenantId フィルタを権限ベースでも維持）
