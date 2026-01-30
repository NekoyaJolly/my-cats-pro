import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'default';

interface ThemeState {
  theme: ThemeType;
}

interface ThemeActions {
  setTheme: (theme: ThemeType) => void;
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'default', // Classic Default に統一
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'mycats-theme-storage',
    }
  )
);

export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return {
    theme,
    setTheme,
  };
}

