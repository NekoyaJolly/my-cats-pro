# コンポーネント棚卸しレポート

調査日: 2026-04-14
調査対象: frontend/src/components/

## サマリー

- 総コンポーネント数: 46
- 総行数: 約14,160行
- 🟢 使用中（import 3件以上）: 9
- 🟡 要確認（import 1-2件）: 27
- 🔴 未使用候補（import 0件）: 10
- ❓ 判定不能: 0

---

## コンポーネント一覧

### 🔴 未使用候補（優先確認）

| パス | export | 行数 | 最終更新 | import元 | 備考 | Neko判定 |
|---|---|---|---|---|---|---|
| components/SectionTitle.tsx | SectionTitle | 39 | 2025-12-22 | 0件 | どこからもインポートなし | □削除 □残す □保留 |
| components/breeding/kitten-disposition-modal.tsx | KittenDispositionModal | 236 | 2026-01-31 | 0件 | どこからもインポートなし | □削除 □残す □保留 |
| components/buttons/PrimaryButton.tsx | PrimaryButton | 156 | 2025-12-24 | 0件 | barrel(index.ts)にはあるが、barrel自体も外部未使用 | □削除 □残す □保留 |
| components/cats/cat-quick-edit-modal.tsx | CatQuickEditModal | 146 | 2026-01-30 | 0件 | どこからもインポートなし | □削除 □残す □保留 |
| components/dashboard/DialWheel.tsx | DialWheel | 462 | 2025-12-01 | 0件 | DialNavigationに置き換えられた旧実装と推定 | □削除 □残す □保留 |
| components/editable-field/editable-field.tsx | EditableField | 129 | 2025-11-07 | 0件 | ディレクトリ全体が未使用 | □削除 □残す □保留 |
| components/editable-field/field-edit-modal.tsx | FieldEditModal | 197 | 2026-01-31 | 0件 | 同上 | □削除 □残す □保留 |
| components/forms/ColorInputField.tsx | ColorInputField | 35 | 2025-10-04 | 0件 | FormFieldのみ依存、FormField自体も外部未使用 | □削除 □残す □保留 |
| components/forms/DateInputField.tsx | DateInputField | 40 | 2025-10-04 | 0件 | 同上 | □削除 □残す □保留 |
| components/kittens/WeightChart.tsx | WeightChart | 230 | 2026-01-31 | 0件 | どこからもインポートなし | □削除 □残す □保留 |

**未使用候補の合計: 1,670行**

> **特筆事項:**
> - `editable-field/` ディレクトリは2ファイル（326行）丸ごと未使用
> - `forms/ColorInputField.tsx` + `forms/DateInputField.tsx` + `forms/FormField.tsx` の3ファイルセット（128行）が実質的に死んでいる（FormFieldは上記2つのみから使われ、その2つ自体が未使用）
> - `DialWheel.tsx`（462行）は最大の未使用ファイル。`DialNavigation` に置き換えられた旧実装と推定

---

### 🟡 要確認（import 1-2件）

| パス | export | 行数 | 最終更新 | import数 | import元 | Neko判定 |
|---|---|---|---|---|---|---|
| components/AppLayout.tsx | AppLayout | 629 | 2026-03-27 | 2 | app/layout.tsx, tenants/BottomNavSettings.tsx | □確認済 |
| components/TabsSection.tsx | TabsSection | 98 | 2026-02-09 | 2 | app/breeding/page.tsx, kittens/KittenManagementModal.tsx | □確認済 |
| components/breeding/breeding-schedule-edit-modal.tsx | BreedingScheduleEditModal | 201 | 2026-01-31 | 1 | app/breeding/page.tsx | □確認済 |
| components/buttons/IconActionButton.tsx | IconActionButton | 171 | 2025-12-24 | 2 | app/care/page.tsx, app/medical-records/page.tsx | □確認済 |
| components/cats/PedigreeTab.tsx | PedigreeTab | 496 | 2026-01-31 | 1 | app/cats/[id]/client.tsx | □確認済 |
| components/cats/cat-edit-modal.tsx | CatEditModal | 290 | 2026-01-29 | 1 | app/cats/page.tsx | □確認済 |
| components/context-menu/context-menu.tsx | ContextMenuManager | 375 | 2025-11-20 | 1 | components/AppLayout.tsx | □確認済 |
| components/dashboard/DashboardCardSettings.tsx | DashboardCardSettings | 276 | 2025-11-08 | 2 | app/page.tsx, lib/storage/dashboard-settings.ts | □確認済 |
| components/dashboard/DialMenuSettings.tsx | DialMenuSettings | 306 | 2025-12-02 | 1 | app/page.tsx | □確認済 |
| components/dashboard/DialNavigation.tsx | DialNavigation | 1211 | 2025-12-05 | 1 | app/page.tsx | □確認済 |
| components/dashboard/DisplayModeToggle.tsx | DisplayModeToggle | 114 | 2025-12-05 | 1 | app/page.tsx | □確認済 |
| components/dashboard/HexIconButton.tsx | HexIconButton | 148 | 2025-12-05 | 1 | components/dashboard/DialNavigation.tsx | □確認済 |
| components/forms/FormField.tsx | FormField | 53 | 2025-10-04 | 2 | ColorInputField.tsx, DateInputField.tsx（両方とも未使用） | □確認済 |
| components/kittens/BulkWeightRecordModal.tsx | BulkWeightRecordModal | 414 | 2026-01-31 | 2 | app/breeding/WeightTab.tsx, app/kittens/page.tsx | □確認済 |
| components/kittens/WeightRecordModal.tsx | WeightRecordModal | 232 | 2026-01-31 | 2 | app/breeding/WeightTab.tsx, app/kittens/page.tsx | □確認済 |
| components/kittens/WeightRecordTable.tsx | WeightRecordTable | 336 | 2026-01-31 | 1 | app/breeding/WeightTab.tsx | □確認済 |
| components/pedigrees/PedigreeFamilyTree.tsx | PedigreeFamilyTree | 373 | 2026-01-31 | 1 | app/pedigrees/page.tsx | □確認済 |
| components/pedigrees/PedigreeList.tsx | PedigreeList | 460 | 2026-02-09 | 1 | app/pedigrees/page.tsx | □確認済 |
| components/pedigrees/PedigreeRegistrationForm.tsx | PedigreeRegistrationForm | 1418 | 2026-02-09 | 1 | app/pedigrees/page.tsx | □確認済 |
| components/pedigrees/PrintSettingsEditor.tsx | PrintSettingsEditor | 712 | 2026-01-31 | 1 | app/pedigrees/page.tsx | □確認済 |
| components/print-templates/CategoryManager.tsx | CategoryManager | 181 | 2026-02-08 | 1 | PrintTemplateManager.tsx | □確認済 |
| components/print-templates/FieldsPanel.tsx | FieldsPanel | 332 | 2026-02-08 | 2 | PrintTemplateManager.tsx, TemplatePreview.tsx | □確認済 |
| components/print-templates/PrintTemplateManager.tsx | PrintTemplateManager | 774 | 2026-02-08 | 1 | app/print-templates/page.tsx | □確認済 |
| components/print-templates/TemplatePreview.tsx | TemplatePreview | 458 | 2026-02-08 | 1 | PrintTemplateManager.tsx | □確認済 |
| components/ui/InputWithFloatingLabel.tsx | InputWithFloatingLabel | 72 | 2025-11-29 | 2 | app/cats/new/page.tsx, PedigreeRegistrationForm.tsx | □確認済 |
| components/ui/SelectWithFloatingLabel.tsx | SelectWithFloatingLabel | 74 | 2025-12-10 | 2 | app/cats/new/page.tsx, PedigreeRegistrationForm.tsx | □確認済 |
| components/ui/TextareaWithFloatingLabel.tsx | TextareaWithFloatingLabel | 73 | 2025-12-11 | 1 | app/cats/new/page.tsx | □確認済 |

> **注意**: 🟡 の多くは「1つのページ専用コンポーネント」であり、import 数が少ないのは正常。特に以下は問題なし:
> - `AppLayout` (2件): ルートレイアウト用なので import 少は正常
> - `PedigreeRegistrationForm` (1件): 血統書ページ専用の大型フォーム
> - `DialNavigation` (1件): ホーム画面専用
> - `FormField` (2件): import元の2ファイルが両方未使用のため、実質 🔴 と同等

---

### 🟢 使用中（import 3件以上）

| パス | export | 行数 | import数 | 主なimport元 |
|---|---|---|---|---|
| components/common/UnifiedModal.tsx | UnifiedModal | 135 | 30 | 全モーダル系コンポーネント |
| components/ActionButton.tsx | ActionButton | 386 | 18 | 多数のページ・コンポーネント |
| components/PageLoader.tsx | PageLoader | 20 | 10 | 各ルートの loading.tsx |
| components/GenderBadge.tsx | GenderBadge | 96 | 7 | 猫・子猫・ギャラリー系 |
| components/PageTitle.tsx | PageTitle | 31 | 3 | export, import, more ページ |
| components/TagSelector.tsx | TagSelector | 459 | 3 | breeding, cats/new, cat-edit-modal |
| components/context-menu/operation-modal-manager.tsx | OperationModalManager | 155 | 3 | care, cats, tags ページ |
| components/forms/MasterDataCombobox.tsx | MasterDataCombobox | 257 | 3 | cats/new, cats/[id]/edit, cat-edit-modal |
| components/kittens/KittenManagementModal.tsx | KittenManagementModal | 674 | 3 | breeding, cats/[id], kittens ページ |

---

## 未使用コンポーネント削除による効果

| 指標 | 値 |
|---|---|
| 削除候補ファイル数 | 10 |
| 削除候補行数 | 約1,670行 |
| 実質削除可能行数（FormField含む） | 約1,723行 |
| 関連CSSモジュール | DialWheel.module.css, DialMenuV2.module.css（別途報告） |
