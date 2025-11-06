'use client';

import {
  AppShell,
  Avatar,
  Badge,
  Burger,
  Group,
  ScrollArea,
  Text,
  NavLink,
  Center,
  Loader,
  Box,
  Stack,
  Card,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import '@/styles/page-header.css';
import {
  IconPaw,
  IconList,
  IconHeart,
  IconBabyCarriage,
  IconTag,
  IconCertificate,
  IconLogout,
  IconPalette,
} from '@tabler/icons-react';
import { useAuth } from '@/lib/auth/store';
import { isAuthRoute, isProtectedRoute } from '@/lib/auth/routes';
import { notifications } from '@mantine/notifications';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { ContextMenuManager } from '@/components/context-menu';

const navigationItems = [
  {
    label: '新規猫登録',
    href: '/cats/new',
    icon: IconPaw,
  },
  {
    label: '在舎猫一覧',
    href: '/cats',
    icon: IconList,
  },
  {
    label: '交配管理',
    href: '/breeding',
    icon: IconHeart,
  },
  {
    label: '子猫管理',
    href: '/kittens',
    icon: IconBabyCarriage,
  },
  {
    label: 'タグ管理',
    href: '/tags',
    icon: IconTag,
  },
  {
    label: '血統書データ',
    href: '/pedigrees',
    icon: IconCertificate,
  },
  {
    label: 'デザインガイド',
    href: '/demo/action-buttons',
    icon: IconPalette,
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

const bottomNavigationItems = [
  { label: 'ホーム', href: '/', icon: '🏠' },
  { label: '交配', href: '/breeding', icon: '🔗' },
  { label: '子猫', href: '/kittens', icon: '🐾' },
  { label: 'ケア', href: '/care', icon: '🩺' },
  { label: 'その他', href: '/more', icon: '⚙️' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const router = useRouter();
  const { pageTitle, pageActions } = usePageHeader();

  // デバッグ用ログ
  console.log('AppLayout pageTitle:', pageTitle);
  console.log('AppLayout pageActions:', pageActions);
  // 両方とも初期状態は閉じた状態に変更（遷移で自動的に閉じる仕様）
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop, close: closeDesktop }] = useDisclosure(false);
  const { user, isAuthenticated, initialized, isLoading, logout } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const isAuthPage = isAuthRoute(pathname);
  const requiresAuth = isProtectedRoute(pathname);
  const search = searchParams?.toString() ?? '';
  const targetPath = search ? `${pathname}?${search}` : pathname;

  const accountLabel = useMemo(() => {
    if (!user) {
      return 'ゲスト';
    }
    const name = [user.lastName, user.firstName].filter(Boolean).join(' ');
    return name || user.email || 'ユーザー';
  }, [user]);

  const accountInitials = useMemo(() => {
    if (!user) {
      return 'MC';
    }
    const nameSeed = `${user.lastName ?? ''}${user.firstName ?? ''}`.trim();
    if (nameSeed) {
      return nameSeed.slice(0, 2).toUpperCase();
    }
    const emailSeed = (user.email ?? '').replace('@', '');
    return emailSeed.slice(0, 2).toUpperCase() || 'MC';
  }, [user]);

  const roleLabel = useMemo(() => {
    if (!user?.role) {
      return null;
    }
    const mapping: Record<string, string> = {
      ADMIN: '管理者',
      USER: '一般',
      SUPER_ADMIN: 'スーパー管理者',
    };
    return mapping[user.role] ?? user.role;
  }, [user]);

  const accountEmail = user?.email ?? '';

  const handleLogout = useCallback(async () => {
    if (logoutLoading) {
      return;
    }
    setLogoutLoading(true);
    try {
      await logout();
      notifications.show({
        title: 'ログアウトしました',
        message: 'またのご利用をお待ちしています。',
        color: 'teal',
      });
      const params = new URLSearchParams();
      if (targetPath && targetPath !== '/') {
        params.set('returnTo', targetPath);
      }
      const nextUrl = params.size > 0 ? `/login?${params.toString()}` : '/login';
      router.replace(nextUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : '再度お試しください。';
      notifications.show({
        title: 'ログアウトに失敗しました',
        message,
        color: 'red',
      });
      setLogoutLoading(false);
    }
  }, [logout, logoutLoading, router, targetPath]);

  useEffect(() => {
    if (!initialized) return;
    if (isAuthPage && isAuthenticated) {
      router.replace('/');
    }
  }, [initialized, isAuthPage, isAuthenticated, router]);

  useEffect(() => {
    if (!initialized) return;
    if (requiresAuth && !isAuthenticated) {
      const params = new URLSearchParams();
      params.set('returnTo', targetPath);
      router.replace(`/login?${params.toString()}`);
    }
  }, [initialized, requiresAuth, isAuthenticated, router, targetPath]);

  // ルート遷移検知でサイドバー自動折りたたみ
  useEffect(() => {
    if (!requiresAuth) {
      return;
    }
    closeMobile();
    closeDesktop();
  }, [pathname, requiresAuth, closeMobile, closeDesktop]);

  if (!initialized || (requiresAuth && isLoading)) {
    return <FullScreenLoader />;
  }

  if (isAuthPage && isAuthenticated) {
    return <FullScreenLoader />;
  }

  if (requiresAuth && !isAuthenticated) {
    return <FullScreenLoader />;
  }

  if (!requiresAuth) {
    return <>{children}</>;
  }

  return (
    <ContextMenuManager>
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="0"
      styles={() => ({
        header: {
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        },
        navbar: {
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border-subtle)',
        },
        main: {
          backgroundColor: 'var(--background-base)',
        },
      })}
    >
      <AppShell.Header>
        <Group
          h="100%"
          px="md"
          justify="space-between"
          wrap="nowrap"
          style={{ color: 'var(--text-primary)' }}
        >
          <Group gap="sm" wrap="nowrap" style={{ maxWidth: 'calc(100% - 200px)', flex: '1 1 auto' }}>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
            />
            <Group gap={8} wrap="nowrap">
              <Text fw={700} style={{ color: 'var(--text-primary)', fontSize: 18, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🐈</span> MyCats
              </Text>
              {pageTitle && (
                <>
                  <Text c="dimmed" size="lg">›</Text>
                  <Text fw={600} size="md" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {pageTitle}
                  </Text>
                </>
              )}
            </Group>
          </Group>
          {pageActions && <div className="page-actions-container">{pageActions}</div>}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {/* ユーザー情報セクション（サイドバー最上部） */}
        {isAuthenticated && user && (
          <AppShell.Section mb="md">
            <Card withBorder padding="sm" radius="md">
              <Group gap="sm" wrap="nowrap">
                <Avatar radius="xl" size={40} color="var(--accent)" variant="filled">
                  {accountInitials}
                </Avatar>
                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={600} lineClamp={1} style={{ color: 'var(--text-primary)' }}>
                    {accountLabel}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {accountEmail}
                  </Text>
                  {roleLabel && (
                    <Badge size="xs" variant="light" color="indigo" style={{ width: 'fit-content' }}>
                      {roleLabel}
                    </Badge>
                  )}
                </Stack>
              </Group>
              <Button
                variant="light"
                color="red"
                size="xs"
                fullWidth
                mt="sm"
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
                loading={logoutLoading}
              >
                ログアウト
              </Button>
            </Card>
          </AppShell.Section>
        )}

        <AppShell.Section grow component={ScrollArea}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<Icon size={20} stroke={1.5} />}
                active={isActive}
                onClick={() => {
                  // モバイルでリンクをクリックしたらナビゲーションを閉じる
                  if (mobileOpened) {
                    toggleMobile();
                  }
                }}
                styles={() => ({
                  root: {
                    borderRadius: 10,
                    marginBottom: 6,
                    border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                    backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    transition: 'background-color 120ms ease, border-color 120ms ease',
                  },
                  label: {
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  },
                  leftSection: {
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  },
                })}
              />
            );
          })}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main style={{ paddingBottom: 72 }}>
        {children}
        <BottomNavigation pathname={pathname} />
      </AppShell.Main>
    </AppShell>
    </ContextMenuManager>
  );
}

function BottomNavigation({ pathname }: { pathname: string }) {
  return (
    <Box
      component="footer"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 64,
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
        boxShadow: '0 -4px 12px rgba(15, 23, 42, 0.05)',
        color: 'var(--text-muted)',
      }}
    >
  {bottomNavigationItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Box
            key={item.href}
            component={Link}
            href={item.href}
            style={{
              textAlign: 'center',
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: '0.8rem',
            }}
          >
            <Text size="xl">{item.icon}</Text>
            <Text
              size="xs"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: 500,
              }}
            >
              {item.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

function FullScreenLoader() {
  return (
    <Center h="100vh" w="100%">
      <Loader size="lg" color="blue" />
    </Center>
  );
}
