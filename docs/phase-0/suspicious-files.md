# 不審ファイルレポート

調査日: 2026-04-14
調査対象: frontend/ 配下全体

## サマリー

- バックアップファイル（*.bak, *.old, *.tmp）: 0件
- TODO/FIXME 残存: 0件（検出なし）
- 大量コメントアウト: 0件（検出なし）
- 削除推奨: 5件
- 移行後削除推奨: 1件
- 配置見直し推奨: 2件
- セキュリティ確認推奨: 1件

> コードベース全体としては比較的クリーン。バックアップファイル・TODO残存・コメントアウト問題はなし。

---

## 🔴 削除推奨（5件）

### 1. `frontend/src/components/dashboard/DialMenuV2.module.css`
- **問題**: 「V2」を含むCSSモジュールだが、対応する `DialMenuV2.tsx` が存在しない
- **状態**: どこからもインポートされておらず完全未使用
- **推定**: `DialNavigation.tsx` が後継。古い開発段階の残骸
- **最終更新**: 2025-12-01
- **Neko判定**: □削除 □残す □保留

### 2. `frontend/src/components/dashboard/DialWheel.tsx` + `DialWheel.module.css`
- **問題**: DialWheel コンポーネント（462行）がプロジェクト内のどこからもインポートされていない
- **状態**: `DialNavigation.tsx` が `app/page.tsx` から使用されている。DialWheel はiPodホイール風UIの初期実装
- **推定**: DialNavigation に置き換えられた旧実装
- **最終更新**: 2025-12-01
- **Neko判定**: □削除 □残す □保留

### 3. `frontend/src/lib/master-data/constants.ts`
- **問題**: 完全に空のファイル（0行）
- **状態**: どこからもインポートされていない
- **最終更新**: 2025-11-18
- **Neko判定**: □削除 □残す □保留

### 4. `frontend/src/lib/api/auth-store.ts`
- **問題**: 1行の再エクスポートファイル（`export * from '../auth/store';`）
- **状態**: どこからもインポートされていない。`auth/store.ts` への直接参照に統一済みと推定
- **最終更新**: 2025-10-11
- **Neko判定**: □削除 □残す □保留

---

## 🟡 移行後に削除推奨（1件）

### 5. `frontend/src/lib/api.ts`（deprecated レガシーAPI）
- **問題**: 冒頭に `@deprecated` コメントがあり「新規コードでは `src/lib/api/client.ts` を利用してください」と明記
- **現状**: 以下2ファイルがまだ旧 `api.ts` の `apiGet` をインポートしている:
  - `frontend/src/app/pedigrees/[id]/client.tsx`
  - `frontend/src/app/pedigrees/[id]/family-tree/client.tsx`
- **推奨アクション**: 上記2ファイルを `api/client.ts` に移行した上で `api.ts` を削除
- **最終更新**: 2025-12-18
- **Neko判定**: □移行+削除 □残す □保留

---

## 🟡 配置見直し推奨（2件）

### 6. `frontend/src/app/CodeCitations.md`
- **問題**: `src/app/` 配下に置かれた Markdown ファイル（108行）
- **内容**: コード引用のライセンス情報
- **推奨**: App Router のルーティングに影響はないが、`docs/` や `.artifacts/` の方が適切
- **最終更新**: 2025-11-13
- **Neko判定**: □移動 □残す □保留

### 7. `frontend/src/components/README.md`
- **問題**: コンポーネントのドキュメント（111行）。5ヶ月以上更新なし
- **推奨**: 内容が現状と乖離している可能性あり。内容見直しまたは `docs/` への移動
- **最終更新**: 2025-11-07
- **Neko判定**: □更新 □移動 □削除 □保留

---

## ⚠️ セキュリティ確認推奨（1件）

### 8. `frontend/src/app/api/debug-version/route.ts`
- **問題**: デバッグ用APIエンドポイント。ビルドバージョン情報（Git SHA、ビルド時刻、NODE_ENV、API URL等）を返す
- **リスク**: 本番環境で環境情報を公開する潜在的セキュリティリスク
- **推奨**: 本番環境では認証付きにするか、デプロイ時に無効化
- **最終更新**: 2026-02-14
- **Neko判定**: ■本番無効化

---

## ✅ 検出されなかった問題

| 項目 | 結果 |
|---|---|
| バックアップファイル（*.bak, *.old, *.tmp, *~） | なし |
| バージョン違いファイル（*-copy, *-old, *-new） | なし（DialMenuV2 除く） |
| 古い TODO/FIXME | なし |
| 大量コメントアウトコード | なし |
| 同名の重複実装（Modal.tsx と Modal2.tsx 等） | なし |
