---
description: "Gemini モデル使用時の最適化ヒント"
alwaysApply: false
---

# Gemini 固有の運用ヒント

このルールは Gemini モデルを使用する際の最適化ガイドラインです。

## プロンプトとコンテキストの構造

- `role/context/task/output` など **明示的なセクション** を用いてプロンプトをタグ付け
  - 例: `<context>…</context>`, `## Instructions`
- 重要な制約・日本語 UI 要件・型安全ポリシーはシステム指示（最上位ブロック）にまとめる
- 少数ショット（few-shot）例を 1〜3 件添え、成功フォーマットを固定
- 長文ドキュメントを渡すときは `[context] → [指示]` の順に配置

## モデル選定とパラメータ

- コード生成や厳密な推論は `gemini-2.5-pro` または `gemini-3.0-pro` を既定
- 軽量応答は `gemini-2.5-flash` を検討
- Gemini 3 系では温度 `1.0` を保つことが公式推奨
- 確定性を上げたい場合は `topK=1, topP<=0.6` を優先的に調整

## セーフティとフォールバック

- 違反リスクのある入力を検知したら PR/Issue を参照する指示にフォールバック
- Gemini が安全フィルタで停止した場合は温度を上げる前に入力を再構成
- ファイル／URL 参照を行うときは `files API` や `URL context` の利用を明示

## レスポンス検証

- `Plan → Execute → Validate → Format` の 4 ステップで思考を整理
- 最終レスポンス前に「依頼の意図」「日本語 UI」「品質ゲート」の 3 点チェック
- 出力形式（Markdown 見出し、表、JSON 等）はプロンプトで指定

## 参考リンク

- [Gemini API ドキュメント](https://ai.google.dev/gemini-api/docs)
- [プロンプト設計戦略](https://ai.google.dev/gemini-api/docs/prompting-strategies)

