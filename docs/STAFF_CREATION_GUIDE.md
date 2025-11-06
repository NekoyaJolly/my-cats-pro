# スタッフ作成機能 - 使い方ガイド

## 実装完了した機能

### フロントエンド
- ✅ スタッフ作成モーダル
- ✅ フォームバリデーション
- ✅ バックエンドAPI連携
- ✅ リアルタイムリスト更新
- ✅ 成功/エラー通知

### バックエンド
- ✅ POST `/api/v1/staff` エンドポイント
- ✅ DTOバリデーション
- ✅ データベース保存

## 使用方法

### 1. サーバー起動

**バックエンド** (ターミナル1)
```bash
cd backend
pnpm run start:dev
```

**フロントエンド** (ターミナル2)
```bash
cd frontend
pnpm run dev
```

### 2. スタッフ作成

1. ブラウザで `http://localhost:3000/staff/shifts` を開く
2. 右上の「スタッフ追加」ボタンをクリック
3. モーダルが開く

**入力項目:**
- **名前** (必須): スタッフの氏名
- **メールアドレス** (任意): メール形式で入力
- **役職** (任意): デフォルト「スタッフ」
- **表示カラー** (必須): デフォルト `#4dabf7`、10色のプリセットから選択可能

4. 「作成」ボタンをクリック
5. 成功すると:
   - モーダルが閉じる
   - 左サイドバーのスタッフリストに追加される
   - 緑色の成功通知が表示される
   - ドラッグ可能になる

### 3. ドラッグ&ドロップでシフト作成

作成したスタッフカードをカレンダーにドラッグ&ドロップすると、自動的にシフトが作成されます。

## バリデーションルール

### フロントエンド
- **名前**: 空欄不可
- **メール**: 形式チェック（入力がある場合のみ）

### バックエンド (DTO)
- **name**: `@IsString()` - 文字列必須
- **email**: `@IsEmail()` `@IsOptional()` - メール形式（任意）
- **role**: `@IsString()` `@IsOptional()` - デフォルト「スタッフ」
- **color**: `@IsString()` `@IsOptional()` - デフォルト `#4dabf7`

## API仕様

### スタッフ作成

**エンドポイント:** `POST http://localhost:3004/api/v1/staff`

**リクエストボディ:**
```json
{
  "name": "田中 太郎",
  "email": "tanaka@example.com",
  "role": "ブリーダー",
  "color": "#4c6ef5"
}
```

**レスポンス (成功):**
```json
{
  "id": "uuid-string",
  "name": "田中 太郎",
  "email": "tanaka@example.com",
  "role": "ブリーダー",
  "color": "#4c6ef5",
  "isActive": true,
  "userId": null,
  "user": null,
  "createdAt": "2025-11-07T...",
  "updatedAt": "2025-11-07T..."
}
```

**レスポンス (エラー):**
```json
{
  "statusCode": 400,
  "message": ["name should not be empty"],
  "error": "Bad Request"
}
```

## curlでのテスト

```bash
# スタッフ作成
curl -X POST http://localhost:3004/api/v1/staff \
  -H "Content-Type: application/json" \
  -d '{
    "name": "テストスタッフ",
    "email": "test@example.com",
    "role": "テスター",
    "color": "#3b82f6"
  }'

# スタッフ一覧取得
curl http://localhost:3004/api/v1/staff
```

## トラブルシューティング

### エラー: "Failed to connect to localhost port 3004"
→ バックエンドが起動していません。`cd backend && pnpm run start:dev` を実行してください。

### エラー: "スタッフの作成に失敗しました"
→ ブラウザのコンソールでエラーメッセージを確認してください。

### スタッフがリストに表示されない
→ ページをリロードするか、モーダルを再度開いて作成してください。

## 今後の拡張予定

- [ ] スタッフ編集機能
- [ ] スタッフ削除機能（論理削除）
- [ ] スタッフ検索・フィルター
- [ ] スタッフ詳細ページ
- [ ] User連携機能
- [ ] バックエンドAPIからの初期データ取得（現在はモックデータ）
