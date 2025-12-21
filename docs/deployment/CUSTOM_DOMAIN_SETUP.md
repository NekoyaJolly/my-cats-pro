# カスタムドメイン設定ガイド (nekoya.co.jp)

このドキュメントは、GCP上のCloud Runサービスにカスタムドメイン `nekoya.co.jp` を設定する手順を説明します。

## 前提条件

- ✅ ドメイン `nekoya.co.jp` をお名前.comで取得済み
- ✅ GCPプロジェクト `my-cats-pro` が稼働中
- ✅ Cloud Runサービス (backend/frontend) がデプロイ済み

## アーキテクチャ

```
[お名前.com DNS] → [Google Load Balancer] → [Cloud Run Services]
                         ↓
                   [Google Managed SSL]
```

### URL設計
- `https://nekoya.co.jp` → フロントエンド
- `https://api.nekoya.co.jp` → バックエンドAPI

---

## ステップ1: 静的IPアドレスの予約

```bash
# グローバル静的IPアドレスを予約
gcloud compute addresses create mycats-pro-lb-ip \
  --ip-version=IPV4 \
  --global

# IPアドレスを確認
gcloud compute addresses describe mycats-pro-lb-ip --global --format="get(address)"
```

**このIPアドレスをメモしてください** (例: `34.120.123.45`)

---

## ステップ2: Serverless NEGの作成

Cloud Runサービスへトラフィックを転送するためのNetwork Endpoint Group (NEG) を作成します。

### フロントエンド用NEG

```bash
gcloud compute network-endpoint-groups create mycats-frontend-neg \
  --region=asia-northeast1 \
  --network-endpoint-type=SERVERLESS \
  --cloud-run-service=mycats-pro-frontend
```

### バックエンド用NEG

```bash
gcloud compute network-endpoint-groups create mycats-backend-neg \
  --region=asia-northeast1 \
  --network-endpoint-type=SERVERLESS \
  --cloud-run-service=mycats-pro-backend
```

---

## ステップ3: バックエンドサービスの作成

### フロントエンド用バックエンドサービス

```bash
gcloud compute backend-services create mycats-frontend-backend \
  --global \
  --load-balancing-scheme=EXTERNAL_MANAGED

gcloud compute backend-services add-backend mycats-frontend-backend \
  --global \
  --network-endpoint-group=mycats-frontend-neg \
  --network-endpoint-group-region=asia-northeast1
```

### バックエンドAPI用バックエンドサービス

```bash
gcloud compute backend-services create mycats-backend-backend \
  --global \
  --load-balancing-scheme=EXTERNAL_MANAGED

gcloud compute backend-services add-backend mycats-backend-backend \
  --global \
  --network-endpoint-group=mycats-backend-neg \
  --network-endpoint-group-region=asia-northeast1
```

---

## ステップ4: URLマップの作成

トラフィックをルーティングするURLマップを作成します。

```bash
# URLマップを作成 (デフォルトはフロントエンド)
gcloud compute url-maps create mycats-lb-urlmap \
  --default-service=mycats-frontend-backend

# /api/* をバックエンドに振り分けるパスマッチャーを追加
gcloud compute url-maps add-path-matcher mycats-lb-urlmap \
  --path-matcher-name=api-matcher \
  --default-service=mycats-frontend-backend \
  --backend-service-path-rules="/api/*=mycats-backend-backend"
```

---

## ステップ5: SSL証明書の作成

Google Managed SSL証明書を作成します。

```bash
# メインドメイン用SSL証明書
gcloud compute ssl-certificates create mycats-ssl-cert \
  --domains=nekoya.co.jp,www.nekoya.co.jp,api.nekoya.co.jp \
  --global
```

**注意**: SSL証明書のプロビジョニングには **15分〜24時間** かかります。DNS設定完了後に自動的に発行されます。

---

## ステップ6: HTTPSプロキシの作成

```bash
gcloud compute target-https-proxies create mycats-https-proxy \
  --url-map=mycats-lb-urlmap \
  --ssl-certificates=mycats-ssl-cert
```

---

## ステップ7: 転送ルールの作成

```bash
gcloud compute forwarding-rules create mycats-https-forwarding-rule \
  --global \
  --load-balancing-scheme=EXTERNAL_MANAGED \
  --address=mycats-pro-lb-ip \
  --target-https-proxy=mycats-https-proxy \
  --ports=443
```

---

## ステップ8: HTTP → HTTPS リダイレクト設定

```bash
# HTTPリダイレクト用URLマップ
gcloud compute url-maps import mycats-http-redirect \
  --global \
  --source=- <<EOF
kind: compute#urlMap
name: mycats-http-redirect
defaultUrlRedirect:
  httpsRedirect: true
  redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
EOF

# HTTPプロキシ
gcloud compute target-http-proxies create mycats-http-proxy \
  --url-map=mycats-http-redirect

# HTTP転送ルール
gcloud compute forwarding-rules create mycats-http-forwarding-rule \
  --global \
  --load-balancing-scheme=EXTERNAL_MANAGED \
  --address=mycats-pro-lb-ip \
  --target-http-proxy=mycats-http-proxy \
  --ports=80
```

---

## ステップ9: お名前.comでDNS設定

### 9-1. お名前.comにログイン

https://www.onamae.com/ にアクセスし、管理画面にログイン

### 9-2. DNS設定画面へ移動

1. ドメイン一覧から `nekoya.co.jp` を選択
2. 「DNS関連機能の設定」をクリック
3. 「DNSレコード設定を利用する」を選択

### 9-3. Aレコードを追加

以下のレコードを追加してください：

| ホスト名 | TYPE | TTL | VALUE |
|---------|------|-----|-------|
| (空欄) | A | 3600 | `<ステップ1で取得したIP>` |
| www | A | 3600 | `<ステップ1で取得したIP>` |
| api | A | 3600 | `<ステップ1で取得したIP>` |

**例**:
```
nekoya.co.jp.     A    3600    34.120.123.45
www.nekoya.co.jp. A    3600    34.120.123.45
api.nekoya.co.jp. A    3600    34.120.123.45
```

### 9-4. 設定を保存

「追加」→「確認画面へ進む」→「設定する」

---

## ステップ10: SSL証明書のプロビジョニング確認

DNS設定後、SSL証明書が自動的にプロビジョニングされます。

```bash
# SSL証明書の状態を確認
gcloud compute ssl-certificates describe mycats-ssl-cert --global

# 状態が ACTIVE になるまで待機
watch -n 60 'gcloud compute ssl-certificates describe mycats-ssl-cert --global --format="get(managed.status)"'
```

**ステータス**:
- `PROVISIONING` → プロビジョニング中 (DNS反映待ち)
- `ACTIVE` → 証明書発行完了 ✅

---

## ステップ11: Cloud Runサービスの環境変数更新

独自ドメイン使用に伴い、CORS設定を更新します。

### バックエンド

```bash
gcloud run services update mycats-pro-backend \
  --region=asia-northeast1 \
  --set-env-vars="CORS_ORIGIN=https://nekoya.co.jp,https://www.nekoya.co.jp"
```

### フロントエンド

```bash
# 次回デプロイ時にcloudbuild.yamlで以下を設定
# _NEXT_PUBLIC_API_URL=https://api.nekoya.co.jp/api/v1
```

---

## ステップ12: 動作確認

### DNSが正しく解決されるか確認

```bash
nslookup nekoya.co.jp
nslookup api.nekoya.co.jp
```

### HTTPSアクセス確認

```bash
# フロントエンド
curl -I https://nekoya.co.jp

# バックエンドAPI
curl -I https://api.nekoya.co.jp/api/v1/health
```

### ブラウザでアクセス

- https://nekoya.co.jp
- https://api.nekoya.co.jp/api/v1/health

---

## トラブルシューティング

### SSL証明書が `FAILED_NOT_VISIBLE` の場合

**原因**: DNSレコードが正しく設定されていない

**解決**:
```bash
# DNSの伝播を確認
dig nekoya.co.jp +short
dig api.nekoya.co.jp +short

# お名前.comの設定を再確認
```

### 502 Bad Gateway エラー

**原因**: Cloud Runサービスが応答していない

**解決**:
```bash
# Cloud Runサービスの状態確認
gcloud run services describe mycats-pro-frontend --region=asia-northeast1
gcloud run services describe mycats-pro-backend --region=asia-northeast1

# ログ確認
gcloud run services logs read mycats-pro-backend --region=asia-northeast1 --limit=100
```

### CORSエラー

**原因**: バックエンドのCORS設定が古いドメインのまま

**解決**:
```bash
# CORS設定を更新 (ステップ11参照)
gcloud run services update mycats-pro-backend \
  --region=asia-northeast1 \
  --set-env-vars="CORS_ORIGIN=https://nekoya.co.jp,https://www.nekoya.co.jp"
```

---

## 参考資料

- [Google Cloud Load Balancing - Serverless NEG](https://cloud.google.com/load-balancing/docs/https/setup-global-ext-https-serverless)
- [Google Managed SSL certificates](https://cloud.google.com/load-balancing/docs/ssl-certificates/google-managed-certs)
- [Cloud Run custom domains](https://cloud.google.com/run/docs/mapping-custom-domains)

---

## まとめ

以下のリソースが作成されます：

- ✅ 静的IP: `mycats-pro-lb-ip`
- ✅ SSL証明書: `mycats-ssl-cert`
- ✅ ロードバランサー: `mycats-lb-urlmap`
- ✅ Serverless NEG: `mycats-frontend-neg`, `mycats-backend-neg`

**完了後のURL**:
- `https://nekoya.co.jp` → フロントエンド
- `https://api.nekoya.co.jp/api/v1` → バックエンドAPI
