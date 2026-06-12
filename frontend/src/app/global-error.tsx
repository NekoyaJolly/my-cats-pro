'use client';
// 理由: App Router の global error boundary はクライアントコンポーネントである必要がある

/**
 * ルートレイアウト自体が壊れた場合の最終フォールバック
 *
 * MantineProvider が利用できない可能性があるため、
 * 依存のない素の HTML で表示する。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: 'sans-serif',
            gap: '16px',
            padding: '16px',
          }}
        >
          <h2>エラーが発生しました</h2>
          <p>
            アプリケーションの表示中に問題が発生しました。
            再試行しても解決しない場合は、時間をおいてからアクセスしてください。
          </p>
          {error.digest && <p style={{ color: '#888' }}>エラーID: {error.digest}</p>}
          <button
            type="button"
            onClick={() => reset()}
            style={{ padding: '8px 24px', cursor: 'pointer' }}
          >
            再試行
          </button>
        </div>
      </body>
    </html>
  );
}
