import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    // skipWaiting はクライアントからの SKIP_WAITING メッセージで手動制御する（UX を壊さないため）
    skipWaiting: false,
    // 新 SW アクティブ化後は既存タブを即座に制御下に置く（controllerchange → 自動リロード）
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// クライアントの「今すぐ更新」ボタンが送る SKIP_WAITING を受けて waiting SW をアクティブ化する。
self.addEventListener('message', (event) => {
    if (event.data && (event.data as { type?: string }).type === 'SKIP_WAITING') {
        void self.skipWaiting();
    }
});
