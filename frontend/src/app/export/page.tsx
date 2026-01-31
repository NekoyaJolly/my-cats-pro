'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Card,
  Stack,
  Select,
  Button,
  Group,
  Alert,
  Loader,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconDownload, IconAlertCircle, IconFileExport } from '@tabler/icons-react';
import { PageTitle } from '@/components/PageTitle';

type ExportDataType = 'cats' | 'pedigrees' | 'medical_records' | 'care_schedules' | 'tags';
type ExportFormat = 'csv' | 'json';

export default function ExportPage() {
  const router = useRouter();
  const [dataType, setDataType] = useState<ExportDataType>('cats');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        notifications.show({
          title: 'エラー',
          message: 'ログインが必要です',
          color: 'red',
        });
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          dataType,
          format,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('エクスポートに失敗しました');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `export_${dataType}.${format}`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      notifications.show({
        title: 'エクスポート完了',
        message: 'ファイルのダウンロードが開始されました',
        color: 'green',
        icon: <IconDownload size={16} />,
      });
    } catch (error) {
      console.error('Export error:', error);
      notifications.show({
        title: 'エラー',
        message: 'エクスポートに失敗しました',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '5rem' }}>
      <Stack gap="lg">
        <Group justify="center">
          <PageTitle>データエクスポート</PageTitle>
        </Group>

        <Alert icon={<IconFileExport size={16} />} title="エクスポート機能" color="blue">
          データをCSVまたはJSON形式でダウンロードできます。
        </Alert>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Select
              label="エクスポート対象"
              description="エクスポートするデータの種類を選択してください"
              data={[
                { value: 'cats', label: '猫データ' },
                { value: 'pedigrees', label: '血統書データ' },
                { value: 'care_schedules', label: 'ケアスケジュール' },
                { value: 'tags', label: 'タグデータ' },
              ]}
              value={dataType}
              onChange={(value) => setDataType(value as ExportDataType)}
              required
            />

            <Select
              label="エクスポート形式"
              description="ファイル形式を選択してください"
              data={[
                { value: 'csv', label: 'CSV形式' },
                { value: 'json', label: 'JSON形式' },
              ]}
              value={format}
              onChange={(value) => setFormat(value as ExportFormat)}
              required
            />

            <DateInput
              label="開始日（オプション）"
              description="指定した日付以降のデータをエクスポート"
              placeholder="日付を選択"
              value={startDate}
              onChange={(value) => {
                if (typeof value === 'string') {
                  setStartDate(new Date(value));
                } else {
                  setStartDate(value);
                }
              }}
              clearable
            />

            <DateInput
              label="終了日（オプション）"
              description="指定した日付以前のデータをエクスポート"
              placeholder="日付を選択"
              value={endDate}
              onChange={(value) => {
                if (typeof value === 'string') {
                  setEndDate(new Date(value));
                } else {
                  setEndDate(value);
                }
              }}
              clearable
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => router.push('/more')}>
                キャンセル
              </Button>
              <Button
                leftSection={loading ? <Loader size="xs" /> : <IconDownload size={16} />}
                onClick={handleExport}
                disabled={loading}
              >
                {loading ? 'エクスポート中...' : 'エクスポート実行'}
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
