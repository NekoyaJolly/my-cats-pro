# 血統書PDF印刷機能 設計書

## 📋 概要

WCA（World Cats Association）公式フォーマットの血統書をPDFで生成・印刷する機能の設計書。

## 🎯 要件定義

### 機能要件
- 登録済み血統書データからPDFを生成
- WCA公式フォーマットに準拠したレイアウト
- 3世代（本体 + 両親 + 祖父母 + 曾祖父母）の家系図表示
- 印刷品質: 300dpi以上推奨

### 非機能要件
- PDF生成時間: 3秒以内
- ファイルサイズ: 500KB以下
- 同時生成: 最大10件まで

## 📐 用紙仕様

### サイズ
- **幅**: 339mm
- **高さ**: 228mm
- **向き**: 横長（Landscape）
- **マージン**: 上下左右 10mm

### 印刷領域
- **有効幅**: 319mm（339 - 10×2）
- **有効高さ**: 208mm（228 - 10×2）

### 参考比較
- A4横: 297×210mm → **血統書の方が42mm幅広**
- B4横: 364×257mm → 血統書の方が小さい
- **カスタムサイズ**: 339×228mm（約B4の93%サイズ）

## 📊 データマッピング

### 基本情報エリア（ヘッダー）

| WCA項目 | DB項目（PedigreeFormData） | 備考 |
|---------|---------------------------|------|
| Breed | breedCode → breeds.name | マスタ参照 |
| Owner | ownerName | 文字列 |
| Sex | genderCode → genders.name | マスタ参照 |
| Date of birth | birthDate | YYYY-MM-DD |
| Breeder | breederName | 文字列 |
| Eyecolor | eyeColor | 文字列 |
| Color | coatColorCode → coatColors.name | マスタ参照 |
| Date of registration | registrationDate | YYYY-MM-DD |
| Litters (M) | brotherCount + sisterCount | 兄弟姉妹数合計 |
| WCA NO. | pedigreeId | 血統書番号 |

### 家系図エリア（3世代）

#### 第1世代（両親）
| 位置 | 項目 | DB項目 |
|------|------|--------|
| 1 SIRE（父） | Title + Name | fatherTitle, fatherCatName, fatherCatName2 |
|   | Color | fatherCoatColor |
|   | Eye | fatherEyeColor |
|   | JCU/Code | fatherJCU, fatherOtherCode |
| 2 DAM（母） | Title + Name | motherTitle, motherCatName, motherCatName2 |
|   | Color | motherCoatColor |
|   | Eye | motherEyeColor |
|   | JCU/Code | motherJCU, motherOtherCode |

#### 第2世代（祖父母）
| 位置 | 関係 | DB項目プレフィックス |
|------|------|---------------------|
| 3 | Father's Father | ff（例: ffTitle, ffCatName, ffCatColor, ffjcu） |
| 4 | Father's Mother | fm（例: fmTitle, fmCatName, fmCatColor, fmjcu） |
| 5 | Mother's Father | mf（例: mfTitle, mfCatName, mfCatColor, mfjcu） |
| 6 | Mother's Mother | mm（例: mmTitle, mmCatName, mmCatColor, mmjcu） |

#### 第3世代（曾祖父母）
| 位置 | 関係 | DB項目プレフィックス |
|------|------|---------------------|
| 7 | FF's Father | fff |
| 8 | FF's Mother | ffm |
| 9 | FM's Father | fmf |
| 10 | FM's Mother | fmm |
| 11 | MF's Father | mff |
| 12 | MF's Mother | mfm |
| 13 | MM's Father | mmf |
| 14 | MM's Mother | mmm |

### フッター情報
| WCA項目 | DB項目 | 備考 |
|---------|--------|------|
| Other Organizations No. | otherNo | 他団体登録番号 |
| 認証文言 | 固定テキスト | 英文テンプレート |

## 🛠️ 技術スタック

### バックエンド
```typescript
// 採用ライブラリ
{
  "pdfmake": "^0.2.x",          // PDF生成エンジン
  "@types/pdfmake": "^0.2.x"    // TypeScript型定義
}
```

### 選定理由
- ✅ TypeScript完全対応
- ✅ 複雑なレイアウト（テーブル、ネスト）が得意
- ✅ カスタムフォント・日本語対応
- ✅ メモリ効率が良い
- ✅ NestJSとの統合が容易

### 代替案との比較
| ライブラリ | 評価 | 理由 |
|-----------|------|------|
| puppeteer | △ | 重い、メモリ消費大 |
| jsPDF | △ | 複雑なレイアウトが苦手 |
| PDFKit | ○ | 良いがストリーム処理が複雑 |
| **pdfmake** | ◎ | **最適** |

## 📂 ディレクトリ構成

```
backend/
├── src/
│   ├── pedigrees/
│   │   ├── pedigrees.controller.ts      # 既存
│   │   ├── pedigrees.service.ts         # 既存
│   │   ├── pdf/
│   │   │   ├── pedigree-pdf.service.ts   # 新規: PDF生成ロジック
│   │   │   ├── templates/
│   │   │   │   └── wca-pedigree.template.ts  # 新規: WCAテンプレート
│   │   │   └── fonts/                     # 新規: カスタムフォント
│   │   │       ├── NotoSansJP-Regular.ttf
│   │   │       └── NotoSansJP-Bold.ttf
│   │   └── pedigrees.module.ts          # 既存（Provider追加）
│   └── ...
└── ...
```

## 🔌 API設計

### エンドポイント

#### 1. 単体PDF生成
```http
GET /api/pedigrees/:id/pdf
```

**リクエスト:**
```typescript
// パスパラメータ
{
  id: string  // 血統書ID（pedigreeId）
}

// クエリパラメータ（オプション）
{
  format?: 'pdf' | 'base64'  // デフォルト: pdf
  download?: boolean          // デフォルト: true
}
```

**レスポンス（成功）:**
```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="pedigree_{id}_{YYYYMMDD}.pdf"

[PDFバイナリデータ]
```

**レスポンス（エラー）:**
```json
{
  "statusCode": 404,
  "message": "Pedigree not found",
  "error": "Not Found"
}
```

#### 2. プレビュー用Base64取得
```http
GET /api/pedigrees/:id/pdf?format=base64
```

**レスポンス:**
```json
{
  "pedigreeId": "WCA12345",
  "format": "base64",
  "data": "JVBERi0xLjMKJcTl8uXrp...",
  "filename": "pedigree_WCA12345_20251211.pdf"
}
```

#### 3. 一括PDF生成（将来実装）
```http
POST /api/pedigrees/bulk-pdf
```

**リクエストボディ:**
```json
{
  "pedigreeIds": ["WCA12345", "WCA12346"],
  "format": "zip"
}
```

## 📝 実装フェーズ

### Phase 1: 基礎実装（1-2日）
- [x] pdfmakeインストール
- [ ] PedigreePdfServiceクラス作成
- [ ] 基本的なPDF生成ロジック
- [ ] エンドポイント実装
- [ ] シンプルなテンプレート（テキストのみ）

**ゴール:** 最低限のPDF出力ができる

### Phase 2: レイアウト実装（2-3日）
- [ ] WCA公式レイアウトの再現
  - [ ] ヘッダーデザイン（CERTIFIED PEDIGREE）
  - [ ] 基本情報エリア（2行レイアウト）
  - [ ] 家系図テーブル（3列構成）
  - [ ] フッターエリア
- [ ] 罫線・ボーダーの配置
- [ ] フォント・サイズ調整

**ゴール:** 見た目がWCA公式に近づく

### Phase 3: データ統合（1日）
- [ ] マスタデータの参照
  - [ ] breeds（品種）
  - [ ] coatColors（毛色）
  - [ ] genders（性別）
- [ ] 日付フォーマット
- [ ] 空欄処理（未入力項目）

**ゴール:** 実データで正しく出力される

### Phase 4: フロントエンド連携（1日）
- [ ] 印刷ボタン追加
  - [ ] PedigreeList（一覧画面）
  - [ ] 詳細画面（将来実装時）
- [ ] ダウンロード処理
- [ ] ローディング表示
- [ ] エラーハンドリング

**ゴール:** ユーザーが実際に使える

### Phase 5: 品質向上（1-2日）
- [ ] 日本語フォント最適化
- [ ] 印刷品質確認（実機テスト）
- [ ] エラーハンドリング強化
- [ ] パフォーマンス最適化
- [ ] ユニットテスト作成

**ゴール:** プロダクション品質

### Phase 6: 拡張機能（オプション）
- [ ] テンプレート選択機能
- [ ] 一括PDF生成
- [ ] 透かし（DRAFT/COPY）追加
- [ ] PDF暗号化
- [ ] 印刷履歴記録

## 🎨 PDFレイアウト詳細

### ページ設定
```typescript
const pageConfig = {
  pageSize: {
    width: 339,   // mm
    height: 228,  // mm
  },
  pageOrientation: 'landscape',
  pageMargins: [10, 10, 10, 10], // mm: [left, top, right, bottom]
};
```

### セクション分割
```
┌─────────────────────────────────────────────────────────┐
│ Header (50mm)                                            │
│  - CERTIFIED PEDIGREE ロゴ                               │
│  - 基本情報2行                                            │
│  - WCA NO. バナー                                        │
├─────────────────────────────────────────────────────────┤
│ Family Tree (140mm)                                      │
│  ┌─────────┬────────────┬──────────────────────┐       │
│  │ PARENTS │ GRAND      │ GREAT GRAND PARENTS  │       │
│  │ (60mm)  │ PARENTS    │ (140mm)              │       │
│  │         │ (90mm)     │                      │       │
│  └─────────┴────────────┴──────────────────────┘       │
├─────────────────────────────────────────────────────────┤
│ Footer (18mm)                                            │
│  - Other Organizations No.                               │
│  - 認証文言                                               │
│  - WCA ロゴ（右下）                                       │
└─────────────────────────────────────────────────────────┘
```

### フォント設定
```typescript
const fonts = {
  NotoSansJP: {
    normal: 'fonts/NotoSansJP-Regular.ttf',
    bold: 'fonts/NotoSansJP-Bold.ttf',
  },
};

const styles = {
  header: { fontSize: 18, bold: true, alignment: 'center' },
  subheader: { fontSize: 10, alignment: 'center' },
  label: { fontSize: 8, color: '#666' },
  value: { fontSize: 9, bold: true },
  familyTreeName: { fontSize: 8 },
  footer: { fontSize: 7, italics: true },
};
```

## 🔒 セキュリティ考慮事項

1. **アクセス制御**
   - 自分のテナントの血統書のみ生成可能
   - JWTトークン必須

2. **レート制限**
   - 同一ユーザー: 10回/分まで
   - 同一IP: 30回/分まで

3. **バリデーション**
   - 血統書IDの存在チェック
   - 不正なパラメータ拒否

4. **データ保護**
   - 生成したPDFは一時的にメモリ保持
   - ディスクへの保存は行わない（オプション機能として将来検討）

## 🧪 テスト計画

### ユニットテスト
- [ ] PedigreePdfService.generatePdf()
- [ ] データマッピング関数
- [ ] 日付フォーマット関数
- [ ] エラーハンドリング

### 統合テスト
- [ ] エンドポイント: GET /api/pedigrees/:id/pdf
- [ ] マスタデータ参照
- [ ] 存在しない血統書ID
- [ ] 権限チェック

### 手動テスト
- [ ] 実際の用紙に印刷して位置確認
- [ ] 各ブラウザでのダウンロード動作
- [ ] 長い名前・特殊文字の表示
- [ ] 空欄項目の表示

## 📊 パフォーマンス目標

| 指標 | 目標値 | 測定方法 |
|------|--------|----------|
| PDF生成時間 | < 3秒 | サーバーログ |
| ファイルサイズ | < 500KB | 生成後のファイルサイズ |
| 同時リクエスト | 10件 | 負荷テスト |
| メモリ使用量 | < 50MB/リクエスト | プロファイリング |

## 🚀 デプロイ前チェックリスト

- [ ] フォントファイルをリポジトリに含める（ライセンス確認）
- [ ] 環境変数設定（必要な場合）
- [ ] エラーログ設定
- [ ] 本番環境での印刷テスト
- [ ] ドキュメント更新（README、API仕様書）

## 📚 参考資料

### WCA公式情報
- 公式サイト: https://worldcats.org/
- 血統書サンプル: （実物スキャン画像）

### 技術ドキュメント
- pdfmake公式: http://pdfmake.org/
- NestJS File Response: https://docs.nestjs.com/techniques/file-upload

## 🔄 更新履歴

| 日付 | 版 | 変更内容 | 担当 |
|------|-----|----------|------|
| 2025-12-11 | 1.0 | 初版作成 | - |

---

**次のステップ:** Phase 1の実装を開始
