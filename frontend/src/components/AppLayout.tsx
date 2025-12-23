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
  IconCalendarEvent,
  IconCalendarTime,
  IconSettings,
  IconHome,
  IconCat,
  IconStethoscope,
  IconHeartHandshake,
  IconPhoto,
  IconUsers,
} from '@tabler/icons-react';
import { useAuth } from '@/lib/auth/store';
import { isAuthRoute, isProtectedRoute } from '@/lib/auth/routes';
import { notifications } from '@mantine/notifications';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { ContextMenuManager } from '@/components/context-menu';
import { apiClient, type ApiQueryParams } from '@/lib/api/client';
import type { Cat } from '@/lib/api/hooks/use-cats';
import { useBottomNavSettings } from '@/lib/hooks/use-bottom-nav-settings';
import { useTheme } from '@/lib/store/theme-store';

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
    label: 'ケアスケジュール',
    href: '/care',
    icon: IconCalendarEvent,
  },
  {
    label: '医療データ',
    href: '/medical-records',
    icon: IconStethoscope,
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
    label: 'スタッフシフト',
    href: '/staff/shifts',
    icon: IconCalendarTime,
  },
  {
    label: 'ユーザー設定',
    href: '/tenants',
    icon: IconUsers,
  },
  {
    label: '表示設定',
    href: '/settings',
    icon: IconSettings,
  },
  {
    label: 'その他',
    href: '/more',
    icon: IconSettings,
  },
  {
    label: 'ギャラリー',
    href: '/gallery',
    icon: IconPhoto,
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

export const bottomNavigationItems = [
  { id: 'home', label: 'ホーム', href: '/', icon: IconHome },
  { id: 'cats', label: '在舎猫', href: '/cats', icon: IconCat },
  { id: 'breeding', label: '交配', href: '/breeding', icon: IconHeartHandshake },
  { id: 'kittens', label: '子猫', href: '/kittens', icon: IconPaw },
  { id: 'care', label: 'ケア', href: '/care', icon: IconStethoscope },
  { id: 'medical', label: '医療', href: '/medical-records', icon: IconStethoscope },
  { id: 'tags', label: 'タグ', href: '/tags', icon: IconTag },
  { id: 'pedigrees', label: '血統書', href: '/pedigrees', icon: IconCertificate },
  { id: 'more', label: 'その他', href: '/more', icon: IconSettings },
];

// 猫の統計情報の型
interface CatStats {
  male: number;
  female: number;
  kittens: number;
  graduated: number;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { theme } = useTheme();
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const router = useRouter();
  const { pageTitle, pageActions } = usePageHeader();
  const [catStats, setCatStats] = useState<CatStats>({ male: 0, female: 0, kittens: 0, graduated: 0 });

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

  // 将来使用予定のロールラベル
  // const roleLabel = useMemo(() => {
  //   if (!user?.role) {
  //     return null;
  //   }
  //   const mapping: Record<string, string> = {
  //     ADMIN: '管理者',
  //     USER: '一般',
  //     SUPER_ADMIN: 'スーパー管理者',
  //   };
  //   return mapping[user.role] ?? user.role;
  // }, [user]);

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

  // 猫の統計情報を取得
  useEffect(() => {
    const fetchCatStats = async () => {
      if (!isAuthenticated || !initialized) {
        return;
      }

      try {
        const catListQuery: ApiQueryParams<'/cats', 'get'> = { limit: 1000 };
        const response = await apiClient.get('/cats', {
          query: catListQuery,
        });

        if (response.success && Array.isArray(response.data)) {
          const cats = response.data as Cat[];
          const today = new Date();
          
          // 在舎猫のみをフィルタ
          const inHouseCats = cats.filter((cat) => cat.isInHouse);
          
          // 子猫判定関数（6ヶ月未満）
          const isKittenFunc = (cat: Cat) => {
            if (!cat.birthDate) return false;
            const birthDate = new Date(cat.birthDate);
            const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
            return ageInMonths < 6;
          };
          
          // 大人の猫（子猫以外）
          const adultCats = inHouseCats.filter((cat) => !isKittenFunc(cat));
          
          // 子猫（90日未満で母猫IDを持つ）
          const kittens = inHouseCats.filter((cat) => {
            if (!cat.birthDate || !cat.motherId) return false;
            const birthDate = new Date(cat.birthDate);
            const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
            return ageInDays < 90;
          });
          
          // 卒業予定の猫（「卒業予定」タグを持つ猫）
          const graduatedCats = inHouseCats.filter((cat) => 
            cat.tags?.some((catTag) => catTag.tag.name === '卒業予定')
          );
          
          // 統計を計算
          const stats: CatStats = {
            male: adultCats.filter((cat) => cat.gender === 'MALE').length,
            female: adultCats.filter((cat) => cat.gender === 'FEMALE').length,
            kittens: kittens.length,
            graduated: graduatedCats.length,
          };
          
          setCatStats(stats);
        }
      } catch (error) {
        console.error('統計情報の取得に失敗:', error);
      }
    };

    fetchCatStats();
    
    // 5分ごとに更新
    const interval = setInterval(fetchCatStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, initialized]);

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
    return (
      <div className={`theme-${theme}`} style={{ minHeight: '100vh' }}>
        {children}
      </div>
    );
  }

  return (
    <div className={`theme-${theme}`}>
    <ContextMenuManager>
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="0"
      styles={(_theme) => ({
        header: {
          backgroundColor: 'transparent',
          borderBottom: 'var(--border-width, 1px) solid var(--glass-border, var(--border-subtle, rgba(255, 255, 255, 0.3)))',
        },
        navbar: {
          backgroundColor: 'transparent',
          borderRight: 'var(--border-width, 1px) solid var(--glass-border, var(--border-subtle, rgba(255, 255, 255, 0.3)))',
        },
        main: {
          backgroundColor: 'transparent',
        },
      })}
    >
      <AppShell.Header className="glass-effect" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, display: 'flex', justifyContent: 'center' }}>
        <Group
          h="100%"
          px="var(--layout-px)"
          justify="space-between"
          wrap="nowrap"
          style={{ color: 'var(--text-primary)', width: '100%', maxWidth: 'var(--container-max-width)' }}
        >
          <Group gap="sm" wrap="nowrap" style={{ flex: '1 1 auto', minWidth: 0 }}>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
              color="var(--text-primary)"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
              color="var(--text-primary)"
            />
            <Group gap={12} wrap="nowrap" style={{ minWidth: 0 }}>
              <Text 
                fw={800} 
                visibleFrom="sm"
                style={{ 
                  color: 'var(--accent)', 
                  fontSize: 20, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.03em'
                }}
              >
                <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🐈</span> MyCats
              </Text>
              {pageTitle && (
                <>
                  <div style={{ width: 1, height: 24, backgroundColor: 'var(--text-muted)', opacity: 0.3, transform: 'rotate(15deg)' }} />
                  <Text fw={700} size="md" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pageTitle}
                  </Text>
                </>
              )}
            </Group>
          </Group>
          
          <Group gap="xs" wrap="nowrap" style={{ flex: '0 0 auto' }}>
            <Badge 
              color="blue" 
              size="lg" 
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/cats?tab=male')}
            >
              ♂ {catStats.male}
            </Badge>
            <Badge 
              color="pink" 
              size="lg" 
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/cats?tab=female')}
            >
              ♀ {catStats.female}
            </Badge>
            <Badge 
              color="orange" 
              size="lg" 
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/cats?tab=kitten')}
            >
              🐾 {catStats.kittens}
            </Badge>
            <Badge 
              color="green" 
              size="lg" 
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/cats?tab=grad')}
            >
              🎓 {catStats.graduated}
            </Badge>
          </Group>
          
          {pageActions && <div className="page-actions-container">{pageActions}</div>}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" className="glass-effect" style={{ borderTop: 'none', borderBottom: 'none', borderLeft: 'none', borderRadius: 0 }}>
        {/* ユーザー情報セクション */}
        {isAuthenticated && user && (
          <AppShell.Section mb="xl">
            <Box 
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: 'var(--radius-base, 20px)', 
                padding: 16,
                border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.2))'
              }}
            >
              <Group gap="sm" wrap="nowrap">
                <Avatar radius="xl" size={44} color="blue" variant="filled" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {accountInitials}
                </Avatar>
                <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={700} lineClamp={1} style={{ color: 'var(--text-primary)' }}>
                    {accountLabel}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {accountEmail}
                  </Text>
                </Stack>
              </Group>
              <Button
                variant="subtle"
                color="red"
                size="compact-xs"
                fullWidth
                mt="md"
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
                loading={logoutLoading}
                radius="md"
              >
                ログアウト
              </Button>
            </Box>
          </AppShell.Section>
        )}

        <AppShell.Section grow component={ScrollArea}>
          <Stack gap={4}>
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
                    if (mobileOpened) toggleMobile();
                  }}
                  styles={{
                    root: {
                      borderRadius: 'calc(var(--radius-base, 12px) * 0.6)',
                      padding: '10px 12px',
                      backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                      border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                    },
                    label: {
                      fontWeight: isActive ? 700 : 500,
                    },
                  }}
                />
              );
            })}
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main style={{ paddingBottom: 100 }}>
        <Box 
          px="var(--layout-px)" 
          style={{ 
            maxWidth: 'var(--container-max-width)', 
            margin: '0 auto',
            width: '100%',
            /* Theme-specific responsive adjustments */
            paddingTop: 'var(--section-gap, 24px)',
          }}
        >
          {children}
        </Box>
        <BottomNavigation pathname={pathname} theme={theme} />
      </AppShell.Main>
    </AppShell>
    </ContextMenuManager>
    </div>
  );
}

function BottomNavigation({ pathname, theme }: { pathname: string; theme: string }) {
  const { visibleItems, isLoading } = useBottomNavSettings(bottomNavigationItems);

  if (isLoading) return null;

  // Monolithの時はシンプルな固定バーにする
  const isMonolith = theme === 'monolith';

  return (
    <Box
      component="footer"
      className={isMonolith ? '' : 'glass-effect'}
      style={{
        position: 'fixed',
        left: isMonolith ? 0 : '50%',
        transform: isMonolith ? 'none' : 'translateX(-50%)',
        bottom: isMonolith ? 0 : 20,
        width: isMonolith ? '100%' : 'calc(100% - 40px)',
        maxWidth: isMonolith ? 'none' : 600,
        height: isMonolith ? 64 : 72,
        borderRadius: isMonolith ? 0 : 36,
        zIndex: 100,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        border: isMonolith ? 'none' : '1px solid rgba(255, 255, 255, 0.5)',
        borderTop: isMonolith ? '1px solid var(--border-primary, #1e293b)' : undefined,
        backgroundColor: isMonolith ? 'var(--bg-surface, #ffffff)' : undefined,
      }}
    >
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const IconComponent = item.icon;
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
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: !isMonolith && isActive ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
            }}
          >
            {isActive && !isMonolith && (
              <Box 
                style={{ 
                  position: 'absolute', 
                  top: -8, 
                  width: 4, 
                  height: 4, 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--accent)',
                  boxShadow: '0 0 8px var(--accent)'
                }} 
              />
            )}
            <IconComponent size={24} stroke={isActive ? 2 : 1.5} />
            <Text
              size="10px"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                marginTop: 4,
                textTransform: isMonolith ? 'uppercase' : 'none',
                letterSpacing: isMonolith ? '0.05em' : 'normal',
              }}
            >
              {item.label}
            </Text>
            {isActive && isMonolith && (
              <Box 
                style={{ 
                  position: 'absolute', 
                  bottom: -10, 
                  width: '100%', 
                  height: 2, 
                  backgroundColor: 'var(--accent)' 
                }} 
              />
            )}
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
