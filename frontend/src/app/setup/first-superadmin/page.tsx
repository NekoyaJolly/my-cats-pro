/**
 * 初回 SUPER ADMIN セットアップページ
 *
 * - 未ログイン時: /login?returnTo=/setup/first-superadmin にリダイレクト
 * - ログイン済み: 昇格ボタンを表示し、POST /users/promote-to-superadmin-once を呼び出す
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Title,
  Button,
  Alert,
  Stack,
  Center,
  Box,
  Text,
  Loader,
} from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconShieldCheck } from '@tabler/icons-react';
import { useAuth } from '@/lib/auth/store';
import { apiRequest, ApiError, ApiResponse } from '@/lib/api/client';

/**
 * ページ表示状態
 */
type PageState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'ready' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

/**
 * 昇格成功レスポンスの data フィールドの型
 * バックエンドは { success: true, data: { id, email, role } } を返す
 */
interface PromoteResponseData {
  id: string;
  email: string;
  role: string;
}

/**
 * 昇格 API を呼び出す
 */
async function promoteToSuperAdmin(): Promise<ApiResponse<PromoteResponseData>> {
  return apiRequest<PromoteResponseData>('/users/promote-to-superadmin-once', {
    method: 'POST',
  });
}

export default function FirstSuperAdminSetupPage() {
  const router = useRouter();
  const { user, isAuthenticated, initialized } = useAuth();
  const [pageState, setPageState] = useState<PageState>({ status: 'loading' });

  // 認証状態に応じた初期化
  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!isAuthenticated) {
      setPageState({ status: 'unauthenticated' });
      // 未ログイン時はログインページへリダイレクト
      router.replace('/login?returnTo=/setup/first-superadmin');
      return;
    }

    setPageState({ status: 'ready' });
  }, [initialized, isAuthenticated, router]);

  // 昇格ボタンクリック時の処理
  const handlePromote = async () => {
    setPageState({ status: 'submitting' });

    try {
      const response = await promoteToSuperAdmin();

      if (response.success) {
        setPageState({ status: 'success' });
      } else {
        // APIがエラーを返した場合
        const errorMessage = response.message ?? response.error ?? '昇格処理に失敗しました';
        setPageState({ status: 'error', message: errorMessage });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          setPageState({
            status: 'error',
            message: 'SUPER ADMIN はすでに存在するため、この操作は実行できません。',
          });
        } else {
          setPageState({
            status: 'error',
            message: error.message || '昇格処理に失敗しました',
          });
        }
      } else {
        setPageState({
          status: 'error',
          message: '昇格処理に失敗しました',
        });
      }
    }
  };

  // ローディング中
  if (pageState.status === 'loading' || pageState.status === 'unauthenticated') {
    return (
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #eef2ff 0%, #e1f1ff 100%)',
        }}
      >
        <Loader size="lg" />
      </Box>
    );
  }

  return (
    <Box
      component="main"
      role="main"
      aria-label="初回 SUPER ADMIN セットアップページ"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #eef2ff 0%, #e1f1ff 100%)',
        padding: '1rem',
      }}
    >
      <Container size={520}>
        <Center>
          <Stack gap="lg" style={{ width: '100%' }}>
            <Box style={{ textAlign: 'center' }}>
              <Text
                size="xl"
                style={{ fontSize: '3.5rem', marginBottom: '0.75rem', lineHeight: 1 }}
              >
                🛡️
              </Text>
              <Title
                order={2}
                style={{
                  color: 'var(--text-primary)',
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  letterSpacing: 0.5,
                }}
              >
                初回 SUPER ADMIN セットアップ
              </Title>
              <Text style={{ color: 'var(--text-secondary)' }}>
                システムの最高権限を設定します
              </Text>
            </Box>

            <Paper
              radius="lg"
              p="xl"
              shadow="xl"
              style={{ boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' }}
            >
              <Stack gap="md">
                {/* 成功状態 */}
                {pageState.status === 'success' && (
                  <>
                    <Alert
                      icon={<IconCheck size="1rem" />}
                      title="昇格が完了しました"
                      color="green"
                      role="alert"
                      aria-live="polite"
                    >
                      このアカウントは SUPER ADMIN に昇格しました。
                      システム全体の管理権限を持っています。
                    </Alert>
                    <Button
                      fullWidth
                      size="md"
                      leftSection={<IconShieldCheck size="1rem" />}
                      onClick={() => router.push('/tenants')}
                      style={{
                        marginTop: '0.5rem',
                        background: 'var(--accent)',
                        boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
                      }}
                    >
                      テナント管理ページへ
                    </Button>
                  </>
                )}

                {/* エラー状態 */}
                {pageState.status === 'error' && (
                  <>
                    <Alert
                      icon={<IconAlertTriangle size="1rem" />}
                      title="エラー"
                      color="red"
                      role="alert"
                      aria-live="polite"
                    >
                      {pageState.message}
                    </Alert>
                    <Button
                      fullWidth
                      size="md"
                      variant="outline"
                      onClick={() => setPageState({ status: 'ready' })}
                      style={{ marginTop: '0.5rem' }}
                    >
                      戻る
                    </Button>
                  </>
                )}

                {/* 準備完了 / 送信中状態 */}
                {(pageState.status === 'ready' || pageState.status === 'submitting') && (
                  <>
                    {/* 現在のユーザー情報 */}
                    <Box
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--surface)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Text size="sm" style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        現在ログイン中のアカウント
                      </Text>
                      <Text size="md" fw={600} style={{ color: 'var(--text-primary)' }}>
                        {user?.email ?? '不明'}
                      </Text>
                    </Box>

                    {/* 警告メッセージ */}
                    <Alert
                      icon={<IconAlertTriangle size="1rem" />}
                      title="SUPER ADMIN の役割について"
                      color="yellow"
                      role="alert"
                    >
                      <Stack gap="xs">
                        <Text size="sm">
                          • 全テナント・全ユーザーを管理できる最上位権限です
                        </Text>
                        <Text size="sm">
                          • この操作は初回セットアップ専用で、SUPER ADMIN が既に存在する場合は失敗します
                        </Text>
                      </Stack>
                    </Alert>

                    {/* 昇格ボタン */}
                    <Button
                      fullWidth
                      size="md"
                      loading={pageState.status === 'submitting'}
                      onClick={handlePromote}
                      disabled={pageState.status === 'submitting'}
                      leftSection={<IconShieldCheck size="1rem" />}
                      style={{
                        marginTop: '0.5rem',
                        background: 'var(--accent)',
                        boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
                      }}
                    >
                      このアカウントを SUPER ADMIN に昇格する
                    </Button>
                  </>
                )}
              </Stack>
            </Paper>

            <Text size="sm" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              © {new Date().getFullYear()} MyCats. All rights reserved.
            </Text>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}
