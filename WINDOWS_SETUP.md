# 🪟 Windows環境セットアップガイド

このガイドでは、Windows環境でMyCats Proを開発する方法を説明します。

## 📋 前提条件

### 必須ソフトウェア

1. **Node.js 20.x 以上**
   - [公式サイト](https://nodejs.org/)からダウンロード
   - インストール後、コマンドプロンプトで確認: `node --version`

2. **pnpm 9.x 以上**
   ```cmd
   npm install -g pnpm@latest
   pnpm --version
   ```

3. **Docker Desktop for Windows**
   - [公式サイト](https://www.docker.com/products/docker-desktop/)からダウンロード
   - WSL2バックエンドを有効にすることを推奨
   - インストール後、Dockerが起動していることを確認

4. **Git for Windows**
   - [公式サイト](https://git-scm.com/download/win)からダウンロード
   - Git Bashも一緒にインストールされます

## 🚀 セットアップ方法

### 方法1: WSL2を使用（推奨）

WSL2 (Windows Subsystem for Linux 2) を使用すると、Mac/Linuxと同じスクリプトがそのまま使えます。

#### WSL2のインストール

```powershell
# PowerShellを管理者として実行
wsl --install
```

再起動後、Ubuntuが起動します。

#### WSL2内でのセットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/NekoyaJolly/mycats-pro.git
cd mycats-pro

# 2. セットアップスクリプトを実行（Mac/Linuxと同じ）
bash scripts/setup-dev-docker.sh

# 3. 起動
bash scripts/start-all.sh
```

### 方法2: Windowsネイティブ環境

Windows標準のコマンドプロンプトやPowerShellを使用する場合。

#### 初回セットアップ

```cmd
# 1. リポジトリをクローン
git clone https://github.com/NekoyaJolly/mycats-pro.git
cd mycats-pro

# 2. Windows用セットアップスクリプトを実行
scripts\setup-dev-docker.bat
```

#### 起動方法

**推奨: pnpmコマンド使用**

```cmd
pnpm run dev
```

**または個別に起動**

ターミナル1（バックエンド）:
```cmd
cd backend
pnpm run start:dev
```

ターミナル2（フロントエンド）:
```cmd
cd frontend
pnpm run dev
```

### 方法3: Git Bash使用

Git for Windowsに含まれるGit Bashを使用すると、bashスクリプトが実行できます。

```bash
# Git Bashを起動
cd /c/path/to/mycats-pro

# Mac/Linuxと同じコマンドが使用可能
bash scripts/setup-dev-docker.sh
bash scripts/start-all.sh
```

## 🔧 Windows固有の設定

### 改行コード (CRLF/LF)

Gitの改行コード自動変換を設定:

```cmd
# プロジェクトルートで実行
git config core.autocrlf input
```

`.gitattributes`ファイルが自動的に改行コードを管理します。

### パスの区切り文字

Windows: `\` (バックスラッシュ)  
Unix/Mac: `/` (スラッシュ)

Node.jsは自動的に変換するため、通常は問題ありません。

### 環境変数ファイル

Windowsでも`.env`ファイルは同じ形式で使用できます:

```env
# backend/.env
DATABASE_URL=postgresql://mycats:mycats_dev_password@localhost:5433/mycats_development?schema=public
```

## 🐛 Windows固有のトラブルシューティング

### 問題: `bash: command not found`

**原因**: bashがインストールされていない

**解決策**:
- Git Bashを使用する
- WSL2をインストールする
- PowerShellまたはコマンドプロンプトで`.bat`ファイルを使用する

### 問題: Docker接続エラー

**原因**: Docker Desktopが起動していない

**解決策**:
```cmd
# Docker Desktopを起動して確認
docker ps
docker-compose ps
```

### 問題: `EACCES: permission denied`

**原因**: 管理者権限が必要

**解決策**:
- コマンドプロンプトまたはPowerShellを管理者として実行
- またはWSL2を使用

### 問題: ポートが既に使用されている

**解決策**:
```cmd
# ポートを使用しているプロセスを確認
netstat -ano | findstr :3000
netstat -ano | findstr :3004
netstat -ano | findstr :5433

# プロセスを終了
taskkill /PID <PID> /F
```

または、`kill-port`を使用（既にインストール済み）:
```cmd
npx kill-port 3000 3004 5433
```

### 問題: 改行コードのエラー

**症状**: `'\r': command not found`

**原因**: CRLFとLFの混在

**解決策**:
```cmd
# Git設定を確認
git config core.autocrlf

# inputに設定
git config core.autocrlf input

# ファイルを再チェックアウト
git rm --cached -r .
git reset --hard
```

## 📝 利用可能なコマンド

以下のコマンドはWindows環境でも使用できます:

```cmd
# 開発サーバー起動
pnpm run dev

# ビルド
pnpm run build

# データベース操作
pnpm run db:migrate
pnpm run db:seed
pnpm run db:studio

# テスト
pnpm run test:health
pnpm run test:e2e

# リント
pnpm run lint
```

## 🔍 推奨開発環境

### エディタ

**Visual Studio Code** (推奨)
- Windows用の拡張機能がすべて利用可能
- WSL2との統合が優れている
- Remote - WSL拡張機能で快適な開発が可能

### ターミナル

1. **Windows Terminal** (推奨)
   - Microsoft Storeから無料でインストール
   - タブ機能、カスタマイズ可能
   - PowerShell、コマンドプロンプト、Git Bash、WSLを統合

2. **Git Bash**
   - bashスクリプトを直接実行可能

3. **PowerShell**
   - Windows標準、強力なスクリプト機能

### Docker Desktop設定

**推奨設定**:
- WSL2バックエンドを有効化
- メモリ: 4GB以上
- CPU: 2コア以上

設定方法:
1. Docker Desktopを起動
2. Settings → Resources → WSL Integration
3. 使用するWSLディストリビューションを有効化

## 🎯 ベストプラクティス

1. **WSL2を使用する** - Mac/Linuxとの互換性が最も高い
2. **Windows Terminalを使用する** - 複数のターミナルセッションを管理しやすい
3. **VS CodeのRemote - WSL拡張機能を使用** - シームレスな開発体験
4. **Docker Desktop for WindowsでWSL2バックエンドを有効化** - パフォーマンス向上

## 🌐 アクセスURL

Windows環境でも同じURLでアクセスできます:

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:3004
- **pgAdmin**: http://localhost:5050
- **Prisma Studio**: `pnpm run db:studio`

## 📚 参考リンク

- [WSL2公式ドキュメント](https://docs.microsoft.com/ja-jp/windows/wsl/)
- [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)
- [Node.js Windows インストールガイド](https://nodejs.org/ja/download/)
- [Git for Windows](https://git-scm.com/download/win)

---

**最終更新**: 2025年10月31日
