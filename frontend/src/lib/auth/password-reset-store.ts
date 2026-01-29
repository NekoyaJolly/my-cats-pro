import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { apiClient, type ApiRequestBody, type ApiSuccessData } from '../api/client';

export type PasswordResetStatus = 'idle' | 'loading' | 'success' | 'error';

type RequestResetBody = ApiRequestBody<'/auth/request-password-reset', 'post'>;
type ResetPasswordBody = ApiRequestBody<'/auth/reset-password', 'post'>;
type RequestResetResponse = ApiSuccessData<'/auth/request-password-reset', 'post'>;

interface PasswordResetState {
  requestStatus: PasswordResetStatus;
  requestError: string | null;
  resetStatus: PasswordResetStatus;
  resetError: string | null;
  lastRequestedEmail: string | null;
  devToken: string | null;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (payload: { token: string; newPassword: string }) => Promise<void>;
  resetRequestState: () => void;
  resetResetState: () => void;
  clearDevToken: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractDevToken(response: RequestResetResponse): string | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  if (isRecord(response) && typeof response.token === 'string') {
    return response.token;
  }

  return null;
}

function extractMessage(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (isRecord(value) && typeof value.message === 'string') {
    return value.message;
  }

  return null;
}

export const usePasswordResetStore = create<PasswordResetState>((set) => ({
  requestStatus: 'idle',
  requestError: null,
  resetStatus: 'idle',
  resetError: null,
  lastRequestedEmail: null,
  devToken: null,
  requestPasswordReset: async (email) => {
    const payload: RequestResetBody = { email };

    set({ requestStatus: 'loading', requestError: null });

    try {
      const response = await apiClient.post('/auth/request-password-reset', {
        body: payload,
        retryOnUnauthorized: false,
      });

      if (!response.success) {
        throw new Error(response.error || response.message || 'リクエストに失敗しました');
      }

      const devToken = extractDevToken(response.data as RequestResetResponse);

      if (devToken && process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
        console.info('🔑 Password reset token:', devToken);
        console.info('🔗 Reset URL:', `${window.location.origin}/reset-password?token=${devToken}`);
      }

      set({
        requestStatus: 'success',
        requestError: null,
        lastRequestedEmail: email,
        devToken: devToken ?? null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : extractMessage(error) || 'リクエストに失敗しました';
      set({
        requestStatus: 'error',
        requestError: message,
      });
      throw error;
    }
  },
  resetPassword: async ({ token, newPassword }) => {
    const payload: ResetPasswordBody = {
      token,
      newPassword,
    };

    set({ resetStatus: 'loading', resetError: null });

    try {
      const response = await apiClient.post('/auth/reset-password', {
        body: payload,
        retryOnUnauthorized: false,
      });

      if (!response.success) {
        throw new Error(response.error || response.message || 'リセットに失敗しました');
      }

      set({
        resetStatus: 'success',
        resetError: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : extractMessage(error) || 'リセットに失敗しました';
      set({
        resetStatus: 'error',
        resetError: message,
      });
      throw error;
    }
  },
  resetRequestState: () => set({ requestStatus: 'idle', requestError: null }),
  resetResetState: () => set({ resetStatus: 'idle', resetError: null }),
  clearDevToken: () => set({ devToken: null }),
}));

// useShallowを使用して安定したセレクタを提供
export function usePasswordResetSelectors() {
  return usePasswordResetStore(
    useShallow((state) => ({
      requestStatus: state.requestStatus,
      requestError: state.requestError,
      resetStatus: state.resetStatus,
      resetError: state.resetError,
      lastRequestedEmail: state.lastRequestedEmail,
      devToken: state.devToken,
    }))
  );
}

// アクションは安定した参照を持つため、個別に取得
export function usePasswordResetActions() {
  const requestPasswordReset = usePasswordResetStore((state) => state.requestPasswordReset);
  const resetPassword = usePasswordResetStore((state) => state.resetPassword);
  const resetRequestState = usePasswordResetStore((state) => state.resetRequestState);
  const resetResetState = usePasswordResetStore((state) => state.resetResetState);
  const clearDevToken = usePasswordResetStore((state) => state.clearDevToken);

  return {
    requestPasswordReset,
    resetPassword,
    resetRequestState,
    resetResetState,
    clearDevToken,
  };
}
