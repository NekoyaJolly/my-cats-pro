---
applyTo: "**.md"
excludeAgent: "coding-agent"
---

# ドキュメントパス固有の指示

このファイルはすべてのマークダウンファイルに対する Copilot の動作を制御します。

## 適用範囲
- `**/*.md`
- `docs/**`
- `README.md`
- `SETUP_GUIDE.md`
- その他すべてのドキュメント

## 必須ルール

### 言語
- **すべてのドキュメントは日本語で記述**
- 技術用語は英語のまま（API、HTTP、JSON など）
- 簡潔で実務的な表現を使用
- 機械翻訳感を避ける

### フォーマット
- 見出しの階層を適切に使用（h1, h2, h3）
- コードブロックには言語を指定
- 手順は番号付きリストで明示
- 重要な情報は太字や箇条書きで強調

### コードブロック
````markdown
```typescript
// TypeScript コード例
interface Example {
  id: number;
  name: string;
}
```

```bash
# コマンド例
pnpm install
pnpm dev
```
````

## 禁止事項
- ソースコードファイルを変更しない
- ドキュメントの更新のみに集中
- 古い情報を残さない

## ドキュメントの種類

### README.md
プロジェクト全体の概要と使い方。

**必須セクション:**
- プロジェクト概要
- 技術スタック
- クイックスタート
- 主要機能
- トラブルシューティング

### SETUP_GUIDE.md
初回セットアップの詳細手順。

**含むべき内容:**
- 前提条件
- 環境変数の設定
- データベースのセットアップ
- 開発環境の起動
- 動作確認

### TROUBLESHOOTING.md
よくある問題と解決方法。

**構成:**
- 問題の説明
- 原因
- 解決方法
- 予防策

## 更新タイミング
- 新機能追加時
- API エンドポイント追加/変更時
- 環境変数追加時
- セットアップ手順変更時
- バグ修正時（トラブルシューティングに追加）

## 品質チェックリスト
- [ ] 日本語で記述されている
- [ ] 簡潔で分かりやすい
- [ ] コードブロックに言語が指定されている
- [ ] リンクが正しく機能する
- [ ] タイポがない
- [ ] フォーマットが統一されている

## ファイル配置

### ルートディレクトリ
- `README.md` - プロジェクト全体
- `SETUP_GUIDE.md` - セットアップ
- `TROUBLESHOOTING.md` - トラブル対応
- `DEPLOYMENT_*.md` - デプロイ関連

### docs/ ディレクトリ
- アーキテクチャ設計書
- データベース設計書
- 詳細な技術仕様書

### .github/ ディレクトリ
- デプロイチェックリスト
- CI/CD ガイド

## 例: README セクション

```markdown
## 🚀 クイックスタート

### 前提条件
- Node.js 20.x
- pnpm 9.x
- PostgreSQL 15+

### インストール

1. リポジトリをクローン
   ```bash
   git clone https://github.com/username/repo.git
   cd repo
   ```

2. 依存関係をインストール
   ```bash
   pnpm install
   ```

3. 環境変数を設定
   ```bash
   cp .env.example .env
   # .env を編集
   ```

4. データベースをセットアップ
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. 開発サーバーを起動
   ```bash
   pnpm dev
   ```

6. ブラウザで http://localhost:3000 を開く
```

## 参考ドキュメント
- [docs/](../docs/) - 詳細なドキュメント
- [README.md](../README.md) - プロジェクト README
