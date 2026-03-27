# my-cats-pro 修正・実装計画

## 1. 不要な機能の削除（優先度：高）
本番環境で不要なデモ用ページ・コンポーネント、または公開すべきではないAPIを削除・制限します。

### 1.1 デモ用コンポーネントの削除
- `frontend/src/components/cards/CardSpreadDemo.tsx`
- `frontend/src/components/dashboard/DialNavigationExample.tsx`
- `frontend/src/components/common/UnifiedModalSectionsDemo.tsx`
※ `DialWheel` は実際のダッシュボード設定で使われている可能性があるため保持を検討、使われていなければ削除。

### 1.2 本番環境で公開すべきでないAPIエンドポイントの制限
- `backend/src/pedigree/pedigree.controller.ts` の `@Public()` 指定
  - `// TODO: 本番リリース前に削除 - @Public()は開発環境専用` と記載されている部分を修正。
  - `update` と `remove` メソッドの `@Public()` を削除し、認証・認可を正しく機能させる。

## 2. 未実装部分（プレースホルダー）の実装・補完（優先度：高〜中）
「準備中」「今後実装」となっている部分を、要件に合わせて実装または適切なUIに置き換えます。

### 2.1 子猫管理ページ (`frontend/src/app/kittens/page.tsx`)
現状は「今後実装予定」のテキストのみ。
- **対応案**: すでに `frontend/src/components/kittens/` 以下にコンポーネント群（`KittenManagementModal`, `WeightRecordTable` など）が存在し、`breeding/page.tsx` からも利用されている。
- `kittens/page.tsx` では、全子猫の一覧表示（`useGetCats` 等でフィルタリング）と、そこからの体重管理や処遇管理（`KittenManagementModal` の呼び出し）ができるような一覧画面を実装する。

### 2.2 ギャラリー編集モーダル (`frontend/src/app/gallery/page.tsx`)
- `handleEditClick` に `// TODO: 編集モーダルを実装` とある。
- **対応案**: 既存の `GalleryAddModal` を拡張するか、新しく `GalleryEditModal` を作成し、タイトルやカテゴリの変更ができるようにする。

### 2.3 ケアページのスケジュールバリデーションとAPI連携 (`frontend/src/app/care/page.tsx`)
- `// TODO: スケジュールバリデーションを追加`
- `// TODO: 新しいAPIに合わせて送信処理を更新`
- **対応案**: バリデーション（必須項目のチェックなど）を追加し、複数猫IDに対応したリクエスト送信処理を正しく実装する。

### 2.4 APIクライアントの localStorage 依存解消 (`frontend/src/lib/api/client.ts`)
- `TODO (P1 - High Priority): Migrate to HttpOnly cookies`
- **対応案**: 現状の `localStorage` への保存を削除し、すでに実装されている `setCookie` / `getCookie` のみに依存するように修正する。

### 2.5 メール送信のTODO (`backend/src/auth/auth.service.ts`)
- パスワードリセットの `// TODO: メール送信実装`
- **対応案**: すでに `EmailService` (`sendPasswordResetEmail`) が実装されているため、`auth.service.ts` で `EmailService` を注入し、本番環境でメール送信が実行されるようにする。

## 3. 次のアクション
1. **フェーズ3** に進み、上記の修正を順番に実行する。
2. 実行後、ローカルでビルドやテストが通るか確認する。
3. 最後に `skill-creator` を用いて、この「未実装・不要機能の洗い出しと修正」プロセスを自動化・再現できるスキルを作成する。
