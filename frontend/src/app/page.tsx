'use client';

import { useState, useEffect } from 'react';
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
import { useDisclosure } from '@mantine/hooks';
import {
  IconHeart,
  IconCertificate,
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
import {
  loadDashboardSettings,
  saveDashboardSettings,
  applyDashboardSettings,
} from '@/lib/storage/dashboard-settings';

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
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);
  const router = useRouter();
  const { setPageTitle } = usePageHeader();
  const { isAuthenticated, initialized, accessToken } = useAuth();

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

  // データ取得（並列リクエストでウォーターフォールを回避）
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !initialized) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const catListQuery: ApiQueryParams<'/cats', 'get'> = { limit: 50 };

        const [catsResponse, careResponse, breedingResponse] = await Promise.all([
          apiClient.get('/cats', { query: catListQuery }),
          apiClient.get('/care/schedules').catch(() => null),
          apiClient.get('/breeding').catch(() => null),
        ]);

        if (!catsResponse.success) {
          throw new Error(catsResponse.error || '猫データの取得に失敗しました');
        }

        const fetchedCats = Array.isArray(catsResponse.data) ? catsResponse.data : [];
        setCats(fetchedCats as Cat[]);

        if (careResponse?.success && Array.isArray(careResponse.data)) {
          const schedules = careResponse.data as CareSchedule[];
          setCareSummary({
            total: schedules.length,
            completed: schedules.filter((schedule) => schedule.status === 'COMPLETED').length,
            pending: schedules.filter((schedule) => schedule.status !== 'COMPLETED').length,
          });
        }

        if (breedingResponse?.success && Array.isArray(breedingResponse.data)) {
          const schedules = breedingResponse.data as BreedingSchedule[];
          const today = new Date().toISOString().split('T')[0];
          setBreedingSummary({
            total: schedules.length,
            today: schedules.filter((schedule) => schedule.breedingDate?.startsWith(today) || schedule.date?.startsWith(today)).length,
          });
        }

      } catch (err) {
        const message = err instanceof Error ? err.message : 'データの取得に失敗しました';
        setError(message);
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

  // 表示するカードのみフィルタリング
  const visibleCards = dashboardCards.filter((card) => card.visible);


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

          {/* カード設定ボタン */}
          <IconSettings
            size={20}
            style={{ cursor: 'pointer', color: 'var(--mantine-color-dimmed)' }}
            onClick={openSettings}
          />
        </Group>
      </Stack>

      {/* カードグリッド */}
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

      {/* カード設定モーダル */}
      <DashboardCardSettings
        opened={settingsOpened}
        onClose={closeSettings}
        cards={dashboardCards}
        onSave={handleSaveCardSettings}
      />
    </Container>
  );
}
