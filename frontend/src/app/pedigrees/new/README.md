# 血統書登録フォーム (Pedigree Registration Form)

## 概要
Access設計準拠の血統書登録フォーム。79フィールド（基本情報17 + 血統情報62）に対応。

## 型安全性について

### 現在の実装
- **型定義**: 完全に型付けされています
- **API呼び出し**: `@ts-expect-error`を使用して一時的に型チェックをスキップ
- **理由**: OpenAPI型定義が未生成のため

### 完全な型安全性を実現する方法

#### 1. OpenAPI型定義を生成
```bash
# フロントエンドディレクトリで実行
cd frontend
pnpm run generate:api-types
```

このコマンドは以下を実行します:
- `backend/openapi.json`から型定義を生成
- `src/lib/api/generated/schema.ts`に出力
- `paths`と`operations`型がエクスポートされる

#### 2. 生成後の対応
`page.tsx`内の`@ts-expect-error`コメントを削除すると、完全な型安全性が得られます:

**修正前:**
```typescript
const getBreeds = async (params?: { limit?: string }): Promise<ApiResponse<BreedsResponse>> => {
  // @ts-expect-error - OpenAPI型定義が未生成
  return await apiClient.get('/breeds', params ? { query: params } : undefined);
};
```

**修正後:**
```typescript
const getBreeds = async (params?: { limit?: string }): Promise<ApiResponse<BreedsResponse>> => {
  return await apiClient.get('/breeds', params ? { query: params } : undefined);
};
```

#### 3. メリット
- ✅ コンパイル時にAPIエンドポイントの存在を検証
- ✅ レスポンス型の自動補完
- ✅ リクエストパラメータの型チェック
- ✅ リファクタリング時の安全性向上

## API エンドポイント

### マスタデータ
- `GET /breeds` - 品種一覧
- `GET /coat-colors` - 毛色一覧
- `GET /master/genders` - 性別一覧（認証不要）

### 血統書
- `GET /pedigrees/pedigree-id/:id` - 血統書番号で検索（Call ID機能）
- `POST /pedigrees` - 新規登録（認証必須）

## Call ID機能
血統書番号を入力すると、800msのデバウンス後に自動検索し、血統情報を自動入力します。

### 入力パターン
1. **両親ID呼出**: 父親と母親の血統情報を一括取得（62フィールド）
2. **父親ID呼出**: 父親と父方祖父母の情報を取得（15フィールド）
3. **母親ID呼出**: 母親と母方祖父母の情報を取得（15フィールド）

## データ構造

### 基本情報 (17フィールド)
- pedigreeId, title, catName, catName2
- breedCode, genderCode, eyeColor, coatColorCode
- birthDate, breederName, ownerName, registrationDate
- brotherCount, sisterCount, notes, notes2, otherNo

### 血統情報 (62フィールド)
#### 第1世代 (14フィールド)
- 父親: fatherTitle, fatherCatName, fatherCatName2, fatherCoatColor, fatherEyeColor, fatherJCU, fatherOtherCode
- 母親: motherTitle, motherCatName, motherCatName2, motherCoatColor, motherEyeColor, motherJCU, motherOtherCode

#### 第2世代 (16フィールド)
- FF, FM, MF, MM × (Title, CatName, CatColor, jcu)

#### 第3世代 (32フィールド)
- FFF, FFM, FMF, FMM, MFF, MFM, MMF, MMM × (Title, CatName, CatColor, jcu)

## 認証
- `apiClient`を使用して自動的にJWTトークンを付与
- ログインが必要: `/login`

## トラブルシューティング

### マスタデータが取得できない
→ マスタデータが未登録の場合は正常です。品種/毛色/性別を事前に登録してください。

### 403 Forbiddenエラー
→ ログインしてください。`apiClient`が自動的にトークンを付与します。

### 型エラーが発生する
→ OpenAPI型定義を生成してください: `pnpm run generate:api-types`
