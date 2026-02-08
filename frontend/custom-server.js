/**
 * Next.js standalone カスタムエントリポイント
 *
 * Next.js standalone モードでは public/ の静的ファイルが配信されない。
 * このスクリプトは express 的な HTTP サーバーで public/ を先に処理し、
 * それ以外のリクエストを Next.js standalone server に委譲する。
 *
 * Docker (GCP Cloud Run) のエントリポイントとして使用。
 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

// MIME タイプマッピング
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.webmanifest': 'application/manifest+json',
    '.xml': 'application/xml',
    '.txt': 'text/plain',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.map': 'application/json',
};

// Next.js standalone の server.js と同じディレクトリの public/
const publicDir = path.join(__dirname, 'public');

/**
 * public/ ディレクトリのファイルを配信する試行
 * @returns {boolean} ファイルを配信した場合 true
 */
function tryServePublicFile(req, res) {
    const parsedUrl = url.parse(req.url || '/', true);
    const pathname = parsedUrl.pathname || '/';

    // パストラバーサル攻撃を防止
    const safePath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = path.join(publicDir, safePath);

    // public ディレクトリ外へのアクセスを防止
    if (!filePath.startsWith(publicDir)) {
        return false;
    }

    try {
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            // アイコンや静的アセットは長期キャッシュ
            const cacheControl = 'public, max-age=31536000, immutable';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': stat.size,
                'Cache-Control': cacheControl,
            });
            fs.createReadStream(filePath).pipe(res);
            return true;
        }
    } catch {
        // ファイルが見つからない → Next.js に委譲
    }

    return false;
}

// ── Next.js standalone server の起動 ──
// standalone server.js は内部で startServer() を呼び、独自に listen する。
// そのため、内部ポートで Next.js を起動し、
// 外部ポートのカスタムサーバーから public チェック後にプロキシする。

const externalPort = parseInt(process.env.PORT || '3000', 10);
const internalPort = externalPort + 1; // Next.js は内部ポートで起動
const hostname = process.env.HOSTNAME || '0.0.0.0';

// Next.js を内部ポートで起動
process.env.PORT = String(internalPort);
require('./server.js');

// カスタムフロントサーバー
const server = http.createServer((req, res) => {
    // 1. public/ にファイルがあれば直接配信
    if (tryServePublicFile(req, res)) {
        return;
    }

    // 2. Next.js にプロキシ
    const proxyReq = http.request(
        {
            hostname: '127.0.0.1',
            port: internalPort,
            path: req.url,
            method: req.method,
            headers: req.headers,
        },
        (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
            proxyRes.pipe(res);
        },
    );

    proxyReq.on('error', (err) => {
        console.error('プロキシエラー:', err.message);
        if (!res.headersSent) {
            res.writeHead(502);
            res.end('Bad Gateway');
        }
    });

    req.pipe(proxyReq);
});

server.listen(externalPort, hostname, () => {
    console.log(`> カスタムサーバー起動: http://${hostname}:${externalPort}`);
    console.log(`> Next.js 内部ポート: ${internalPort}`);
    console.log(`> public ディレクトリ: ${publicDir}`);
});
