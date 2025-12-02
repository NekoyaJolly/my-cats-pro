/**
 * DialNavigation 統合サンプル
 * 
 * このファイルは、DialNavigation と DialMenuSettings を統合する方法を示します。
 * 実際のダッシュボード画面で使用する際の参考にしてください。
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { DialNavigation } from '@/components/dashboard/DialNavigation';
import { DialMenuSettings, DialMenuItemConfig } from '@/components/dashboard/DialMenuSettings';
import {
  IconCat,
  IconUsers,
  IconCalendar,
  IconHeart,
  IconMedicalCross,
  IconPhoto,
  IconSettings,
} from '@tabler/icons-react';

/**
 * デフォルトのメニュー設定
 */
const DEFAULT_MENU_CONFIG: DialMenuItemConfig[] = [
  {
    id: '1',
    title: '在舎猫一覧',
    icon: <IconCat size={24} />,
    color: '#2563EB',
    href: '/cats',
    badge: 12,
    visible: true,
    order: 0,
    subActions: [
      { id: '1-1', title: '新規登録', icon: <IconCat size={18} />, href: '/cats/new' },
      { id: '1-2', title: '一括編集', icon: <IconCat size={18} />, href: '/cats/bulk-edit' },
    ],
  },
  {
    id: '2',
    title: '退舎猫',
    icon: <IconUsers size={24} />,
    color: '#22C55E',
    href: '/cats/retired',
    badge: 8,
    visible: true,
    order: 1,
  },
  {
    id: '3',
    title: '子猫一覧',
    icon: <IconCalendar size={24} />,
    color: '#F97316',
    href: '/kittens',
    badge: 5,
    visible: true,
    order: 2,
  },
  {
    id: '4',
    title: '予定管理',
    icon: <IconCalendar size={24} />,
    color: '#8B5CF6',
    href: '/schedule',
    visible: true,
    order: 3,
  },
  {
    id: '5',
    title: '健康記録',
    icon: <IconMedicalCross size={24} />,
    color: '#EF4444',
    href: '/medical-records',
    visible: true,
    order: 4,
  },
  {
    id: '6',
    title: 'ギャラリー',
    icon: <IconPhoto size={24} />,
    color: '#EC4899',
    href: '/gallery',
    visible: true,
    order: 5,
  },
  {
    id: '7',
    title: '里親管理',
    icon: <IconHeart size={24} />,
    color: '#F43F5E',
    href: '/adoption',
    visible: false,
    order: 6,
  },
  {
    id: '8',
    title: '設定',
    icon: <IconSettings size={24} />,
    color: '#64748B',
    href: '/settings',
    visible: false,
    order: 7,
  },
];

/**
 * DialNavigation 統合サンプルコンポーネント
 */
export function DialNavigationExample() {
  // メニュー項目の設定（localStorage から読み込み）
  const [menuConfig, setMenuConfig] = useState<DialMenuItemConfig[]>(() => {
    // サーバーサイドレンダリング対策
    if (typeof window === 'undefined') {
      return DEFAULT_MENU_CONFIG;
    }

    const saved = localStorage.getItem('dialMenuConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved dial menu config:', e);
      }
    }
    return DEFAULT_MENU_CONFIG;
  });

  // 設定モーダルの表示状態
  const [settingsOpened, setSettingsOpened] = useState(false);

  // visible なアイテムのみを order でソート (useMemo でメモ化)
  const visibleItems = useMemo(
    () => menuConfig.filter(item => item.visible).sort((a, b) => a.order - b.order),
    [menuConfig]
  );

  // ナビゲーション処理
  const handleNavigate = (href: string) => {
    console.log('Navigate to:', href);
    
    // Next.js の useRouter を使った遷移例
    // const router = useRouter();
    // router.push(href);
    
    // または window.location を使った遷移
    // window.location.href = href;
  };

  // 設定保存
  const handleSaveSettings = (updatedItems: DialMenuItemConfig[]) => {
    setMenuConfig(updatedItems);
    
    // localStorage に保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('dialMenuConfig', JSON.stringify(updatedItems));
    }
    
    // または API に保存する場合
    // try {
    //   await fetch('/api/user/dial-menu-settings', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(updatedItems),
    //   });
    //   console.log('Settings saved to server');
    // } catch (error) {
    //   console.error('Failed to save settings:', error);
    // }
  };

  // 初期読み込み時のログ
  useEffect(() => {
    console.log('Dial menu initialized:', {
      total: menuConfig.length,
      visible: visibleItems.length,
      hidden: menuConfig.length - visibleItems.length,
    });
  }, [menuConfig, visibleItems]);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 20 }}>
        ダイヤルナビゲーション サンプル
      </h1>

      {/* ダイヤルナビゲーション本体 */}
      <DialNavigation
        items={visibleItems}
        onNavigate={handleNavigate}
        onSettingsClick={() => setSettingsOpened(true)}
      />

      {/* 設定モーダル */}
      <DialMenuSettings
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        items={menuConfig}
        onSave={handleSaveSettings}
      />

      {/* デバッグ情報 */}
      <div style={{
        marginTop: 40,
        padding: 20,
        background: '#F3F4F6',
        borderRadius: 8,
      }}>
        <h3>デバッグ情報</h3>
        <p>表示中の項目: {visibleItems.length} / {menuConfig.length}</p>
        <details>
          <summary style={{ cursor: 'pointer', marginTop: 10 }}>
            設定詳細を表示
          </summary>
          <pre style={{
            marginTop: 10,
            padding: 10,
            background: 'white',
            borderRadius: 4,
            overflow: 'auto',
            fontSize: 12,
          }}>
            {JSON.stringify(menuConfig, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

/**
 * リセット機能付きバージョン
 */
export function DialNavigationWithReset() {
  const [menuConfig, setMenuConfig] = useState<DialMenuItemConfig[]>(DEFAULT_MENU_CONFIG);
  const [settingsOpened, setSettingsOpened] = useState(false);

  const visibleItems = useMemo(
    () => menuConfig.filter(item => item.visible).sort((a, b) => a.order - b.order),
    [menuConfig]
  );

  // 設定をリセット
  const handleReset = () => {
    setMenuConfig(DEFAULT_MENU_CONFIG);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dialMenuConfig');
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            background: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          設定をリセット
        </button>
      </div>

      <DialNavigation
        items={visibleItems}
        onNavigate={(href) => console.log('Navigate:', href)}
        onSettingsClick={() => setSettingsOpened(true)}
      />

      <DialMenuSettings
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        items={menuConfig}
        onSave={setMenuConfig}
      />
    </div>
  );
}

/**
 * API 連携バージョン
 */
export function DialNavigationWithAPI() {
  const [menuConfig, setMenuConfig] = useState<DialMenuItemConfig[]>(DEFAULT_MENU_CONFIG);
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [loading, setLoading] = useState(true);

  // visible なアイテムのみを order でソート (useMemo でメモ化)
  const visibleItems = useMemo(
    () => menuConfig.filter(item => item.visible).sort((a, b) => a.order - b.order),
    [menuConfig]
  );

  // 初期読み込み
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/user/dial-menu-settings');
        if (response.ok) {
          const data = await response.json();
          setMenuConfig(data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 設定保存
  const handleSaveSettings = async (updatedItems: DialMenuItemConfig[]) => {
    try {
      const response = await fetch('/api/user/dial-menu-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems),
      });

      if (response.ok) {
        setMenuConfig(updatedItems);
        console.log('Settings saved successfully');
      } else {
        console.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <DialNavigation
        items={visibleItems}
        onNavigate={(href) => console.log('Navigate:', href)}
        onSettingsClick={() => setSettingsOpened(true)}
      />

      <DialMenuSettings
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
        items={menuConfig}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
