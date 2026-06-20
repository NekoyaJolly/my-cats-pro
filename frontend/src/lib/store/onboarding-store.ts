import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 初回ログインの歓迎ヒントに使う擬似ガイドキー */
export const WELCOME_GUIDE_KEY = '__welcome__';

/** ユーザーID とガイドキーから localStorage 用の複合キーを作る */
export function onboardingKey(userId: string, guideKey: string): string {
  return `${userId}::${guideKey}`;
}

interface OnboardingState {
  /** 表示済みフラグ。キーは `${userId}::${guideKey}`（localStorage に永続化） */
  seen: Record<string, boolean>;
  /** ヘッダーの「?」ボタンからの手動表示要求トークン（永続化しない） */
  openToken: number;
}

interface OnboardingActions {
  /** 指定キーのガイドを表示済みにする */
  markSeen: (key: string) => void;
  /** 指定ユーザーの表示済みフラグをすべて解除する（再表示・デバッグ用） */
  resetForUser: (userId: string) => void;
  /** 現在のページガイドの手動再表示を要求する */
  requestOpen: () => void;
}

type OnboardingStore = OnboardingState & OnboardingActions;

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      seen: {},
      openToken: 0,
      markSeen: (key) =>
        set((state) => (state.seen[key] ? state : { seen: { ...state.seen, [key]: true } })),
      resetForUser: (userId) =>
        set((state) => {
          const prefix = `${userId}::`;
          const next: Record<string, boolean> = {};
          for (const [key, value] of Object.entries(state.seen)) {
            if (!key.startsWith(prefix)) {
              next[key] = value;
            }
          }
          return { seen: next };
        }),
      requestOpen: () => set((state) => ({ openToken: state.openToken + 1 })),
    }),
    {
      name: 'mycats-onboarding',
      // openToken は端末セッション限りの一時値なので永続化しない
      partialize: (state) => ({ seen: state.seen }),
    }
  )
);
