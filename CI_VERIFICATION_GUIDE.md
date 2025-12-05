# CI/CD Pipeline 検証手順

## このPRをマージした後の確認手順

### 1. GitHub Actions の確認

PRをmainブランチにマージした後、以下を確認してください：

1. GitHub の Actions タブを開く
2. 最新のワークフロー実行を確認
3. `security-scan` ジョブが成功していることを確認

```bash
✅ security-scan
  ├─ Run Trivy vulnerability scanner
  ├─ Upload Trivy scan results to GitHub Security tab
  └─ Check for critical vulnerabilities ✓
```

### 2. 期待される出力

`Check for critical vulnerabilities` ステップで以下のメッセージが表示されるはずです：

```
🔍 Scanning for critical and high severity vulnerabilities...
✅ No critical or high severity vulnerabilities found
```

### 3. トラブルシューティング

もし `security-scan` ジョブが失敗した場合：

#### ケース1: 新しいCVEが検出された

```bash
# ローカルで確認
trivy fs --severity CRITICAL,HIGH .

# 新しいCVEが表示されたら、調査して .trivyignore に追加
```

#### ケース2: .trivyignore が認識されない

```bash
# ファイルが正しく配置されているか確認
ls -la .trivyignore

# 内容を確認
cat .trivyignore
```

#### ケース3: 既知のCVEが再度検出される

Trivyのデータベースが更新されている可能性があります。
以下を確認：

1. CVEが実際に修正されているか再確認
2. パッケージのバージョンが正しいか確認
3. 必要に応じて .trivyignore のコメントを更新

### 4. Security タブの確認

1. GitHub リポジトリの Security タブを開く
2. "Vulnerability alerts" セクションを確認
3. アクティブなアラートがないことを確認

### 5. 後続のジョブ確認

`security-scan` が成功した後、以下のジョブも成功することを確認：

```
✅ lint-and-typecheck (depends on: security-scan)
✅ unit-test (depends on: lint-and-typecheck)
✅ e2e-test (depends on: unit-test)
✅ build (depends on: e2e-test)
✅ cloud-run-validation (depends on: build)
✅ deployment-readiness (depends on: cloud-run-validation)
```

### 6. デプロイ準備確認

最後の `deployment-readiness` ジョブで以下のメッセージが表示されることを確認：

```
✅ All CI/CD checks passed
✅ Dockerfiles validated
✅ Container images scanned for vulnerabilities
✅ Cloud Run compatibility verified
✅ Health checks working
🚀 Ready for production deployment
```

## 定期的なメンテナンス

### 月次チェック

- [ ] 新しいCVEが発行されていないか確認
- [ ] 依存関係のアップデートを検討
- [ ] .trivyignore の各エントリが依然として妥当か確認

### 四半期チェック

- [ ] すべての依存関係を最新の安定版に更新
- [ ] Trivy のバージョンを最新に更新
- [ ] セキュリティスキャンの設定を見直し

## 追加情報

### Trivy のローカル実行

```bash
# インストール
brew install aquasecurity/trivy/trivy

# スキャン実行
trivy fs --severity CRITICAL,HIGH .

# ignore ファイルを使用
trivy fs --severity CRITICAL,HIGH --ignorefile .trivyignore .
```

### 依存関係の確認

```bash
# pnpm を使用して依存関係を確認
pnpm list --depth=1

# 特定のパッケージのバージョンを確認
pnpm list express
pnpm list path-to-regexp
pnpm list cookie
```

### CVE 情報の確認

- GitHub Advisory Database: https://github.com/advisories
- NVD: https://nvd.nist.gov/
- Snyk Vulnerability DB: https://security.snyk.io/

## サポート

問題が発生した場合は、以下のドキュメントを参照してください：

- `SECURITY_SCAN_FIX.md` - 詳細な修正レポート
- `.trivyignore` - 無視するCVEのリスト（コメント付き）
- `AGENTS.md` - プロジェクト全体のガイドライン

---

**最終更新:** 2025-12-05
