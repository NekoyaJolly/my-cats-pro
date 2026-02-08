import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// Serwist グローバル設定の型拡張
// injectionPoint のデフォルト値 "self.__SW_MANIFEST" を TypeScript に宣言
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    // ビルド時に自動注入されるプリキャッシュマニフェスト
    precacheEntries: self.__SW_MANIFEST,
    // 待機中の Service Worker を即座にアクティブ化
    skipWaiting: true,
    // 全てのクライアントを即座に制御
    clientsClaim: true,
    // ナビゲーションリクエストのプリロード
    navigationPreload: true,
    // Serwist 推奨のデフォルトキャッシュ戦略
    runtimeCaching: defaultCache,
});

serwist.addEventListeners();
