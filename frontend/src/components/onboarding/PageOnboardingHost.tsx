'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/lib/auth/store';
import {
  useOnboardingStore,
  onboardingKey,
  WELCOME_GUIDE_KEY,
} from '@/lib/store/onboarding-store';
import { findPageGuide } from '@/lib/onboarding/page-guides';
import { PageGuide } from './PageGuide';

/** persist による localStorage の復元完了を待つ */
function useOnboardingHydrated(): boolean {
  const [hydrated, setHydrated] = useState<boolean>(() =>
    useOnboardingStore.persist.hasHydrated()
  );

  useEffect(() => {
    const unsubscribe = useOnboardingStore.persist.onFinishHydration(() => setHydrated(true));
    if (useOnboardingStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsubscribe;
  }, []);

  return hydrated;
}

/**
 * 全ページ共通のオンボーディング制御。AppLayout に1個だけ常駐させる。
 * - 初回ログイン時は軽い歓迎ヒント（トースト）のみ表示
 * - ガイド定義のあるページの初回訪問時にドロワーを自動表示
 * - ヘッダーの「?」ボタン（requestOpen）からの手動表示にも対応
 */
export function PageOnboardingHost() {
  const pathname = usePathname() ?? '/';
  const { user, isAuthenticated, initialized } = useAuth();
  const hydrated = useOnboardingHydrated();

  const seen = useOnboardingStore((state) => state.seen);
  const markSeen = useOnboardingStore((state) => state.markSeen);
  const openToken = useOnboardingStore((state) => state.openToken);

  const [opened, setOpened] = useState(false);

  const guide = findPageGuide(pathname);
  const userId = user?.id ?? null;

  // 初回ログイン時は歓迎ヒントを優先し、着地ページの自動ガイドはこの回だけ見送る
  const welcomeHandledRef = useRef(false);
  const suppressPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (welcomeHandledRef.current) return;
    if (!hydrated || !initialized || !isAuthenticated || !userId) return;

    welcomeHandledRef.current = true;
    const welcomeKey = onboardingKey(userId, WELCOME_GUIDE_KEY);
    if (!seen[welcomeKey]) {
      markSeen(welcomeKey);
      suppressPathRef.current = pathname;
      notifications.show({
        title: 'MyCats へようこそ 🐈',
        message:
          '画面下のバーやメニューから各ページへ移動できます。ガイドのあるページでは右上の「?」からいつでも詳しい使い方を確認できます。',
        color: 'blue',
        autoClose: 8000,
        // ヘッダー（高さ60px）と重ならないよう、この歓迎トーストだけ下げて表示する
        style: { marginTop: 'calc(60px + var(--mantine-spacing-xs))' },
      });
    }
  }, [hydrated, initialized, isAuthenticated, userId, pathname, seen, markSeen]);

  // ガイド定義のあるページの初回訪問時に自動表示
  useEffect(() => {
    if (!hydrated || !initialized || !isAuthenticated || !userId || !guide) return;
    if (!welcomeHandledRef.current) return; // 歓迎処理を先に通す

    if (suppressPathRef.current !== null) {
      if (suppressPathRef.current === pathname) {
        return; // 歓迎を表示した着地ページは今回見送る
      }
      suppressPathRef.current = null;
    }

    const guideKey = onboardingKey(userId, guide.pageKey);
    if (!seen[guideKey]) {
      markSeen(guideKey);
      setOpened(true);
    }
  }, [hydrated, initialized, isAuthenticated, userId, guide, pathname, seen, markSeen]);

  // ヘッダーの「?」ボタンからの手動表示
  const lastOpenTokenRef = useRef(openToken);
  useEffect(() => {
    if (openToken === lastOpenTokenRef.current) return;
    lastOpenTokenRef.current = openToken;
    if (guide) {
      setOpened(true);
    }
  }, [openToken, guide]);

  if (!guide) {
    return null;
  }

  return <PageGuide guide={guide} opened={opened} onClose={() => setOpened(false)} />;
}
