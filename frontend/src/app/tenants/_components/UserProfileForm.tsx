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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ActionButton } from '@/components/ActionButton';
import { useAuth } from '@/lib/auth/store';
import { apiClient } from '@/lib/api/client';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * ユーザープロフィール編集・パスワード変更フォーム
 * 
 * 2つのセクションで構成：
 * - プロフィール編集（姓、名、メールアドレス）
 * - パスワード変更（現在のパスワード、新しいパスワード、確認）
 */
export function UserProfileForm() {
  const { user } = useAuth();

  // プロフィールフォームの状態
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
  });
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
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
      });
    }
  }, [user]);

  // プロフィール更新処理
  const handleProfileSubmit = async () => {
    // 空白チェック（姓名は必須ではないが、メールは必須）
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

      // PATCH /users/me で型安全に呼び出し
      const response = await apiClient.request('/users/me' as never, 'patch', {
        body: {
          firstName: profileData.firstName.trim() || undefined,
          lastName: profileData.lastName.trim() || undefined,
          email: profileData.email.trim(),
        } as never,
      });

      if (response.success) {
        notifications.show({
          title: '成功',
          message: 'プロフィールを更新しました',
          color: 'green',
        });
      } else {
        throw new Error(response.error || 'プロフィールの更新に失敗しました');
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
      const response = await apiClient.request('/auth/change-password' as never, 'post', {
        body: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        } as never,
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
        throw new Error(response.error || 'パスワードの変更に失敗しました');
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
            label="姓"
            placeholder="山田"
            value={profileData.lastName}
            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
            disabled={profileLoading}
          />

          <TextInput
            label="名"
            placeholder="太郎"
            value={profileData.firstName}
            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
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
