/**
 * デバッグエンドポイント: デプロイされたバージョン情報を取得
 * 
 * このエンドポイントは、実際にデプロイされているコードのバージョンを確認するために使用します。
 * Cloud Run にデプロイ後、このエンドポイントにアクセスして以下を確認できます：
 * - ビルド時のGitコミットハッシュ
 * - ビルド実行時刻
 * - 期待されるコミットとの照合
 * 
 * アクセス方法:
 * - 本番環境: https://nekoya.co.jp/api/debug-version
 * - ステージング: https://mycats-pro-frontend-staging-XXX.run.app/api/debug-version
 */

export async function GET() {
  return Response.json(
    {
      // タイムスタンプ: 現在時刻（リクエスト時の時刻）
      timestamp: new Date().toISOString(),
      
      // Gitコミットハッシュ: GitHub Actions から注入される
      // deploy-only.yml で GITHUB_SHA 環境変数として渡される
      gitCommit: process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      
      // ビルド時刻: Dockerビルド時に注入される
      // cloudbuild.yaml で BUILD_TIME 環境変数として渡される
      buildTime: process.env.BUILD_TIME || 'unknown',
      
      // 実行環境
      nodeEnv: process.env.NODE_ENV,
      
      // Next.js バージョン情報
      nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
      
      // ビルドメタデータ
      buildMetadata: {
        // Dockerビルド時の情報
        dockerBuildArg: process.env.DOCKER_BUILD_ARG || 'not-set',
        
        // CI/CD情報
        ciSystem: process.env.CI ? 'GitHub Actions' : 'local',
        
        // タイムゾーン
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
    {
      headers: {
        // デバッグ用途のため中間キャッシュを完全に無効化
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    },
  );
}
