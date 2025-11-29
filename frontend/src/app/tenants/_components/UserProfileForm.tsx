'use client';

import { useState, useEffect } from 'react';
import {
  Stack,
  Card,
  TextInput,
  PasswordInput,
  Group,
  Text,
  Divider,
  Alert,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { ActionButton } from '@/components/ActionButton';
import { useAuth, useAuthStore } from '@/lib/auth/store';
import { apiClient, apiRequest } from '@/lib/api/client';

interface ProfileFormData {
  displayName: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileUpdateResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

/**
 * ユーザープロフィール編集・パスワード変更フォーム
 * 
 * 2つのセクションで構成：
 * - プロフィール編集（ユーザーネーム、メールアドレス）
 * - パスワード変更（現在のパスワード、新しいパスワード、確認）
 */
export function UserProfileForm() {
  const { user } = useAuth();
  const updateUser = useAuthStore((state) => state.updateUser);

  // プロフィールフォームの状態
  const [profileData, setProfileData] = useState<ProfileFormData>({
    displayName: '',
    email: '',
  });
  const [originalEmail, setOriginalEmail] = useState<string>('');
  const [profileLoading, setProfileLoading] = useState(false);

  // パスワードフォームの状態
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ユーザー情報が変更されたらフォームを初期化
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.firstName ?? '',
        email: user.email ?? '',
      });
      setOriginalEmail(user.email ?? '');
    }
  }, [user]);

  // メールアドレスが変更されたかどうか
  const isEmailChanged = profileData.email.trim().toLowerCase() !== originalEmail.toLowerCase();

  // プロフィール更新処理
  const handleProfileSubmit = async () => {
    // 空白チェック（ユーザーネームは任意だが、メールは必須）
    if (!profileData.email.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'メールアドレスを入力してください',
        color: 'red',
      });
      return;
    }

    try {
      setProfileLoading(true);

      // PATCH /users/me で呼び出し
      // ビジネスロジック: UIでは「ユーザーネーム」として単一フィールドで入力させ、
      // バックエンドの firstName フィールドにマッピングする。lastName は使用しない（空文字列）。
      // これにより既存のデータモデルを維持しつつ、シンプルなUI体験を提供する。
      const response = await apiRequest<ProfileUpdateResponse>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: profileData.displayName.trim(),
          lastName: '',
          email: profileData.email.trim(),
        }),
      });

      if (response.success && response.data) {
        // 認証ストアを更新
        updateUser({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
        });

        // 元のメールアドレスを更新
        setOriginalEmail(response.data.email);

        notifications.show({
          title: '成功',
          message: 'プロフィールを更新しました',
          color: 'green',
        });
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          'プロフィールの更新に失敗しました';
        notifications.show({
          title: 'エラー',
          message: errorMessage,
          color: 'red',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // パスワード変更処理
  const handlePasswordSubmit = async () => {
    // バリデーション
    if (!passwordData.currentPassword) {
      notifications.show({
        title: 'エラー',
        message: '現在のパスワードを入力してください',
        color: 'red',
      });
      return;
    }

    if (!passwordData.newPassword) {
      notifications.show({
        title: 'エラー',
        message: '新しいパスワードを入力してください',
        color: 'red',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      notifications.show({
        title: 'エラー',
        message: '新しいパスワードは8文字以上で入力してください',
        color: 'red',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notifications.show({
        title: 'エラー',
        message: '新しいパスワードが一致しません',
        color: 'red',
      });
      return;
    }

    try {
      setPasswordLoading(true);

      // POST /auth/change-password で型安全に呼び出し
      const response = await apiClient.post('/auth/change-password', {
        body: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      });

      if (response.success) {
        notifications.show({
          title: '成功',
          message: 'パスワードを変更しました',
          color: 'green',
        });
        // フォームをリセット
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          'パスワードの変更に失敗しました';
        notifications.show({
          title: 'エラー',
          message: errorMessage,
          color: 'red',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Stack gap="lg">
      {/* プロフィール編集セクション */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={600} size="lg">プロフィール編集</Text>
          <Divider />

          <TextInput
            label="ユーザーネーム"
            placeholder="山田太郎"
            value={profileData.displayName}
            onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
            disabled={profileLoading}
          />

          <TextInput
            label="メールアドレス"
            placeholder="user@example.com"
            type="email"
            required
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            disabled={profileLoading}
          />

          {isEmailChanged && (
            <Alert icon={<IconAlertTriangle size={16} />} color="orange" variant="light">
              メールアドレスを変更すると、次回ログイン時に新しいメールアドレスが必要になります。
            </Alert>
          )}

          <Group justify="flex-end">
            <ActionButton
              action="save"
              onClick={handleProfileSubmit}
              loading={profileLoading}
            >
              保存
            </ActionButton>
          </Group>
        </Stack>
      </Card>

      {/* パスワード変更セクション */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={600} size="lg">パスワード変更</Text>
          <Divider />

          <PasswordInput
            label="現在のパスワード"
            placeholder="現在のパスワードを入力"
            required
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            disabled={passwordLoading}
          />

          <PasswordInput
            label="新しいパスワード"
            placeholder="8文字以上で入力"
            required
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            disabled={passwordLoading}
            description="8文字以上で入力してください"
          />

          <PasswordInput
            label="新しいパスワード（確認）"
            placeholder="新しいパスワードを再入力"
            required
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            disabled={passwordLoading}
          />

          <Group justify="flex-end">
            <ActionButton
              action="save"
              onClick={handlePasswordSubmit}
              loading={passwordLoading}
            >
              パスワードを変更
            </ActionButton>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
