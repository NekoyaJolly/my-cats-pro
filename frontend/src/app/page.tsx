'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  SimpleGrid,
  Loader,
  Center,
  Alert,
  ThemeIcon,
  Box,
  Badge,
} from '@mantine/core';
import { useMediaQuery, useDisclosure } from '@mantine/hooks';
import {
  IconHeart,
  IconCertificate,
  IconPlus,
  IconStethoscope,
  IconChevronRight,
  IconAlertCircle,
  IconSettings,
  IconList,
  IconBabyCarriage,
  IconTag,
  IconCalendarTime,
  IconUsers,
  IconPhoto,

  IconPaw,
  IconCalendarEvent,
} from '@tabler/icons-react';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { notifications } from '@mantine/notifications';
import { apiClient, type ApiQueryParams } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/store';
import {
  DashboardCardSettings,
  DashboardCardConfig,
} from '@/components/dashboard/DashboardCardSettings';
import { DialNavigation, type DialItem, type EditableDialItem } from '@/components/dashboard/DialNavigation';
import { DialMenuSettings, type DialMenuItemConfig } from '@/components/dashboard/DialMenuSettings';
import {
  loadDashboardSettings,
  saveDashboardSettings,
  applyDashboardSettings,
  loadDialMenuSettings,
  saveDialMenuSettings,
  applyDialMenuSettings,
  loadDialSizePreset,
  saveDialSizePreset,
  loadHomeDisplayMode,
  saveHomeDisplayMode,
  type DialSizePreset,
  type HomeDisplayMode,
} from '@/lib/storage/dashboard-settings';
import { DisplayModeToggle } from '@/components/dashboard/DisplayModeToggle';

// 猫のデータ型
interface Cat {
  id: string;
  name: string;
  breed: string;
  gender: 'オス' | 'メス';
  color: string;
  birthDate: string;
  bodyType: string;
  pedigreeId: string;
  tags: string[];
  status: string;
}

// ケアスケジュール型(簡易版)
interface CareScheduleSummary {
  total: number;
  completed: number;
  pending: number;
}

// 交配予定型(簡易版)
interface BreedingSummary {
  total: number;
  today: number;
}

type CareSchedule = {
  status?: string | null;
};

type BreedingSchedule = {
  breedingDate?: string | null;
  date?: string | null;
};

export default function Home() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [careSummary, setCareSummary] = useState<CareScheduleSummary>({ total: 0, completed: 0, pending: 0 });
  const [breedingSummary, setBreedingSummary] = useState<BreedingSummary>({ total: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardCards, setDashboardCards] = useState<DashboardCardConfig[]>([]);
  const [dialMenuItems, setDialMenuItems] = useState<DialMenuItemConfig[]>([]);
  const [dialSizePreset, setDialSizePreset] = useState<DialSizePreset>('medium');
  const [displayMode, setDisplayMode] = useState<HomeDisplayMode>('auto');
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);
  const [dialSettingsOpened, { open: openDialSettings, close: closeDialSettings }] = useDisclosure(false);
  const router = useRouter();
  const { setPageTitle } = usePageHeader();
  const { isAuthenticated, initialized, accessToken } = useAuth();

  // レスポンシブデザイン: モバイル縦向き判定
  const isMobilePortrait = useMediaQuery('(max-width: 768px) and (orientation: portrait)');

  // ページタイトルを設定
  useEffect(() => {
    setPageTitle('ホーム');
    return () => setPageTitle(null);
  }, [setPageTitle]);

  // 認証チェック
  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [initialized, isAuthenticated, router, accessToken]);

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !initialized) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 猫データを取得
        const catListQuery: ApiQueryParams<'/cats', 'get'> = { limit: 1000 };
        const catsResponse = await apiClient.get('/cats', {
          query: catListQuery,
        });

        if (!catsResponse.success) {
          throw new Error(catsResponse.error || '猫データの取得に失敗しました');
        }

        const fetchedCats = Array.isArray(catsResponse.data) ? catsResponse.data : [];
        setCats(fetchedCats as Cat[]);

        // ケアスケジュールのサマリーを取得
        try {
          const careResponse = await apiClient.get('/care/schedules');
          if (careResponse.success && Array.isArray(careResponse.data)) {
            const schedules = careResponse.data as CareSchedule[];
            setCareSummary({
              total: schedules.length,
              completed: schedules.filter((schedule) => schedule.status === 'completed').length,
              pending: schedules.filter((schedule) => schedule.status !== 'completed').length,
            });
          }
        } catch (careError) {
          console.warn('⚠️ ケアスケジュールの取得に失敗しました:', careError);
        }

        // 交配予定のサマリーを取得
        try {
          const breedingResponse = await apiClient.get('/breeding');
          if (breedingResponse.success && Array.isArray(breedingResponse.data)) {
            const schedules = breedingResponse.data as BreedingSchedule[];
            const today = new Date().toISOString().split('T')[0];
            setBreedingSummary({
              total: schedules.length,
              today: schedules.filter((schedule) => schedule.breedingDate?.startsWith(today) || schedule.date?.startsWith(today)).length,
            });
          }
        } catch (breedingError) {
          console.warn('⚠️ 交配予定の取得に失敗しました:', breedingError);
        }

      } catch (err) {
        console.error('❌ データ取得エラー:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
        notifications.show({
          title: 'エラー',
          message: 'データの取得に失敗しました',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, initialized]);

  // LocalStorageから設定を読み込んでカード設定を初期化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // デフォルトのダッシュボードカード定義（サイドバーの項目と同じ順序）
    const defaultDashboardCards: Omit<DashboardCardConfig, 'visible' | 'order'>[] = [
      {
        id: 'new-cat',
        title: '新規猫登録',
        description: '新しい猫を登録する',
        icon: <IconPaw size={32} />,
        color: 'green',
        href: '/cats/new',
      },
      {
        id: 'cats',
        title: '在舎猫一覧',
        description: '在舎猫の一覧・登録・編集',
        icon: <IconList size={32} />,
        color: 'blue',
        href: '/cats',
        badge: cats.length,
        stats: `全${cats.length}頭`,
      },
      {
        id: 'breeding',
        title: '交配管理',
        description: '交配スケジュールと記録',
        icon: <IconHeart size={32} />,
        color: 'pink',
        href: '/breeding',
        badge: breedingSummary.today > 0 ? breedingSummary.today : undefined,
        stats: breedingSummary.today > 0 ? `今日${breedingSummary.today}件` : `全${breedingSummary.total}件`,
      },
      {
        id: 'kittens',
        title: '子猫管理',
        description: '子猫の成長記録と管理',
        icon: <IconBabyCarriage size={32} />,
        color: 'cyan',
        href: '/kittens',
      },
      {
        id: 'care',
        title: 'ケアスケジュール',
        description: '日々のケアとタスク管理',
        icon: <IconCalendarEvent size={32} />,
        color: 'teal',
        href: '/care',
        badge: careSummary.pending > 0 ? careSummary.pending : undefined,
        stats: careSummary.pending > 0 ? `未完了${careSummary.pending}件` : '完了済み',
      },
      {
        id: 'medical-records',
        title: '医療データ',
        description: '医療記録の閲覧・管理',
        icon: <IconStethoscope size={32} />,
        color: 'red',
        href: '/medical-records',
      },
      {
        id: 'tags',
        title: 'タグ管理',
        description: 'タグの作成と管理',
        icon: <IconTag size={32} />,
        color: 'yellow',
        href: '/tags',
      },
      {
        id: 'pedigrees',
        title: '血統書データ',
        description: '血統情報の閲覧・管理',
        icon: <IconCertificate size={32} />,
        color: 'violet',
        href: '/pedigrees',
      },
      {
        id: 'staff-shifts',
        title: 'スタッフシフト',
        description: 'シフト管理とスケジュール',
        icon: <IconCalendarTime size={32} />,
        color: 'indigo',
        href: '/staff/shifts',
      },
      {
        id: 'tenants',
        title: 'ユーザー設定',
        description: 'ユーザーアカウントと権限の管理',
        icon: <IconUsers size={32} />,
        color: 'purple',
        href: '/tenants',
      },
      {
        id: 'more',
        title: 'その他',
        description: '追加の設定と機能',
        icon: <IconSettings size={32} />,
        color: 'gray',
        href: '/more',
      },
      {
        id: 'gallery',
        title: 'ギャラリー',
        description: '猫の写真ギャラリー',
        icon: <IconPhoto size={32} />,
        color: 'orange',
        href: '/gallery',
      },

    ];

    const settings = loadDashboardSettings();
    const cardsWithDefaults = defaultDashboardCards.map((card, index) => ({
      ...card,
      visible: index < 8, // 最初の8項目のみデフォルトで表示
      order: index,
    }));

    const appliedCards = applyDashboardSettings(cardsWithDefaults, settings);
    setDashboardCards(appliedCards);

    // ダイアルメニュー項目の初期化（モバイル用）
    // 色変換関数
    const colorToHex = (color: string): string => {
      const colorMap: Record<string, string> = {
        green: '#22C55E',
        blue: '#2563EB',
        pink: '#EC4899',
        cyan: '#06B6D4',
        teal: '#14B8A6',
        yellow: '#EAB308',
        violet: '#8B5CF6',
        indigo: '#6366F1',
        purple: '#A855F7',
        gray: '#6B7280',
        orange: '#F97316',
        red: '#EF4444',
        grape: '#9333EA',
        lime: '#84CC16',
      };
      return colorMap[color] || '#2563EB';
    };

    const dialItems: Omit<DialMenuItemConfig, 'visible' | 'order'>[] = defaultDashboardCards.map((card) => ({
      id: card.id,
      title: card.title,
      icon: card.icon,
      color: colorToHex(card.color),
      href: card.href,
      badge: card.badge,
      subActions: card.id === 'cats' ? [
        { id: 'cats-new', title: '作成', icon: <IconPlus size={18} />, href: '/cats/new' },
        { id: 'cats-list', title: '一覧', icon: <IconList size={18} />, href: '/cats' },
      ] : card.id === 'breeding' ? [
        { id: 'breeding-list', title: '一覧', icon: <IconList size={18} />, href: '/breeding' },
        { id: 'breeding-schedule', title: 'スケジュール', icon: <IconCalendarTime size={18} />, href: '/breeding' },
      ] : card.id === 'care' ? [
        { id: 'care-schedule', title: 'スケジュール', icon: <IconCalendarTime size={18} />, href: '/care' },
        { id: 'care-medical', title: '医療記録', icon: <IconStethoscope size={18} />, href: '/care' },
      ] : card.id === 'kittens' ? [
        { id: 'kittens-list', title: '一覧', icon: <IconList size={18} />, href: '/kittens' },
        { id: 'kittens-new', title: '作成', icon: <IconPlus size={18} />, href: '/kittens/new' },
      ] : card.id === 'pedigrees' ? [
        { id: 'pedigrees-list', title: '一覧', icon: <IconList size={18} />, href: '/pedigrees' },
        { id: 'pedigrees-new', title: '作成', icon: <IconPlus size={18} />, href: '/pedigrees/new' },
      ] : card.id === 'medical-records' ? [
        { id: 'medical-list', title: '一覧', icon: <IconList size={18} />, href: '/medical-records' },
        { id: 'medical-new', title: '作成', icon: <IconPlus size={18} />, href: '/medical-records/new' },
      ] : undefined,
    }));

    const dialSettings = loadDialMenuSettings();
    // ダイアルメニューの初期設定（最初の8項目のみ表示）
    const dialItemsWithDefaults = dialItems.map((item, index) => ({
      ...item,
      visible: index < 8,
      order: index,
    }));
    const appliedDialItems = applyDialMenuSettings(dialItemsWithDefaults, dialSettings);
    setDialMenuItems(appliedDialItems);

    // ダイアルサイズプリセットを読み込み
    const savedSizePreset = loadDialSizePreset();
    setDialSizePreset(savedSizePreset);

    // 表示モードを読み込み
    const savedDisplayMode = loadHomeDisplayMode();
    setDisplayMode(savedDisplayMode);
  }, [cats.length, careSummary.pending, breedingSummary.today, breedingSummary.total]);

  // カード設定保存ハンドラー
  const handleSaveCardSettings = (cards: DashboardCardConfig[]) => {
    setDashboardCards(cards);
    saveDashboardSettings(cards);
    notifications.show({
      title: '保存完了',
      message: 'ホーム画面の設定を保存しました',
      color: 'green',
    });
  };

  // ダイアルメニュー設定保存ハンドラー
  const handleSaveDialMenuSettings = (items: DialMenuItemConfig[]) => {
    setDialMenuItems(items);
    saveDialMenuSettings(items);
    notifications.show({
      title: '保存完了',
      message: 'ダイアルメニューの設定を保存しました',
      color: 'green',
    });
  };

  // ダイアルサイズプリセット変更ハンドラー
  const handleDialSizePresetChange = (preset: DialSizePreset) => {
    setDialSizePreset(preset);
    saveDialSizePreset(preset);
  };

  // 表示モード変更ハンドラー
  const handleDisplayModeChange = (mode: HomeDisplayMode) => {
    setDisplayMode(mode);
    saveHomeDisplayMode(mode);

    // モード切り替え時に対応する設定モーダルを開く
    if (mode === 'card') {
      openSettings();
    } else if (mode === 'dial') {
      openDialSettings();
    }
  };

  // 設定ボタンクリック時のハンドラー
  const handleSettingsClick = () => {
    // 現在の表示状態に応じて適切な設定モーダルを開く
    if (shouldShowDial) {
      openDialSettings();
    } else {
      openSettings();
    }
  };

  // 表示するカードのみフィルタリング
  const visibleCards = dashboardCards.filter((card) => card.visible);

  // 表示するダイアルメニュー項目のみフィルタリング
  const visibleDialItems = dialMenuItems.filter((item) => item.visible);

  // 実際に表示するモードを決定（メモ化して重複を避ける）
  const shouldShowDial = useMemo(() => {
    return displayMode === 'dial' || (displayMode === 'auto' && isMobilePortrait);
  }, [displayMode, isMobilePortrait]);

  // ローディング中の表示
  if (loading) {
    return (
      <Container size="xl" style={{ paddingTop: '4rem' }}>
        <Center style={{ minHeight: '60vh' }}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text size="sm" c="dimmed">データを読み込んでいます...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <Container size="xl" style={{ paddingTop: '4rem' }}>
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="エラー"
          color="red"
          variant="light"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // 今日の日付
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <Container size="xl" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* ヘッダーと設定ボタン */}
      <Stack gap="lg" mb="xl">
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">{today}</Text>
          </Box>

          {/* 表示モード切り替えと設定ボタン */}
          <DisplayModeToggle
            mode={displayMode}
            onModeChange={handleDisplayModeChange}
            onSettingsClick={handleSettingsClick}
            compact={isMobilePortrait}
          />
        </Group>
      </Stack>

      {/* 表示モードに応じたレイアウト */}
      {shouldShowDial ? (
        // ダイヤルナビゲーションUI
        <DialNavigation
          items={visibleDialItems.map((item): DialItem => ({
            id: item.id,
            title: item.title,
            icon: item.icon,
            color: item.color,
            href: item.href,
            badge: item.badge,
            subActions: item.subActions,
          }))}
          onNavigate={(href) => router.push(href)}
          allItems={dialMenuItems as EditableDialItem[]}
          onItemsChange={handleSaveDialMenuSettings}
          sizePreset={dialSizePreset}
          onSizePresetChange={handleDialSizePresetChange}
        />
      ) : (
        // デスクトップ・横向き: 詳細カードグリッド
        <SimpleGrid
          cols={{ base: 1, xs: 2, md: 3 }}
          spacing="lg"
        >
          {visibleCards.map((card) => (
            <Card
              key={card.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'visible',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-ethereal-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-ethereal)';
              }}
              onClick={() => router.push(card.href)}
            >
              {card.badge !== undefined && (
                <Badge
                  variant="filled"
                  color={card.color}
                  size="lg"
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 1,
                  }}
                >
                  {card.badge}
                </Badge>
              )}

              <Stack gap="md" style={{ height: '100%' }}>
                <ThemeIcon
                  size={64}
                  radius="md"
                  variant="light"
                  color={card.color}
                >
                  {card.icon}
                </ThemeIcon>

                <Stack gap="xs" style={{ flex: 1 }}>
                  <Title order={4}>{card.title}</Title>
                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {card.description}
                  </Text>
                  {card.stats && (
                    <Text size="sm" fw={600} c={card.color} mt="auto">
                      {card.stats}
                    </Text>
                  )}
                </Stack>

                <Group justify="space-between" mt="auto">
                  <Text size="sm" fw={500} c={card.color}>
                    詳細を見る
                  </Text>
                  <IconChevronRight size={16} color={`var(--mantine-color-${card.color}-6)`} />
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* カード設定モーダル */}
      <DashboardCardSettings
        opened={settingsOpened}
        onClose={closeSettings}
        cards={dashboardCards}
        onSave={handleSaveCardSettings}
      />

      {/* ダイアルメニュー設定モーダル */}
      <DialMenuSettings
        opened={dialSettingsOpened}
        onClose={closeDialSettings}
        items={dialMenuItems}
        onSave={handleSaveDialMenuSettings}
      />
    </Container>
  );
}
