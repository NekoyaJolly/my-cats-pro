# UI/UX 改善タスク - Agent用プロンプト集

## 概要

本ドキュメントは、mycats-pro プロジェクトのUI/UX改善タスクを AI コーディングエージェントに依頼するためのプロンプト集です。

各タスクは優先度別に整理されており、Phase 1 から順に実装することを推奨します。

---

## Phase 1: 基盤整備（高優先度）

### TASK-UX-01: ダークモード対応の完全実装

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
ダークモード対応を完全に実装する。現在CSS変数は定義済みだが、ダークモード切り替え機能が未実装。

【背景】
- 現在の実装: `frontend/src/app/globals.css` にライトモード用CSS変数のみ定義
- 問題点: 夜間作業時の目の疲れ、ユーザー好みへの非対応

【要件】
1. CSS変数にダークモード対応を追加
   ```css
   @media (prefers-color-scheme: dark) {
     :root {
       --background-base: #0f172a;
       --background-soft: #1e293b;
       --surface: #1e293b;
       --surface-tinted: #1e3a5f;
       --border-subtle: #334155;
       --text-primary: #f8fafc;
       --text-secondary: #cbd5e1;
       --text-muted: #94a3b8;
       --accent: #3b82f6;
       --accent-subtle: #1e3a5f;
       color-scheme: dark;
     }
   }
   ```

2. テーマ切り替えコンポーネントを作成
   - ファイル: `frontend/src/components/ThemeToggle.tsx`
   - Mantine の `useMantineColorScheme` を使用
   - 3モード対応: ライト / ダーク / 自動（システム設定に従う）
   - アイコン: `IconSun`, `IconMoon`, `IconDeviceDesktop`
   - Tooltip でモード名を表示

3. providers.tsx を更新
   - `MantineProvider` に `defaultColorScheme="auto"` を設定
   - `ColorSchemeScript` を layout.tsx の head に追加

4. AppLayout.tsx にテーマ切り替えボタンを追加
   - ヘッダー右側（統計バッジの左）に配置
   - モバイルでも表示

【対象ファイル】
- frontend/src/app/globals.css（CSS変数追加）
- frontend/src/app/layout.tsx（ColorSchemeScript追加）
- frontend/src/app/providers.tsx（defaultColorScheme設定）
- frontend/src/components/ThemeToggle.tsx（新規作成）
- frontend/src/components/AppLayout.tsx（ボタン追加）

【制約】
- 既存のスタイルを破壊しない
- Mantine のテーマシステムを活用
- CSS変数を一貫して使用

【出力してほしいこと】
1. 変更ファイル一覧と役割
2. 主要なコード変更点
3. 動作確認手順
4. 実行したコマンド（pnpm --filter frontend ...）
```

---

### TASK-UX-02: 空状態（Empty State）デザインの統一

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
データがない場合の空状態表示を魅力的で統一されたコンポーネントに置き換える。

【背景】
- 現在の実装: 「表示するデータがありません」程度のテキストのみ
- 問題点: ユーザーへの次のアクション誘導が不足

【要件】
1. 汎用的な EmptyState コンポーネントを作成
   - ファイル: `frontend/src/components/EmptyState.tsx`
   - 3つのタイプに対応:
     - `no-data`: 初期状態でデータがない
     - `no-results`: 検索結果がない
     - `no-filter-match`: フィルター条件に一致しない

2. コンポーネント仕様
   ```tsx
   interface EmptyStateProps {
     type: 'no-data' | 'no-results' | 'no-filter-match';
     title?: string;        // カスタムタイトル（オプション）
     description?: string;  // カスタム説明（オプション）
     action?: {
       label: string;
       onClick: () => void;
     };
     icon?: ReactNode;      // カスタムアイコン（オプション）
   }
   ```

3. デザイン要件
   - 中央配置のアイコン（円形背景、グラデーション）
   - アイコンにゆるやかなアニメーション（上下移動 + 微回転）
   - タイトル + 説明テキスト
   - オプションでアクションボタン
   - framer-motion を使用したフェードインアニメーション

4. 既存ページへの適用
   - `frontend/src/app/cats/page.tsx`
   - `frontend/src/app/kittens/page.tsx`
   - `frontend/src/app/breeding/page.tsx`
   - 他の一覧ページ

【対象ファイル】
- frontend/src/components/EmptyState.tsx（新規作成）
- frontend/src/app/cats/page.tsx（適用）
- frontend/src/app/kittens/page.tsx（適用）
- その他一覧ページ

【制約】
- framer-motion を使用（既存依存関係）
- Mantine コンポーネントを活用
- 日本語 UI を維持

【出力してほしいこと】
1. 新規作成ファイルと役割
2. 各ページへの適用例
3. 動作確認手順
```

---

## Phase 2: 機能強化（高優先度）

### TASK-UX-03: グローバル検索（コマンドパレット）の実装

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
Cmd/Ctrl + K で開くグローバル検索機能を実装する。猫、血統書、タグなど横断的に検索可能にする。

【背景】
- 現在の実装: 各ページで個別の検索機能
- 問題点: 横断的な検索ができず、目的のデータへのアクセスが遅い

【要件】
1. GlobalSearch コンポーネントを作成
   - ファイル: `frontend/src/components/GlobalSearch.tsx`
   - Cmd/Ctrl + K でモーダルを開く（useHotkeys使用）
   - 検索対象: 猫、血統書、タグ
   - キーボードナビゲーション対応（↑↓で選択、Enterで決定）

2. 検索結果の型定義
   ```tsx
   interface SearchResult {
     id: string;
     type: 'cat' | 'pedigree' | 'tag';
     title: string;
     subtitle?: string;
     href: string;
   }
   ```

3. UI仕様
   - モーダル形式（Mantine Modal使用）
   - 大きめの検索入力欄（上部固定）
   - 結果リストはスクロール可能
   - 各結果にアイコン + タイプバッジ + 矢印アイコン
   - 選択中の項目はハイライト表示
   - 結果がない場合のメッセージ表示

4. 検索トリガーボタン
   - ヘッダーに配置
   - 検索アイコン + 「検索...」テキスト + ⌘K ショートカット表示
   - クリックでもモーダルを開く

5. バックエンドAPI（必要な場合）
   - `GET /api/v1/search?q=キーワード`
   - レスポンス: SearchResult[]
   - 初期実装はフロントエンドでモック可

【対象ファイル】
- frontend/src/components/GlobalSearch.tsx（新規作成）
- frontend/src/components/AppLayout.tsx（検索ボタン追加）
- backend/src/search/search.controller.ts（オプション: API実装）
- backend/src/search/search.service.ts（オプション: API実装）

【制約】
- Mantine の Modal, TextInput を使用
- framer-motion でアニメーション
- useHotkeys でキーボードショートカット
- 初期実装はモックデータでも可（後でAPI連携）

【出力してほしいこと】
1. 変更ファイル一覧と役割
2. 主要なコード変更点
3. キーボード操作の仕様
4. 動作確認手順
```

---

### TASK-UX-04: 通知・フィードバックシステムの改善

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
通知（トースト）のデザインをカスタマイズし、より視覚的にわかりやすくする。また、通知ヘルパー関数を統一する。

【背景】
- 現在の実装: Mantine Notifications をデフォルトスタイルで使用
- 問題点: 視覚的なフィードバックが限定的、呼び出し方法が統一されていない

【要件】
1. 通知ヘルパーモジュールを作成
   - ファイル: `frontend/src/lib/notifications.ts`
   - 4種類の通知タイプ: success, error, warning, info
   - 各タイプにカスタムスタイルとアイコン

2. API仕様
   ```tsx
   interface NotifyOptions {
     title: string;
     message: string;
     action?: {
       label: string;
       onClick: () => void;
     };
   }

   export const notify = {
     success: (options: NotifyOptions) => void;
     error: (options: NotifyOptions) => void;
     warning: (options: NotifyOptions) => void;
     info: (options: NotifyOptions) => void;
   };
   ```

3. スタイル仕様
   - success: 緑系グラデーション背景、緑ボーダー
   - error: 赤系グラデーション背景、赤ボーダー、長めの表示時間
   - warning: 黄色系、警告アイコン
   - info: 青系、情報アイコン

4. アクションボタン対応
   - 通知内にオプションでボタンを配置可能
   - 例: 「削除しました」→「元に戻す」ボタン

5. 既存コードの置き換え
   - `notifications.show()` を `notify.success()` 等に置き換え
   - 主要なページで適用

【対象ファイル】
- frontend/src/lib/notifications.ts（新規作成）
- frontend/src/app/cats/page.tsx（適用例）
- frontend/src/app/kittens/page.tsx（適用例）
- frontend/src/components/cats/cat-edit-modal.tsx（適用例）

【制約】
- Mantine Notifications を拡張して使用
- 既存の通知機能を壊さない
- 段階的に置き換え可能な設計

【出力してほしいこと】
1. 新規作成ファイルと役割
2. 使用例コード
3. 既存コードの置き換え方法
4. 動作確認手順
```

---

## Phase 3: インタラクション強化（中優先度）

### TASK-UX-05: マイクロインタラクション・アニメーションの追加

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
ページ全体にマイクロインタラクションを追加し、より洗練されたUXを実現する。

【背景】
- 現在の実装: ダイアルナビゲーションのみアニメーション実装
- 問題点: 他のページでは静的な表示のみ

【要件】
1. 共通アニメーションCSSを作成
   - ファイル: `frontend/src/styles/animations.css`
   - フェードインアップ
   - スタッガーアニメーション（子要素を順番に表示）
   - カードホバーエフェクト
   - 成功時パルスアニメーション

2. CSS定義
   ```css
   @keyframes fadeInUp {
     from {
       opacity: 0;
       transform: translateY(10px);
     }
     to {
       opacity: 1;
       transform: translateY(0);
     }
   }

   @keyframes pulse-soft {
     0%, 100% { transform: scale(1); }
     50% { transform: scale(1.02); }
   }

   .animate-fade-in-up {
     animation: fadeInUp 0.3s ease-out forwards;
   }

   .animate-stagger > * {
     animation: fadeInUp 0.3s ease-out forwards;
   }

   .animate-stagger > *:nth-child(1) { animation-delay: 0ms; }
   .animate-stagger > *:nth-child(2) { animation-delay: 50ms; }
   .animate-stagger > *:nth-child(3) { animation-delay: 100ms; }
   .animate-stagger > *:nth-child(4) { animation-delay: 150ms; }
   .animate-stagger > *:nth-child(5) { animation-delay: 200ms; }

   .card-hover {
     transition: transform 0.2s ease, box-shadow 0.2s ease;
   }

   .card-hover:hover {
     transform: translateY(-4px);
     box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
   }

   .success-pulse {
     animation: pulse-soft 0.6s ease-in-out;
   }
   ```

3. globals.css にインポート追加

4. 適用箇所
   - ホームページのカードグリッド: スタッガーアニメーション
   - 猫一覧のテーブル行: フェードインアップ
   - カード系コンポーネント: ホバーエフェクト
   - 保存成功時: パルスアニメーション

【対象ファイル】
- frontend/src/styles/animations.css（新規作成）
- frontend/src/app/globals.css（インポート追加）
- frontend/src/app/page.tsx（適用）
- frontend/src/app/cats/page.tsx（適用）

【制約】
- パフォーマンスに配慮（will-change使用、GPU加速）
- アクセシビリティ考慮（prefers-reduced-motion対応）
- 過度なアニメーションは避ける

【出力してほしいこと】
1. 新規作成ファイルと役割
2. 各ページへの適用方法
3. prefers-reduced-motion 対応
4. 動作確認手順
```

---

### TASK-UX-06: データ可視化チャートコンポーネントの作成

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
体重推移などのデータを視覚的に表示するチャートコンポーネントを作成する。

【背景】
- 現在の実装: 体重記録機能は計画段階、グラフ表示なし
- 問題点: 数値データの推移が視覚的に把握できない

【要件】
1. 依存関係の追加
   ```bash
   pnpm --filter frontend add recharts
   ```

2. 体重推移チャートコンポーネントを作成
   - ファイル: `frontend/src/components/charts/WeightTrendChart.tsx`
   - Recharts の AreaChart を使用
   - グラデーション塗りつぶし
   - ツールチップ対応
   - トレンド表示（前回比）

3. コンポーネント仕様
   ```tsx
   interface WeightData {
     date: string;
     weight: number;
   }

   interface WeightTrendChartProps {
     data: WeightData[];
     title: string;
     unit?: string;  // デフォルト: 'g'
   }
   ```

4. デザイン要件
   - カード形式で表示
   - ヘッダー: タイトル + トレンドバッジ（増減表示）
   - チャート: エリアチャート、青系グラデーション
   - X軸: 日付、Y軸: 体重
   - カスタムツールチップ

5. チャートインデックスファイル
   - ファイル: `frontend/src/components/charts/index.ts`
   - 将来の拡張に備えてエクスポート整理

【対象ファイル】
- frontend/package.json（recharts追加）
- frontend/src/components/charts/WeightTrendChart.tsx（新規作成）
- frontend/src/components/charts/index.ts（新規作成）
- frontend/src/app/kittens/page.tsx（適用例）

【制約】
- recharts を使用
- Mantine のカードコンポーネントと組み合わせ
- レスポンシブ対応（ResponsiveContainer使用）
- ダークモード対応

【出力してほしいこと】
1. 新規作成ファイル一覧
2. 依存関係追加コマンド
3. 使用例コード
4. 動作確認手順
```

---

## Phase 4: モバイル最適化（低優先度）

### TASK-UX-07: スワイプ操作対応カードコンポーネント

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
モバイルでのスワイプ操作に対応したカードコンポーネントを作成する。左右スワイプでアクション実行可能。

【背景】
- 現在の実装: タップ操作のみ
- 問題点: モバイルでの操作効率が低い

【要件】
1. SwipeableCard コンポーネントを作成
   - ファイル: `frontend/src/components/SwipeableCard.tsx`
   - 左スワイプ: 削除などの破壊的アクション
   - 右スワイプ: 編集などのポジティブアクション
   - 背景にアクションアイコン表示

2. コンポーネント仕様
   ```tsx
   interface SwipeableCardProps {
     children: ReactNode;
     onSwipeLeft?: () => void;
     onSwipeRight?: () => void;
     leftAction?: ReactNode;   // 左スワイプ時に表示するアイコン
     rightAction?: ReactNode;  // 右スワイプ時に表示するアイコン
     threshold?: number;       // スワイプ閾値（デフォルト: 80）
   }
   ```

3. 動作仕様
   - スワイプ中: 背景アクションが徐々に表示
   - 閾値超え: アクション実行
   - 閾値未満: 元の位置に戻る
   - ドラッグ制限: 左右100pxまで

4. framer-motion を使用
   - useMotionValue, useTransform でスワイプ追跡
   - PanInfo でドラッグ終了時の判定

【対象ファイル】
- frontend/src/components/SwipeableCard.tsx（新規作成）
- frontend/src/app/cats/page.tsx（モバイル時に適用）

【制約】
- framer-motion を使用
- デスクトップでは無効（タッチデバイスのみ）
- アクセシビリティ: スワイプ以外の操作手段も維持

【出力してほしいこと】
1. 新規作成ファイルと役割
2. 使用例コード
3. モバイル判定方法
4. 動作確認手順
```

---

### TASK-UX-08: フローティングアクションボタン（FAB）の実装

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
画面右下に固定表示されるクイックアクションボタンを実装する。

【背景】
- 現在の実装: 各ページで個別にアクションボタン配置
- 問題点: 頻繁に使う操作へのアクセスが遅い

【要件】
1. QuickActions コンポーネントを作成
   - ファイル: `frontend/src/components/QuickActions.tsx`
   - 画面右下に固定配置（ボトムナビの上）
   - メインボタン（+アイコン）をタップで展開
   - 展開時: サブアクションが上方向に表示

2. デフォルトアクション
   ```tsx
   const actions = [
     { id: 'new-cat', icon: IconCat, label: '新規猫登録', href: '/cats/new', color: '#3b82f6' },
     { id: 'new-breeding', icon: IconHeart, label: '交配記録', href: '/breeding', color: '#ec4899' },
     { id: 'new-tag', icon: IconTag, label: 'タグ管理', href: '/tags', color: '#eab308' },
   ];
   ```

3. アニメーション仕様
   - メインボタン: タップで45度回転（+ → ×）
   - サブアクション: 順番にスケールイン
   - framer-motion の AnimatePresence 使用

4. 配置
   - position: fixed
   - bottom: 80px（ボトムナビの上）
   - right: 20px
   - z-index: 200

5. AppLayout への組み込み
   - 認証済みページでのみ表示
   - モバイル・デスクトップ両対応

【対象ファイル】
- frontend/src/components/QuickActions.tsx（新規作成）
- frontend/src/components/AppLayout.tsx（組み込み）

【制約】
- framer-motion を使用
- Mantine ActionIcon, Tooltip を使用
- ボトムナビと重ならないよう配置

【出力してほしいこと】
1. 新規作成ファイルと役割
2. AppLayout への組み込み方法
3. アニメーション仕様
4. 動作確認手順
```

---

## 共通の品質ゲート

各タスク完了時に以下を確認:

```bash
# Lint チェック
pnpm --filter frontend lint

# 型チェック
pnpm --filter frontend type-check

# ビルド確認
pnpm --filter frontend build

# 開発サーバーで動作確認
pnpm dev
```

---

## タスク実行順序の推奨

### Phase 1: 基盤整備（1-2週間）
1. TASK-UX-01: ダークモード対応
2. TASK-UX-02: 空状態デザイン

### Phase 2: 機能強化（2-3週間）
3. TASK-UX-03: グローバル検索
4. TASK-UX-04: 通知システム改善

### Phase 3: インタラクション強化（3-4週間）
5. TASK-UX-05: マイクロインタラクション
6. TASK-UX-06: チャートコンポーネント

### Phase 4: モバイル最適化（継続的）
7. TASK-UX-07: スワイプ操作
8. TASK-UX-08: クイックアクション

---

## 依存関係

| タスク | 依存するタスク | 新規依存パッケージ |
|--------|--------------|------------------|
| TASK-UX-01 | なし | なし |
| TASK-UX-02 | なし | なし（framer-motion既存） |
| TASK-UX-03 | なし | なし |
| TASK-UX-04 | なし | なし |
| TASK-UX-05 | TASK-UX-01 | なし |
| TASK-UX-06 | なし | recharts |
| TASK-UX-07 | なし | なし（framer-motion既存） |
| TASK-UX-08 | なし | なし（framer-motion既存） |

---

## 注意事項

- 各タスクは独立して実行可能だが、Phase順に進めることを推奨
- 大規模な変更前には必ずブランチを作成
- ダークモード対応（TASK-UX-01）は他のタスクに影響するため最優先
- アクセシビリティ（ARIA属性、キーボード操作）を常に考慮
- 日本語UIを維持すること

---

## 参考リンク

- [Mantine Documentation](https://mantine.dev)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Recharts Documentation](https://recharts.org)
- [Tabler Icons](https://tabler.io/icons)
- [docs/ui-button-design-guide.md](./ui-button-design-guide.md) - ボタンデザインガイド

