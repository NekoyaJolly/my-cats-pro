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
  ActionIcon,
  Button,
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
  IconAdjustments,
  IconList,
  IconBabyCarriage,
  IconTag,
  IconCalendarTime,
} from '@tabler/icons-react';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { notifications } from '@mantine/notifications';
import { apiClient } from '@/lib/api/client';
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

  // レスポンシブデザイン: モバイル縦向き判定
  const isMobilePortrait = useMediaQuery('(max-width: 768px) and (orientation: portrait)');

  // ページタイトルを設定
  useEffect(() => {
    setPageTitle('ホーム');
    return () => setPageTitle(null);
  }, [setPageTitle]);

  // 認証チェック
  useEffect(() => {
    console.log('🔐 認証状態:', { isAuthenticated, initialized, hasToken: !!accessToken });
    if (initialized && !isAuthenticated) {
      console.warn('⚠️ 未認証です。ログインページにリダイレクトします');
      router.push('/login');
    }
  }, [initialized, isAuthenticated, router, accessToken]);

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !initialized) {
        console.log('⏳ 認証初期化を待機中...');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log('📡 API呼び出し開始...');
        
        // 猫データを取得
        const catsResponse = await apiClient.get('/cats', {
           
          query: { limit: 1000 } as any,
        });
        
        console.log('🐱 猫データレスポンス:', catsResponse);
        
        if (!catsResponse.success) {
          console.error('❌ 猫データ取得失敗:', catsResponse);
          throw new Error(catsResponse.error || '猫データの取得に失敗しました');
        }
        
        const fetchedCats = Array.isArray(catsResponse.data) ? catsResponse.data : [];
        console.log(`✅ 猫データ取得成功: ${fetchedCats.length}件`);
        setCats(fetchedCats as Cat[]);

        // ケアスケジュールのサマリーを取得
        try {
          const careResponse = await apiClient.get('/care/schedules');
          if (careResponse.success && Array.isArray(careResponse.data)) {
            const schedules = careResponse.data;
            setCareSummary({
              total: schedules.length,
              completed: schedules.filter((s: any) => s.status === 'completed').length,
              pending: schedules.filter((s: any) => s.status !== 'completed').length,
            });
          }
        } catch (careError) {
          console.warn('⚠️ ケアスケジュールの取得に失敗しました:', careError);
        }

        // 交配予定のサマリーを取得
        try {
          const breedingResponse = await apiClient.get('/breeding');
          if (breedingResponse.success && Array.isArray(breedingResponse.data)) {
            const schedules = breedingResponse.data;
            const today = new Date().toISOString().split('T')[0];
            setBreedingSummary({
              total: schedules.length,
              today: schedules.filter((s: any) => s.breedingDate?.startsWith(today) || s.date?.startsWith(today)).length,
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
    
    // デフォルトのダッシュボードカード定義（サイドバーの項目と同じ）
    const defaultDashboardCards: Omit<DashboardCardConfig, 'visible' | 'order'>[] = [
      {
        id: 'new-cat',
        title: '新規猫登録',
        description: '新しい猫を登録する',
        icon: <IconPlus size={32} />,
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
        icon: <IconStethoscope size={32} />,
        color: 'teal',
        href: '/care',
        badge: careSummary.pending > 0 ? careSummary.pending : undefined,
        stats: careSummary.pending > 0 ? `未完了${careSummary.pending}件` : '完了済み',
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
        id: 'pedigree',
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
    ];
    
    const settings = loadDashboardSettings();
    const cardsWithDefaults = defaultDashboardCards.map((card, index) => ({
      ...card,
      visible: true,
      order: index,
    }));
    
    const appliedCards = applyDashboardSettings(cardsWithDefaults, settings);
    setDashboardCards(appliedCards);
  }, [cats.length, careSummary.pending, breedingSummary.today]);

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
      {/* ウェルカムメッセージと設定ボタン */}
      <Stack gap="lg" mb="xl">
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1 }}>
            <Title order={2} mb="xs">おかえりなさい 👋</Title>
            <Text size="sm" c="dimmed">{today}</Text>
          </Box>
          
          {/* カスタマイズボタン */}
          {isMobilePortrait ? (
            <ActionIcon
              variant="light"
              color="gray"
              size="lg"
              onClick={openSettings}
              title="ホーム画面をカスタマイズ"
            >
              <IconAdjustments size={20} />
            </ActionIcon>
          ) : (
            <Button
              variant="light"
              color="gray"
              leftSection={<IconSettings size={18} />}
              onClick={openSettings}
            >
              カスタマイズ
            </Button>
          )}
        </Group>
      </Stack>

      {/* レスポンシブレイアウト */}
      {isMobilePortrait ? (
        // モバイル縦向き: iPhoneスタイルのシンプルアイコングリッド
        <SimpleGrid
          cols={3}
          spacing="xl"
          style={{
            maxWidth: '400px',
            margin: '0 auto',
          }}
        >
          {visibleCards.map((card) => (
            <Box
              key={card.id}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
              }}
              onClick={() => router.push(card.href)}
            >
              <Stack gap="xs" align="center">
                {/* アイコン部分 */}
                <Box style={{ position: 'relative' }}>
                  <ThemeIcon
                    size={68}
                    radius="lg"
                    variant="light"
                    color={card.color}
                    style={{
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {card.icon}
                  </ThemeIcon>
                  
                  {/* バッジ */}
                  {card.badge !== undefined && (
                    <Badge
                      variant="filled"
                      color="red"
                      size="sm"
                      circle
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        minWidth: '20px',
                        height: '20px',
                        padding: '0 6px',
                      }}
                    >
                      {card.badge}
                    </Badge>
                  )}
                </Box>
                
                {/* ラベル */}
                <Text
                  size="xs"
                  fw={500}
                  style={{
                    maxWidth: '80px',
                    wordBreak: 'keep-all',
                    lineHeight: 1.3,
                  }}
                >
                  {card.title}
                </Text>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
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
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
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
    </Container>
  );
}
