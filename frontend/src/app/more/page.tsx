'use client';

import { useRouter } from 'next/navigation';
import {
  Container,
  Card,
  Group,
  Text,
  SimpleGrid,
  Box,
} from '@mantine/core';
import { PageTitle } from '@/components/PageTitle';
import { 
  IconFileExport,
  IconFileImport,
  IconChevronRight
} from '@tabler/icons-react';

interface MenuItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'データエクスポート',
    description: '猫の情報をCSVやPDFで出力',
    icon: <IconFileExport size={24} />,
    href: '/export',
    color: 'cyan'
  },
  {
    title: 'データインポート',
    description: 'CSVファイルから猫の情報を一括登録',
    icon: <IconFileImport size={24} />,
    href: '/import',
    color: 'teal'
  }
];

export default function MorePage() {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
  <Container size="lg" style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)', padding: '1rem', paddingBottom: '5rem' }}>
      {/* ヘッダー */}
      <Group justify="center" mb="lg">
  <PageTitle style={{ color: 'var(--text-primary)' }}>その他の機能</PageTitle>
      </Group>

      {/* 機能一覧 */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {menuItems.map((item, index) => (
          <Card 
            key={index}
            shadow="sm" 
            padding="lg" 
            radius="md" 
            withBorder
            style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => handleNavigate(item.href)}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Group align="flex-start" gap="md">
                <Box
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: `var(--mantine-color-${item.color}-1)`,
                    color: `var(--mantine-color-${item.color}-7)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </Box>
                <Box style={{ flex: 1 }}>
                  <Text fw={600} size="md" mb="xs">
                    {item.title}
                  </Text>
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.4 }}>
                    {item.description}
                  </Text>
                </Box>
              </Group>
              <IconChevronRight 
                size={20} 
                style={{ 
                  color: 'var(--mantine-color-gray-5)',
                  marginTop: '2px',
                  flexShrink: 0
                }} 
              />
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
