# フロントエンド棚卸し — 最終結果レポート

調査日: 2026-04-14
実施日: 2026-04-15
実施者: Claude (自動処理)
承認者: Neko

---

## 実施結果サマリー

| 項目 | 削除 | 修正 | 残留 |
|---|---|---|---|
| コンポーネント | 18ファイル削除 | 2ファイル修正 | — |
| ページ | 2ファイル削除（settingsディレクトリ） | — | — |
| 不審ファイル | 5ファイル削除 | — | — |
| **合計** | **25ファイル削除** | **2ファイル修正** | — |

### 削除行数

| カテゴリ | 行数 |
|---|---|
| 孤立コンポーネント（import 0） | 約1,670行 |
| ダイアルナビゲーション関連（負債宣言） | 約2,500行 |
| page.tsx / dashboard-settings.ts からの除去 | 約350行 |
| 孤立ページ + 不審ファイル | 約25行 |
| **削除行数合計** | **約4,500行** |

---

## 削除したファイル一覧

### 孤立コンポーネント（import 0件）
1. `components/SectionTitle.tsx` (39行)
2. `components/breeding/kitten-disposition-modal.tsx` (236行)
3. `components/buttons/PrimaryButton.tsx` (156行)
4. `components/cats/cat-quick-edit-modal.tsx` (146行)
5. `components/kittens/WeightChart.tsx` (230行)
6. `components/forms/ColorInputField.tsx` (35行)
7. `components/forms/DateInputField.tsx` (40行)
8. `components/editable-field/editable-field.tsx` (129行)
9. `components/editable-field/field-edit-modal.tsx` (197行)

### ダイアルナビゲーション関連（Neko が負債と判断）
10. `components/dashboard/DialNavigation.tsx` (1,211行)
11. `components/dashboard/DialMenuSettings.tsx` (306行)
12. `components/dashboard/DisplayModeToggle.tsx` (114行)
13. `components/dashboard/HexIconButton.tsx` (148行)
14. `components/dashboard/DialWheel.tsx` (462行)
15. `components/dashboard/DialWheel.module.css`
16. `components/dashboard/DialMenuV2.module.css`
17. `components/dashboard/HexIconButton.module.css`
18. `components/dashboard/__tests__/DialNavigation.test.tsx`

### 孤立ページ
19. `app/settings/page.tsx` (10行) — リンク元ゼロ
20. `app/settings/loading.tsx` (5行)

### 不審ファイル（空・未使用）
21. `lib/master-data/constants.ts` (0行 — 空ファイル)
22. `lib/api/auth-store.ts` (1行 — 未使用の再エクスポート)

---

## 修正したファイル

| ファイル | 修正内容 |
|---|---|
| `components/buttons/index.ts` | PrimaryButton の re-export を削除 |
| `app/page.tsx` | ダイアル関連の import・state・ハンドラ・JSX を除去。カード表示のみに簡素化 |
| `lib/storage/dashboard-settings.ts` | ダイアルメニュー設定・表示モード設定のコード（約240行）を除去 |

---

## ビルド検証結果

| 検証項目 | 結果 |
|---|---|
| TypeScript 型チェック (`tsc --noEmit`) | ✅ エラーなし（既存の @serwist 型定義警告のみ） |
| Next.js ビルド (`pnpm frontend:build`) | ✅ 成功 |
| Lint (`pnpm lint`) | ✅ frontend エラーなし（tools/ の既存問題のみ） |

---

## 残留タスク（今回の対象外）

| タスク | 優先度 | 説明 |
|---|---|---|
| deprecated `lib/api.ts` の移行 | 中 | 2ファイル（pedigrees/[id]/client.tsx, family-tree/client.tsx）が旧APIを使用中。`api/client.ts` に移行後に削除可能 |
| `FormField.tsx` の判断 | 低 | MasterDataCombobox が依存しているため今回残した。MasterDataCombobox の依存解消後に削除検討 |
| `/api/debug-version` 本番無効化 | 高 | Neko 承認済み。別タスクで対応 |
| `CodeCitations.md` の配置見直し | 低 | app/ から docs/ への移動検討 |
| 大規模ページの分割検討 | 低 | care(1,667行), staff/shifts(1,681行) 等の将来的な分割 |

---

## 変更前後の比較

| 指標 | 変更前 | 変更後 | 差分 |
|---|---|---|---|
| コンポーネントファイル数 | 46 | 28 | -18 |
| ページ数 | 28 | 27 | -1 |
| ホーム画面 page.tsx 行数 | 616 | 約380 | -236 |
| dashboard-settings.ts 行数 | 353 | 114 | -239 |
