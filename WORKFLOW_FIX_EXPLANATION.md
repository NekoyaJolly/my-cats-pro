# GitHub Actions ワークフロー修正の説明

## 問題の概要

PR #71 で実装された自動デプロイワークフロー（`trigger-deploy-from-ci.yml` → `deploy-only.yml`）が正しく動作せず、すぐにスキップされてしまう問題が発生していました。

## 根本原因

`deploy-only.yml` の条件式で `github.event.inputs.environment` を使用していましたが、これは **`workflow_dispatch`（手動実行）でのみ利用可能** なコンテキストです。

一方、`trigger-deploy-from-ci.yml` からの自動実行では **`workflow_call`** トリガーを使用しており、この場合は `inputs.environment` を使用する必要があります。

### 修正前のコード（問題あり）

```yaml
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  if: github.event.inputs.environment == 'staging' || github.event.inputs.environment == 'both'
  # ↑ workflow_call では github.event.inputs は undefined となり、条件が false になる
```

### 修正後のコード（正しい）

```yaml
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  if: inputs.environment == 'staging' || inputs.environment == 'both'
  # ↑ inputs は workflow_dispatch と workflow_call の両方で動作する
```

## GitHub Actions の入力パラメータの扱い

| トリガータイプ | 入力の参照方法 | 説明 |
|--------------|--------------|------|
| `workflow_dispatch` | `inputs.environment` または `github.event.inputs.environment` | 手動実行時、両方のコンテキストが利用可能 |
| `workflow_call` | `inputs.environment` **のみ** | 他のワークフローから呼び出される場合 |

**推奨**: `inputs` コンテキストを使用することで、両方のトリガータイプで統一的に動作します。

## 修正内容

### 1. `deploy-only.yml` の条件式を修正

**変更箇所:**
- `deploy-staging` ジョブの `if` 条件
- `deploy-production` ジョブの `if` 条件

**変更内容:**
```diff
-    if: github.event.inputs.environment == 'staging' || github.event.inputs.environment == 'both'
+    if: inputs.environment == 'staging' || inputs.environment == 'both'
```

### 2. 説明コメントの追加

ワークフローファイルの jobs セクションの先頭に、`inputs.environment` の動作について説明するコメントを追加しました。

## テスト手順

### 1. 自動実行のテスト

1. main ブランチに変更をプッシュまたはマージ
2. CI/CD Pipeline (`ci-cd.yml`) が成功することを確認
3. `trigger-deploy-from-ci.yml` が自動的に起動することを確認
4. `deploy-only.yml` が実行され、スキップされずにデプロイが開始されることを確認

### 2. 手動実行のテスト

1. GitHub の Actions タブを開く
2. "Deploy Only (Staging & Production)" ワークフローを選択
3. "Run workflow" ボタンをクリック
4. 環境（staging / production / both）を選択
5. ワークフローが正常に実行されることを確認

## 期待される動作

### 自動実行時（workflow_call）

```
CI/CD Pipeline (main ブランチで成功)
  ↓
trigger-deploy-from-ci.yml が起動
  ↓
deploy-only.yml を "both" パラメータで呼び出し
  ↓
deploy-staging ジョブ実行 → staging 環境へデプロイ
  ↓
deploy-production ジョブ実行 → production 環境へデプロイ
```

### 手動実行時（workflow_dispatch）

```
GitHub UI から "Run workflow" を選択
  ↓
環境を選択（staging / production / both）
  ↓
選択した環境に応じてジョブが実行される
```

## 参考資料

- [GitHub Actions: Reusing workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [GitHub Actions: workflow_dispatch trigger](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch)
- [GitHub Actions: Contexts](https://docs.github.com/en/actions/learn-github-actions/contexts#inputs-context)
