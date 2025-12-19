# タブ機能改善タスク - Agent用プロンプト集

## 概要

本ドキュメントは、mycats-pro プロジェクトのタブ機能改善タスクを AI コーディングエージェントに依頼するためのプロンプト集です。

各タスクは UI → API → DB の縦割りレビュー結果に基づき、優先度別に整理されています。

---

## 高優先度タスク

### TASK-H1: 子猫管理ページの強化 - 子猫専用APIエンドポイント追加

```text
あなたは mycats-pro プロジェクト専任の AI コーディングエージェントです。
Next.js 15（App Router）+ React 19 + NestJS 10 + Prisma 6 + PostgreSQL 15 のベストプラクティスと、
リポジトリ直下の AGENTS.md / 該当フォルダの CODE_GUIDE.md に従ってください。

【やりたいこと】
子猫管理ページ（/kittens）で使用する専用APIエンドポイントを追加する。
現在、全猫データを取得してクライアントサイドでフィルタリングしているが、
子猫専用のエンドポイントを作成してサーバーサイドでフィルタリングを行う。

【背景】
- 現在の実装: `GET /cats?limit=1000` で全データ取得 → クライアントで子猫判定
- 問題点: データ量増加時のパフォーマンス低下、不要なデータ転送

【要件】
1. バックエンド: `GET /cats/kittens` エンドポイントを追加
   - 生後6ヶ月未満の猫をフィルタリング
   - 母猫ごとにグループ化したレスポンス形式
   - クエリパラメータ: `motherId`, `limit`, `offset`
   
2. フロントエンド: `/kittens/page.tsx` を新エンドポイントに対応
   - 新しい React Query hook `useGetKittens` を作成
   - 既存の `useGetCats` + クライアントフィルタリングを置き換え

【対象ファイル】
- backend/src/cats/cats.controller.ts
- backend/src/cats/cats.service.ts
- backend/src/cats/dto/ (新規DTO追加)
- frontend/src/lib/api/hooks/use-cats.ts
- frontend/src/app/kittens/page.tsx

【制約】
- any/unknown / 非 null アサーションは禁止。型定義 → 実装 → テストの順で更新。
- 既存の猫一覧API（GET /cats）には影響を与えない。
- Prisma クエリは必要なフィールドのみ select/include で取得。

【出力してほしいこと】
1. 変更ファイル一覧（役割付き）
2. 主要なコード変更点 + 型安全性のポイント
3. 追加 / 更新したテストと意図
4. 実行したコマンドと再現手順（pnpm ベース）
```

---

### TASK-H2: 子猫管理ページの強化 - 体重記録機能の実装

```text
あなたは mycats-pro プロジェクト専任の AI コーディングエージェントです。
Next.js 15（App Router）+ React 19 + NestJS 10 + Prisma 6 + PostgreSQL 15 のベストプラクティスと、
リポジトリ直下の AGENTS.md / 該当フォルダの CODE_GUIDE.md に従ってください。

【やりたいこと】
子猫管理ページ（/kittens）のケアスケジュールタブに体重記録機能を実装する。
現在、体重データがハードコードされているため、実際に記録・表示できるようにする。

【背景】
- 現在の実装: 体重表示がハードコード（例: `weight: 350`, `前回: 420g (+30g)`）
- 問題点: 実際の体重推移が追跡できない

【要件】
1. DB: 体重記録用モデルを追加
   ```prisma
   model WeightRecord {
     id        String   @id @default(uuid())
     catId     String   @map("cat_id")
     weight    Float    // グラム単位
     recordedAt DateTime @default(now()) @map("recorded_at")
     notes     String?
     recordedBy String  @map("recorded_by")
     createdAt DateTime @default(now()) @map("created_at")
     updatedAt DateTime @updatedAt @map("updated_at")
     cat       Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
     recorder  User     @relation(fields: [recordedBy], references: [id])
     
     @@index([catId])
     @@index([recordedAt])
     @@index([catId, recordedAt])
     @@map("weight_records")
   }
   ```

2. バックエンド: 体重記録CRUD API
   - `GET /cats/:id/weight-records` - 体重記録一覧取得
   - `POST /cats/:id/weight-records` - 体重記録追加
   - `PATCH /weight-records/:id` - 体重記録更新
   - `DELETE /weight-records/:id` - 体重記録削除

3. フロントエンド: 体重記録UI
   - 体重入力フォーム（モーダル）
   - 体重推移グラフ（Chart.js or recharts）
   - 前回比較の自動計算

【対象ファイル】
- backend/prisma/schema.prisma
- backend/src/cats/cats.controller.ts
- backend/src/cats/cats.service.ts
- backend/src/cats/dto/weight-record.dto.ts (新規)
- frontend/src/lib/api/hooks/use-cats.ts
- frontend/src/app/kittens/page.tsx
- frontend/src/components/kittens/WeightRecordModal.tsx (新規)
- frontend/src/components/kittens/WeightChart.tsx (新規)

【制約】
- Prisma マイグレーションを生成し、影響範囲を説明すること。
- 体重は Float 型でグラム単位（整数でも可）。
- グラフライブラリは既存の依存関係を確認し、なければ recharts を使用。

【出力してほしいこと】
1. 変更ファイル一覧（役割付き）
2. Prisma マイグレーション内容
3. 主要なコード変更点 + 型安全性のポイント
4. 追加 / 更新したテストと意図
5. 実行したコマンドと再現手順（pnpm ベース）
```

---

### TASK-H3: 子猫管理ページの強化 - タブ状態のURL永続化

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
子猫管理ページ（/kittens）のタブ状態をURLパラメータで永続化する。
現在、タブ切り替え後にリロードすると初期タブに戻ってしまう。

【背景】
- 現在の実装: `<Tabs defaultValue="list">` で固定
- 問題点: ブックマーク・共有・リロード時にタブ状態が失われる

【要件】
1. URLパラメータ `?tab=list` または `?tab=care` でタブ状態を管理
2. タブ切り替え時に `router.push` または `router.replace` でURL更新
3. 初期表示時にURLパラメータからタブを復元

【参考実装】
血統書管理ページ（/pedigrees/page.tsx）の実装パターンを参考にする:
```tsx
const searchParams = useSearchParams();
const tabParam = searchParams.get('tab') || 'list';

const handleTabChange = (nextTab: string | null) => {
  if (!nextTab) return;
  const nextParams = new URLSearchParams(searchParams);
  nextParams.set('tab', nextTab);
  router.push(`${pathname}?${nextParams.toString()}`);
};

<Tabs value={tabParam} onChange={handleTabChange}>
```

【対象ファイル】
- frontend/src/app/kittens/page.tsx

【制約】
- 既存のタブコンテンツには変更を加えない。
- Mantine の Tabs コンポーネントの使い方を維持。

【出力してほしいこと】
1. 変更ファイルと変更内容
2. 実装のポイント
3. 動作確認手順
```

---

### TASK-H4: 巨大コンポーネントの分割 - 交配管理ページ

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
交配管理ページ（/breeding/page.tsx）を適切なサイズのコンポーネントに分割する。
現在2500行を超える巨大コンポーネントになっており、保守性に課題がある。

【背景】
- 現在の実装: 1ファイルに4つのタブパネル + 複数のモーダルが含まれている
- 問題点: コードの見通しが悪く、変更時の影響範囲が把握しづらい

【要件】
以下の構成でコンポーネントを分割:

```
frontend/src/app/breeding/
├── page.tsx                      # メインページ（タブ制御のみ）
├── components/
│   ├── BreedingScheduleTab.tsx   # 交配管理タブ
│   ├── PregnancyCheckTab.tsx     # 妊娠確認タブ
│   ├── BirthPlanTab.tsx          # 出産予定タブ
│   ├── RaisingTab.tsx            # 子育て中タブ
│   ├── MaleSelectionModal.tsx    # オス猫追加モーダル
│   ├── FemaleSelectionModal.tsx  # メス猫選択モーダル
│   ├── BirthInfoModal.tsx        # 出産情報入力モーダル
│   ├── NgRulesModal.tsx          # NG設定モーダル
│   └── NewRuleModal.tsx          # 新規ルール作成モーダル
└── hooks/
    ├── useBreedingSchedule.ts    # スケジュール状態管理
    └── useBreedingData.ts        # API データ取得
```

【分割方針】
1. 各タブパネルを独立したコンポーネントに
2. モーダルを個別コンポーネントに
3. 状態管理ロジックをカスタムフックに抽出
4. localStorage 操作を専用フックに集約

【制約】
- 機能的な変更は行わない（リファクタリングのみ）
- 既存のAPIフックは再利用
- Props の型定義を明確に

【出力してほしいこと】
1. 新規作成ファイル一覧と役割
2. 各コンポーネントの Props 型定義
3. 状態管理の分割方針
4. 動作確認手順
```

---

### TASK-H5: 巨大コンポーネントの分割 - タグ管理ページ

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
タグ管理ページ（/tags/page.tsx）を適切なサイズのコンポーネントに分割する。
現在3000行を超える巨大コンポーネントになっており、保守性に課題がある。

【背景】
- 現在の実装: 1ファイルに3つのタブパネル + 複数のモーダル + DnD ロジックが含まれている
- 問題点: コードの見通しが悪く、変更時の影響範囲が把握しづらい

【要件】
以下の構成でコンポーネントを分割:

```
frontend/src/app/tags/
├── page.tsx                        # メインページ（タブ制御のみ）
├── components/
│   ├── CategoriesTab.tsx           # カテゴリタブ
│   ├── TagsListTab.tsx             # タグ一覧タブ
│   ├── AutomationTab.tsx           # 自動化ルールタブ
│   ├── SortableCategoryCard.tsx    # ドラッグ可能カテゴリカード
│   ├── SortableGroupCard.tsx       # ドラッグ可能グループカード
│   ├── SortableTagItem.tsx         # ドラッグ可能タグアイテム
│   ├── CategoryModal.tsx           # カテゴリ編集モーダル
│   ├── GroupModal.tsx              # グループ編集モーダル
│   ├── TagModal.tsx                # タグ編集モーダル
│   └── AutomationRuleModal.tsx     # 自動化ルール編集モーダル
└── hooks/
    ├── useTagCategories.ts         # カテゴリデータ管理
    ├── useTagDragAndDrop.ts        # DnD ロジック
    └── useAutomationRules.ts       # 自動化ルール管理
```

【分割方針】
1. 各タブパネルを独立したコンポーネントに
2. DnD 関連のコンポーネントを分離
3. モーダルを個別コンポーネントに
4. dnd-kit のセンサー・ハンドラーをカスタムフックに

【制約】
- 機能的な変更は行わない（リファクタリングのみ）
- 既存のAPIフックは再利用
- DnD の動作を維持

【出力してほしいこと】
1. 新規作成ファイル一覧と役割
2. 各コンポーネントの Props 型定義
3. DnD ロジックの分割方針
4. 動作確認手順
```

---

### TASK-H6: 猫詳細ページの「家族」タブ強化

```text
あなたは mycats-pro プロジェクト専任の AI コーディングエージェントです。
Next.js 15（App Router）+ React 19 + NestJS 10 + Prisma 6 + PostgreSQL 15 のベストプラクティスと、
リポジトリ直下の AGENTS.md / 該当フォルダの CODE_GUIDE.md に従ってください。

【やりたいこと】
猫詳細ページ（/cats/[id]）の「家族」タブを強化し、家系図と関連猫情報を表示する。
現在、「基本情報タブの出産記録をご覧ください」というテキストのみ。

【背景】
- 現在の実装: 家族タブの内容が空
- 問題点: 家族情報へのアクセスが不便

【要件】
1. 家族タブに以下を表示:
   - 親（父猫・母猫）へのリンク
   - 兄弟姉妹一覧（同じ母猫を持つ猫）
   - 子猫一覧（この猫が親の場合）
   - 簡易家系図（3世代程度）

2. バックエンド: 家族情報取得API
   - `GET /cats/:id/family` - 親・兄弟・子の情報を一括取得

3. フロントエンド: 家族タブUI
   - 親情報カード
   - 兄弟姉妹リスト
   - 子猫リスト（メスの場合）
   - 簡易家系図コンポーネント

【対象ファイル】
- backend/src/cats/cats.controller.ts
- backend/src/cats/cats.service.ts
- frontend/src/app/cats/[id]/client.tsx
- frontend/src/components/cats/FamilyTab.tsx (新規)
- frontend/src/components/cats/SimpleFamilyTree.tsx (新規)

【制約】
- 既存の血統書の家系図コンポーネントを参考にする
- 循環参照に注意（自分自身が親に含まれないようにする）

【出力してほしいこと】
1. 変更ファイル一覧（役割付き）
2. API レスポンス形式の定義
3. 主要なコード変更点
4. 動作確認手順
```

---

## 中優先度タスク

### TASK-M1: サーバーサイドフィルタリングの活用 - 猫一覧ページ

```text
あなたは mycats-pro プロジェクト専任の AI コーディングエージェントです。
Next.js 15（App Router）+ React 19 + NestJS 10 + Prisma 6 + PostgreSQL 15 のベストプラクティスと、
リポジトリ直下の AGENTS.md / 該当フォルダの CODE_GUIDE.md に従ってください。

【やりたいこと】
猫一覧ページ（/cats）でタブに応じたサーバーサイドフィルタリングを実装する。
現在、全データを取得してクライアントでフィルタリングしている。

【背景】
- 現在の実装: `limit: 1000` で全データ取得 → クライアントでタブ別フィルタ
- 問題点: データ量増加時のパフォーマンス低下

【要件】
1. バックエンド: 既存の `GET /cats` にフィルタパラメータを追加活用
   - `gender`: MALE, FEMALE
   - `isKitten`: true/false（生後3ヶ月以内 + 母猫あり）
   - `tagName`: 養成中, 卒業予定 など
   - `isAdult`: true/false（生後6ヶ月以上）

2. フロントエンド: タブ切り替え時にクエリパラメータを送信
   - Cats タブ: `?isAdult=true`
   - Male タブ: `?gender=MALE&isAdult=true`
   - Female タブ: `?gender=FEMALE&isAdult=true`
   - Kitten タブ: `?isKitten=true`
   - Raising タブ: `?tagName=養成中`
   - Grad タブ: `?tagName=卒業予定`

3. タブカウントはサーバーサイドで計算
   - `GET /cats/statistics` を拡張してタブ別件数を返す

【対象ファイル】
- backend/src/cats/cats.controller.ts
- backend/src/cats/cats.service.ts
- backend/src/cats/dto/cat-query.dto.ts
- frontend/src/lib/api/hooks/use-cats.ts
- frontend/src/app/cats/page.tsx

【制約】
- 既存のAPIとの後方互換性を維持
- ページネーション対応も検討

【出力してほしいこと】
1. 変更ファイル一覧（役割付き）
2. クエリパラメータの仕様
3. 主要なコード変更点
4. パフォーマンス改善の見込み
```

---

### TASK-M2: 統計API の一括化 - ギャラリーページ

```text
あなたは mycats-pro プロジェクト専任の AI コーディングエージェントです。
Next.js 15（App Router）+ React 19 + NestJS 10 + Prisma 6 + PostgreSQL 15 のベストプラクティスと、
リポジトリ直下の AGENTS.md / 該当フォルダの CODE_GUIDE.md に従ってください。

【やりたいこと】
ギャラリーページのカテゴリ別件数を1回のAPIコールで取得できるようにする。
現在、4つのカテゴリそれぞれに対してAPIコールを行っている。

【背景】
- 現在の実装:
  ```tsx
  const { data: kittenData } = useGalleryEntries('KITTEN', 1, 1);
  const { data: fatherData } = useGalleryEntries('FATHER', 1, 1);
  const { data: motherData } = useGalleryEntries('MOTHER', 1, 1);
  const { data: graduationData } = useGalleryEntries('GRADUATION', 1, 1);
  ```
- 問題点: 4回のAPIコールが発生

【要件】
1. バックエンド: 統計エンドポイントを追加
   - `GET /gallery/statistics`
   - レスポンス:
     ```json
     {
       "data": {
         "KITTEN": 10,
         "FATHER": 5,
         "MOTHER": 8,
         "GRADUATION": 15
       }
     }
     ```

2. フロントエンド: 新しいフックを作成
   - `useGalleryStatistics` フックを追加
   - タブコンポーネントで使用

【対象ファイル】
- backend/src/gallery/gallery.controller.ts
- backend/src/gallery/gallery.service.ts
- frontend/src/lib/api/hooks/use-gallery.ts
- frontend/src/app/gallery/page.tsx
- frontend/src/app/gallery/components/GalleryTabs.tsx

【制約】
- 既存のAPIは維持（後方互換性）
- Prisma の `groupBy` を活用

【出力してほしいこと】
1. 変更ファイル一覧（役割付き）
2. API レスポンス形式
3. 主要なコード変更点
4. APIコール削減効果
```

---

### TASK-M3: 統計API の一括化 - 猫一覧ページ

```text
あなたは mycats-pro プロジェクト専任の AI コーディングエージェントです。
Next.js 15（App Router）+ React 19 + NestJS 10 + Prisma 6 + PostgreSQL 15 のベストプラクティスと、
リポジトリ直下の AGENTS.md / 該当フォルダの CODE_GUIDE.md に従ってください。

【やりたいこと】
猫一覧ページのタブカウントをサーバーサイドで計算し、統計APIで一括取得する。
現在、全データを取得してクライアントでカウントしている。

【背景】
- 現在の実装: クライアントサイドで各タブの件数を計算
  ```tsx
  const totalCount = adultCats.length;
  const maleCount = adultCats.filter((cat) => cat.gender === 'MALE').length;
  // ...
  ```
- 問題点: 大量データ時のパフォーマンス低下

【要件】
1. バックエンド: `GET /cats/statistics` を拡張
   - レスポンス:
     ```json
     {
       "data": {
         "total": 50,
         "male": 20,
         "female": 30,
         "kitten": 5,
         "raising": 3,
         "grad": 2
       }
     }
     ```

2. フロントエンド: 統計データを使用
   - `useGetCatStatistics` フックを拡張
   - タブカウント表示に使用

【対象ファイル】
- backend/src/cats/cats.controller.ts
- backend/src/cats/cats.service.ts
- frontend/src/lib/api/hooks/use-cats.ts
- frontend/src/app/cats/page.tsx

【制約】
- 既存の統計APIを拡張（破壊的変更なし）
- タグ名（養成中、卒業予定）はハードコードせず、設定可能に

【出力してほしいこと】
1. 変更ファイル一覧（役割付き）
2. API レスポンス形式
3. 主要なコード変更点
4. パフォーマンス改善の見込み
```

---

## 低優先度タスク

### TASK-L1: タブ状態のURL永続化 - タグ管理ページ

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
タグ管理ページ（/tags）のタブ状態をURLパラメータで永続化する。

【背景】
- 現在の実装: `<Tabs defaultValue="categories">` で固定
- 問題点: リロード時にタブ状態が失われる

【要件】
1. URLパラメータ `?tab=categories|tags|automation` でタブ状態を管理
2. タブ切り替え時にURL更新
3. 初期表示時にURLパラメータからタブを復元

【対象ファイル】
- frontend/src/app/tags/page.tsx

【参考実装】
血統書管理ページ（/pedigrees/page.tsx）の実装パターンを参考にする。

【出力してほしいこと】
1. 変更内容
2. 動作確認手順
```

---

### TASK-L2: タブ状態のURL永続化 - 猫詳細ページ

```text
あなたは mycats-pro フロントエンド専任 AI エージェントです。
Next.js 15 App Router + React 19 + Mantine + Tailwind のベストプラクティスと frontend/AGENTS.md を遵守してください。

【やりたいこと】
猫詳細ページ（/cats/[id]）のタブ状態をURLパラメータで永続化する。

【背景】
- 現在の実装: `<Tabs defaultValue="basic">` で固定
- 問題点: リロード時にタブ状態が失われる

【要件】
1. URLパラメータ `?tab=basic|family` でタブ状態を管理
2. タブ切り替え時にURL更新
3. 初期表示時にURLパラメータからタブを復元

【対象ファイル】
- frontend/src/app/cats/[id]/client.tsx

【出力してほしいこと】
1. 変更内容
2. 動作確認手順
```

---

### TASK-L3: 交配スケジュールのサーバー保存

```text
あなたは mycats-pro プロジェクト専任の AI コーディングエージェントです。
Next.js 15（App Router）+ React 19 + NestJS 10 + Prisma 6 + PostgreSQL 15 のベストプラクティスと、
リポジトリ直下の AGENTS.md / 該当フォルダの CODE_GUIDE.md に従ってください。

【やりたいこと】
交配管理ページの交配スケジュールデータをサーバーに保存し、
複数デバイス間で同期できるようにする。

【背景】
- 現在の実装: localStorage に保存
  ```tsx
  const STORAGE_KEYS = {
    BREEDING_SCHEDULE: 'breeding_schedule',
    MATING_CHECKS: 'breeding_mating_checks',
  };
  ```
- 問題点: 
  - デバイス間で同期できない
  - ブラウザデータ削除で消失
  - 他のユーザーと共有できない

【要件】
1. DB: 交配スケジュールモデルを追加
   ```prisma
   model BreedingSchedule {
     id        String   @id @default(uuid())
     maleId    String   @map("male_id")
     femaleId  String   @map("female_id")
     startDate DateTime @map("start_date")
     duration  Int      // 日数
     status    BreedingScheduleStatus @default(SCHEDULED)
     notes     String?
     recordedBy String  @map("recorded_by")
     createdAt DateTime @default(now()) @map("created_at")
     updatedAt DateTime @updatedAt @map("updated_at")
     
     male      Cat      @relation("BreedingScheduleMale", fields: [maleId], references: [id])
     female    Cat      @relation("BreedingScheduleFemale", fields: [femaleId], references: [id])
     recorder  User     @relation(fields: [recordedBy], references: [id])
     checks    MatingCheck[]
     
     @@index([maleId])
     @@index([femaleId])
     @@index([startDate])
     @@map("breeding_schedules")
   }
   
   model MatingCheck {
     id         String   @id @default(uuid())
     scheduleId String   @map("schedule_id")
     checkDate  DateTime @map("check_date")
     count      Int      @default(1)
     createdAt  DateTime @default(now()) @map("created_at")
     
     schedule   BreedingSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
     
     @@index([scheduleId])
     @@map("mating_checks")
   }
   
   enum BreedingScheduleStatus {
     SCHEDULED
     IN_PROGRESS
     COMPLETED
     CANCELLED
   }
   ```

2. バックエンド: スケジュールCRUD API
   - `GET /breeding/schedules` - スケジュール一覧
   - `POST /breeding/schedules` - スケジュール作成
   - `PATCH /breeding/schedules/:id` - スケジュール更新
   - `DELETE /breeding/schedules/:id` - スケジュール削除
   - `POST /breeding/schedules/:id/checks` - チェック追加

3. フロントエンド: localStorage から API に移行
   - 既存のlocalStorage実装を維持しつつ、API同期を追加
   - オフライン対応（localStorage をキャッシュとして使用）

【対象ファイル】
- backend/prisma/schema.prisma
- backend/src/breeding/breeding.controller.ts
- backend/src/breeding/breeding.service.ts
- backend/src/breeding/dto/breeding-schedule.dto.ts (新規)
- frontend/src/lib/api/hooks/use-breeding.ts
- frontend/src/app/breeding/page.tsx

【制約】
- 既存のlocalStorage実装との互換性を維持
- データ移行スクリプトは不要（新規データから適用）

【出力してほしいこと】
1. 変更ファイル一覧（役割付き）
2. Prisma マイグレーション内容
3. API 仕様
4. localStorage からの移行方針
5. 動作確認手順
```

---

## タスク実行順序の推奨

### フェーズ1: 基盤整備（高優先度）
1. TASK-H3: 子猫管理ページ - タブ状態のURL永続化
2. TASK-H4: 交配管理ページのコンポーネント分割
3. TASK-H5: タグ管理ページのコンポーネント分割

### フェーズ2: 機能強化（高優先度）
4. TASK-H1: 子猫専用APIエンドポイント追加
5. TASK-H2: 体重記録機能の実装
6. TASK-H6: 猫詳細ページの「家族」タブ強化

### フェーズ3: パフォーマンス最適化（中優先度）
7. TASK-M1: サーバーサイドフィルタリング - 猫一覧ページ
8. TASK-M2: 統計API一括化 - ギャラリーページ
9. TASK-M3: 統計API一括化 - 猫一覧ページ

### フェーズ4: 細部改善（低優先度）
10. TASK-L1: タブURL永続化 - タグ管理ページ
11. TASK-L2: タブURL永続化 - 猫詳細ページ
12. TASK-L3: 交配スケジュールのサーバー保存

---

## 共通の品質ゲート

各タスク完了時に以下を確認:

```bash
# Lint チェック
pnpm lint

# バックエンドビルド
pnpm backend:build

# フロントエンドビルド
pnpm frontend:build

# Prisma 変更時
pnpm db:migrate
pnpm db:seed

# テスト実行
pnpm --filter backend run test
pnpm --filter frontend run test
```

---

## 注意事項

- 各タスクは独立して実行可能だが、依存関係がある場合は推奨順序に従う
- 大規模な変更前には必ずブランチを作成
- API 変更時は OpenAPI 仕様も更新（`pnpm --filter backend run swagger:gen`）
- フロントエンドの型定義は `pnpm --filter frontend generate:api-types` で同期


