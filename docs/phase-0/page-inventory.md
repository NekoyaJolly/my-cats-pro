# ページ棚卸しレポート

調査日: 2026-04-14
調査対象: frontend/src/app/

## サマリー

- 総ページ数: 28
- 🟢 使用中: 14
- 🟡 要確認: 5
- 🔴 孤立候補: 1
- ⚪ 動的ルート: 5
- ❓ 判定不能: 0
- レイアウト: 3（参考情報）

---

## ページ一覧

### 🔴 孤立ページ候補（優先確認）

| URL | ファイル | 行数 | 最終更新 | 要約 | リンク元 | Neko判定 |
|---|---|---|---|---|---|---|
| /settings | app/settings/page.tsx | 10 | 2025-12-23 | `/tenants` へリダイレクトするだけの中間ページ | なし（ナビ・ダッシュボード・他ページいずれからもリンクなし） | □削除 □残す □保留 |

> **補足**: `/settings` はどこからも参照されていない完全孤立ページ。`/tenants` へリダイレクトする10行のファイル。URL直打ちでのみ到達可能。

---

### 🟡 要確認ページ

| URL | ファイル | 行数 | 最終更新 | 要約 | リンク元 | Neko判定 |
|---|---|---|---|---|---|---|
| /accept-invitation | app/accept-invitation/page.tsx | 493 | 2025-11-28 | 招待トークンによるユーザー登録完了画面 | `lib/invitation-utils.ts` で招待URL生成（/accept-invitation?token=...） | □削除 □残す □保留 |
| /export | app/export/page.tsx | 183 | 2026-01-31 | データエクスポート（CSV/PDF）画面 | `/more` ページのメニューカード（1箇所のみ） | □削除 □残す □保留 |
| /import | app/import/page.tsx | 413 | 2026-01-31 | データインポート（CSV/JSON）画面 | `/more` ページのメニューカード（1箇所のみ） | □削除 □残す □保留 |
| /pedigrees/new | app/pedigrees/new/page.tsx | 11 | 2025-12-08 | `/pedigrees?tab=register` へリダイレクトするだけ | ダッシュボードのダイアルメニュー（1箇所のみ） | □削除 □残す □保留 |
| /print-templates | app/print-templates/page.tsx | 21 | 2025-12-13 | 印刷テンプレート管理画面 | `/more` ページのメニューカード（1箇所のみ） | □削除 □残す □保留 |
| /reset-password | app/reset-password/page.tsx | 159 | 2025-10-11 | パスワードリセット実行画面（トークン検証+新PW設定） | パスワードリセットURL生成（`lib/auth/password-reset-store.ts`）、`AUTH_ROUTES` 定義 | □削除 □残す □保留 |

> **補足**:
> - `/accept-invitation`: 機能上必要だが、`middleware.ts` の `PUBLIC_ROUTES` に含まれていない可能性あり（要確認）
> - `/export`, `/import`, `/print-templates`: いずれも `/more` 経由のみ。機能として必要なら問題なし
> - `/pedigrees/new`: リダイレクト専用。旧URL互換のために残している可能性
> - `/reset-password`: パスワードリセットフロー用。機能として必須

---

### 🟢 使用中ページ

| URL | ファイル | 行数 | 最終更新 | 要約 | リンク元数 |
|---|---|---|---|---|---|
| / | app/page.tsx | 616 | 2026-04-10 | ホームダッシュボード（カード型メニュー・ダイアル・統計表示） | 2+ |
| /breeding | app/breeding/page.tsx | 1005 | 2026-03-27 | 交配管理（スケジュール・記録の一覧と管理） | 4（サイドバー, ボトムナビ, ダッシュボード, ナビ定数） |
| /care | app/care/page.tsx | 1667 | 2026-03-27 | ケアスケジュール管理（日々のケアタスク） | 4 |
| /cats | app/cats/page.tsx | 917 | 2026-04-10 | 在舎猫一覧（タブ切替・検索・フィルタ） | 6+ |
| /cats/new | app/cats/new/page.tsx | 350 | 2026-04-10 | 新規猫登録フォーム | 4（サイドバー, ダッシュボード, 猫一覧, ナビ定数） |
| /forgot-password | app/forgot-password/page.tsx | 167 | 2025-11-07 | パスワードリセット要求画面（メール送信） | 2（ログイン画面, AUTH_ROUTES） |
| /gallery | app/gallery/page.tsx | 243 | 2026-03-27 | ギャラリー（子猫/父猫/母猫/卒業猫のタブ切替表示） | 4 |
| /kittens | app/kittens/page.tsx | 272 | 2026-03-27 | 子猫管理（成長記録管理） | 4 |
| /login | app/login/page.tsx | 269 | 2025-11-07 | ログイン画面（メール・パスワード認証） | 10+（認証リダイレクト、他ページリンク等） |
| /medical-records | app/medical-records/page.tsx | 731 | 2026-02-09 | 医療データ管理（診療・ワクチン・処方） | 4 |
| /more | app/more/page.tsx | 122 | 2025-12-14 | その他機能メニュー（印刷・エクスポート・インポートへのハブ） | 5（サイドバー, ボトムナビ, ダッシュボード, export戻る, import戻る） |
| /pedigrees | app/pedigrees/page.tsx | 93 | 2026-02-09 | 血統書管理（タブUI: 作成/データ管理/FamilyTree/印刷設定） | 4 |
| /register | app/register/page.tsx | 308 | 2025-11-25 | ユーザー登録画面 | 3（ログイン画面, AUTH_ROUTES, middleware） |
| /staff/shifts | app/staff/shifts/page.tsx | 1681 | 2026-01-31 | スタッフシフト管理（カレンダー表示） | 3 |
| /tags | app/tags/page.tsx | 968 | 2026-02-09 | タグ管理（作成・編集・カテゴリ分類・自動タグ） | 4 |
| /tenants | app/tenants/page.tsx | 12 | 2025-11-26 | テナント管理（テナント・ユーザー一覧と招待） | 3（サイドバー, ダッシュボード, /settings リダイレクト先） |

---

### ⚪ 動的ルート

| URL | ファイル | 行数 | 最終更新 | 要約 | リンク元 |
|---|---|---|---|---|---|
| /cats/[id] | app/cats/[id]/page.tsx | 9 | 2025-11-01 | 猫詳細（Server Component→Client委譲） | 猫一覧の行クリック, 編集後遷移, 親猫リンク |
| /cats/[id]/edit | app/cats/[id]/edit/page.tsx | 9 | 2025-11-08 | 猫情報編集（Server Component→Client委譲） | 猫詳細の編集ボタン |
| /cats/[id]/pedigree | app/cats/[id]/pedigree/page.tsx | 224 | 2026-04-10 | 個別猫の血統図表示 | 猫詳細の血統書ボタン |
| /pedigrees/[id] | app/pedigrees/[id]/page.tsx | 4 | 2026-02-05 | 血統書詳細（Server Component→Client委譲） | 父母/子血統書リンク, family-tree戻る |
| /pedigrees/[id]/family-tree | app/pedigrees/[id]/family-tree/page.tsx | 4 | 2026-02-05 | 血統書家系図（Server Component→Client委譲） | 血統書詳細の家系図ボタン |

---

### レイアウト（参考情報）

| ファイル | 行数 | 最終更新 | 要約 |
|---|---|---|---|
| app/layout.tsx | 83 | 2026-04-10 | ルートレイアウト（フォント設定・Providers・AppShell・PWAメタデータ） |
| app/cats/[id]/layout.tsx | 11 | 2025-11-01 | 猫詳細の動的ルートレイアウト（generateStaticParams空配列+パススルー） |
| app/pedigrees/[id]/layout.tsx | 11 | 2026-02-05 | 血統書詳細の動的ルートレイアウト（generateStaticParams空配列+パススルー） |

---

## 特記事項

1. **`/settings` は完全孤立**: どこからもリンクされておらず、`/tenants` へ redirect するだけの10行ファイル。削除しても影響なしと推測
2. **`/pedigrees/new` はリダイレクト専用**: `/pedigrees?tab=register` へ飛ばすだけ。ダイアルメニューから1箇所参照あり。リダイレクト先に直接リンクすれば削除可能
3. **`/accept-invitation` のルーティング不整合の可能性**: AUTH_ROUTES/PUBLIC_ROUTES に含まれていない可能性。未認証ユーザーがアクセスするページのため要確認
4. **大規模ページ**: `/care` (1667行), `/staff/shifts` (1681行), `/breeding` (1005行), `/tags` (968行), `/cats` (917行) の5ページが肥大化傾向。将来的な分割検討の余地あり
