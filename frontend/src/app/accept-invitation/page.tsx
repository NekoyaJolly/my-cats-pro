/**
 * 招待受諾・ユーザー登録完了画面
 * 招待トークンを使用してユーザー登録を完了するためのページ
 */

'use client'; // フォーム送信が必要なため Client Component

import { useState, Suspense, useEffect, useMemo, useCallback, useRef, type CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Alert,
  Stack,
  Center,
  Box,
  Text,
  Loader,
  List,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import { apiRequest, setTokens } from '@/lib/api/client';
import { useAuthStore } from '@/lib/auth/store';

// 共通スタイル定義
const PAGE_BACKGROUND_STYLE: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #eef2ff 0%, #e1f1ff 100%)',
  padding: '1rem',
};

const CARD_SHADOW_STYLE: CSSProperties = {
  width: '100%',
  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
};

const TITLE_STYLE: CSSProperties = {
  color: 'var(--text-primary)',
  fontSize: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

// 入力フィールド共通スタイル
const INPUT_STYLES = {
  label: { color: 'var(--text-secondary)', fontWeight: 500 },
  input: { backgroundColor: 'var(--surface)' },
};

/**
 * ロゴコンポーネント（重複を避けるため共通化）
 */
function Logo({ subtitle }: { subtitle: string }) {
  return (
    <Title order={2} ta="center" mb="md" style={TITLE_STYLE}>
      <span style={{ fontSize: '3.5rem', lineHeight: 1, display: 'block' }}>🐈</span>
      <span style={{ fontSize: 18, fontWeight: 700 }}>{subtitle}</span>
    </Title>
  );
}

interface AcceptInvitationFormValues {
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface CompleteInvitationRequest {
  token: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface CompleteInvitationResponse {
  success: boolean;
  userId?: string;
  tenantId?: string;
  access_token?: string;
  message?: string;
}

/**
 * パスワード要件を検証する
 */
function validatePasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

/**
 * パスワード要件の表示コンポーネント
 */
function PasswordRequirements({ password }: { password: string }) {
  const requirements = validatePasswordRequirements(password);

  const items = [
    { label: '8文字以上', met: requirements.minLength },
    { label: '小文字を含む (a-z)', met: requirements.hasLowercase },
    { label: '大文字を含む (A-Z)', met: requirements.hasUppercase },
    { label: '数字を含む (0-9)', met: requirements.hasNumber },
  ];

  return (
    <List spacing="xs" size="sm">
      {items.map((item) => (
        <List.Item
          key={item.label}
          icon={
            <ThemeIcon
              color={item.met ? 'teal' : 'gray'}
              size={20}
              radius="xl"
            >
              {item.met ? <IconCheck size={12} /> : <IconX size={12} />}
            </ThemeIcon>
          }
          style={{ color: item.met ? 'var(--text-secondary)' : 'var(--text-muted)' }}
        >
          {item.label}
        </List.Item>
      ))}
    </List>
  );
}

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // クエリパラメータから招待トークンを取得
  const token = searchParams?.get('token') ?? null;

  // トークンがない場合のエラー状態
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setTokenError('招待トークンが見つかりません。招待メールのリンクを確認してください。');
    }
  }, [token]);

  // フォーム設定
  const form = useForm<AcceptInvitationFormValues>({
    initialValues: {
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
    validate: {
      password: (value) => {
        if (!value) return 'パスワードを入力してください';
        const requirements = validatePasswordRequirements(value);
        if (!requirements.minLength) return 'パスワードは8文字以上で入力してください';
        if (!requirements.hasLowercase) return 'パスワードに小文字を含めてください';
        if (!requirements.hasUppercase) return 'パスワードに大文字を含めてください';
        if (!requirements.hasNumber) return 'パスワードに数字を含めてください';
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return '確認用パスワードを入力してください';
        if (value !== values.password) return 'パスワードが一致しません';
        return null;
      },
    },
  });

  // パスワードの状態（リアルタイムバリデーション用）
  const passwordValue = form.values.password;
  const passwordRequirements = useMemo(
    () => validatePasswordRequirements(passwordValue),
    [passwordValue]
  );
  const allRequirementsMet = useMemo(
    () =>
      passwordRequirements.minLength &&
      passwordRequirements.hasLowercase &&
      passwordRequirements.hasUppercase &&
      passwordRequirements.hasNumber,
    [passwordRequirements]
  );

  // タイマー管理用のref（コンポーネントアンマウント時にクリア）
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 成功後のリダイレクト処理
  const handleRedirectToHome = useCallback(() => {
    router.push('/');
  }, [router]);

  // 成功時のリダイレクトタイマー設定
  useEffect(() => {
    if (success) {
      redirectTimerRef.current = setTimeout(() => {
        handleRedirectToHome();
      }, 2000);
    }

    // クリーンアップ関数でタイマーをクリア
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [success, handleRedirectToHome]);

  // 登録完了処理
  const handleSubmit = async (values: AcceptInvitationFormValues) => {
    if (!token) {
      setError('招待トークンが見つかりません。');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CompleteInvitationRequest = {
        token,
        password: values.password,
      };

      // オプションフィールドは値がある場合のみ追加
      if (values.firstName.trim()) {
        payload.firstName = values.firstName.trim();
      }
      if (values.lastName.trim()) {
        payload.lastName = values.lastName.trim();
      }

      const response = await apiRequest<CompleteInvitationResponse>(
        '/tenants/complete-invitation',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        false // 認証不要
      );

      if (response.success && response.data) {
        const data = response.data;
        
        // API レスポンスは snake_case (access_token) を使用するが、
        // 内部では一貫性のため camelCase (accessToken) に変換して使用
        const accessToken = data.access_token;
        if (accessToken && typeof accessToken === 'string') {
          // 第2引数の null は refreshToken（招待登録では refresh token は返されない）
          setTokens(accessToken, null);
          
          // auth store を bootstrap（ユーザー情報は後で /me などで取得される想定）
          await bootstrap({
            accessToken,
          });
          
          setSuccess(true);
          // リダイレクトは useEffect 内で処理
        } else {
          // 登録は成功したが認証トークンが取得できなかった場合
          // ログインページに誘導
          setError('登録は完了しましたが、自動ログインに失敗しました。ログインページからログインしてください。');
        }
      } else {
        setError(response.message || '登録に失敗しました');
      }
    } catch (err) {
      console.error('Complete invitation error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('登録中にエラーが発生しました。もう一度お試しください。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // トークンエラーの場合
  if (tokenError) {
    return (
      <Box style={PAGE_BACKGROUND_STYLE}>
        <Container size={420}>
          <Paper
            shadow="md"
            p="xl"
            radius="lg"
            style={CARD_SHADOW_STYLE}
          >
            <Logo subtitle="MyCats 招待" />
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="エラー"
              color="red"
              mt="md"
            >
              {tokenError}
            </Alert>
            <Button
              fullWidth
              mt="xl"
              onClick={() => router.push('/login')}
              variant="outline"
            >
              ログインページへ
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box style={PAGE_BACKGROUND_STYLE}>
      <Container size={420}>
        <Center>
          <Stack gap="lg" style={{ width: '100%' }}>
            {/* ロゴ・タイトル */}
            <Paper
              shadow="md"
              p="xl"
              radius="lg"
              style={CARD_SHADOW_STYLE}
            >
              <Logo subtitle="MyCats 招待登録" />
              <Text size="sm" ta="center" mb="xl" style={{ color: 'var(--text-muted)' }}>
                招待を受諾してアカウントを作成
              </Text>

              {/* 成功メッセージ */}
              {success && (
                <Alert
                  icon={<IconCheck size={16} />}
                  title="登録完了！"
                  color="green"
                  mb="md"
                >
                  アカウントが作成されました。ホームページへ移動します...
                </Alert>
              )}

              {/* エラーメッセージ */}
              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="エラー"
                  color="red"
                  mb="md"
                  withCloseButton
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              {!success && (
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack gap="md">
                    {/* 姓 */}
                    <TextInput
                      label="姓"
                      placeholder="山田"
                      styles={INPUT_STYLES}
                      {...form.getInputProps('lastName')}
                    />

                    {/* 名 */}
                    <TextInput
                      label="名"
                      placeholder="太郎"
                      styles={INPUT_STYLES}
                      {...form.getInputProps('firstName')}
                    />

                    {/* パスワード */}
                    <PasswordInput
                      label="パスワード"
                      placeholder="8文字以上"
                      required
                      styles={INPUT_STYLES}
                      {...form.getInputProps('password')}
                    />

                    {/* パスワード要件の表示 */}
                    {passwordValue && (
                      <Box pl="xs">
                        <PasswordRequirements password={passwordValue} />
                      </Box>
                    )}

                    {/* 確認用パスワード */}
                    <PasswordInput
                      label="パスワード（確認）"
                      placeholder="もう一度入力"
                      required
                      styles={INPUT_STYLES}
                      {...form.getInputProps('confirmPassword')}
                    />

                    {/* 登録ボタン */}
                    <Button
                      type="submit"
                      fullWidth
                      mt="md"
                      loading={isSubmitting}
                      disabled={isSubmitting || !allRequirementsMet}
                      style={{ background: 'var(--accent)', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)' }}
                    >
                      登録を完了
                    </Button>
                  </Stack>
                </form>
              )}
            </Paper>

            {/* パスワード要件のヘルプ */}
            <Paper
              shadow="sm"
              p="md"
              radius="lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)' }}
            >
              <Text size="xs" ta="center" mb="xs" fw={700} style={{ color: 'var(--text-secondary)' }}>
                🔐 パスワード要件
              </Text>
              <Stack gap={4}>
                <Text size="xs" style={{ color: 'var(--text-secondary)' }}>
                  ✓ 8文字以上
                </Text>
                <Text size="xs" style={{ color: 'var(--text-secondary)' }}>
                  ✓ 小文字を含む (a-z)
                </Text>
                <Text size="xs" style={{ color: 'var(--text-secondary)' }}>
                  ✓ 大文字を含む (A-Z)
                </Text>
                <Text size="xs" style={{ color: 'var(--text-secondary)' }}>
                  ✓ 数字を含む (0-9)
                </Text>
              </Stack>
            </Paper>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <AcceptInvitationForm />
    </Suspense>
  );
}
