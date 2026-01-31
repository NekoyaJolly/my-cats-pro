'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Card,
  Stack,
  Title,
  Text,
  Select,
  Button,
  Group,
  Alert,
  Table,
  Badge,
  Progress,
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import {
  IconUpload,
  IconFileTypeCsv,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconFileImport,
} from '@tabler/icons-react';
import { PageTitle } from '@/components/PageTitle';

type ImportDataType = 'cats' | 'pedigrees' | 'tags';

interface ImportResult {
  successCount: number;
  errorCount: number;
  totalCount: number;
  errors?: string[];
}

interface PreviewData {
  previewCount: number;
  sampleData: Record<string, unknown>[];
  columns: string[];
  totalCount: number;
}

/**
 * データインポートページ
 * 
 * CSV形式のファイルからデータをインポートできます
 */
export default function ImportPage() {
  const router = useRouter();
  const [dataType, setDataType] = useState<ImportDataType>('cats');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  /**
   * ファイルがドロップされた時の処理
   */
  const handleFileDrop = async (files: File[]) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setResult(null);

    // プレビューを取得
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

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/preview`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 'プレビューの取得に失敗しました'
        );
      }

      const data = await response.json();
      setPreview(data.data);

      notifications.show({
        title: 'プレビュー取得成功',
        message: `${data.data.totalCount}件のデータが検出されました`,
        color: 'green',
      });
    } catch (error) {
      console.error('Preview error:', error);
      notifications.show({
        title: 'エラー',
        message: error instanceof Error ? error.message : 'プレビューの取得に失敗しました',
        color: 'red',
      });
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * インポートを実行
   */
  const handleImport = async () => {
    if (!file) {
      notifications.show({
        title: 'エラー',
        message: 'ファイルを選択してください',
        color: 'red',
      });
      return;
    }

    setImporting(true);
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

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/${dataType}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || 'インポートに失敗しました'
        );
      }

      const data = await response.json();
      setResult(data.data);

      if (data.data.errorCount === 0) {
        notifications.show({
          title: 'インポート完了',
          message: `${data.data.successCount}件のデータをインポートしました`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      } else {
        notifications.show({
          title: 'インポート完了（一部エラー）',
          message: `成功: ${data.data.successCount}件、失敗: ${data.data.errorCount}件`,
          color: 'yellow',
          icon: <IconAlertCircle size={16} />,
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      notifications.show({
        title: 'エラー',
        message: error instanceof Error ? error.message : 'インポートに失敗しました',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setImporting(false);
    }
  };

  /**
   * リセット処理
   */
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <Container 
      size="md" 
      style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '5rem' }}
    >
      <Stack gap="lg">
        <Group justify="center">
          <PageTitle>データインポート</PageTitle>
        </Group>

        <Alert 
          icon={<IconFileImport size={16} />} 
          title="インポート機能" 
          color="blue"
        >
          CSV形式のファイルからデータを一括登録できます。
        </Alert>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Select
              label="インポート対象"
              description="インポートするデータの種類を選択してください"
              data={[
                { value: 'cats', label: '猫データ' },
                { value: 'pedigrees', label: '血統書データ' },
                { value: 'tags', label: 'タグデータ' },
              ]}
              value={dataType}
              onChange={(value) => setDataType(value as ImportDataType)}
              required
              disabled={!!file}
            />

            {!file && (
              <Dropzone
                onDrop={handleFileDrop}
                accept={[MIME_TYPES.csv]}
                maxSize={5 * 1024 * 1024} // 5MB
                loading={loading}
              >
                <Group 
                  justify="center" 
                  gap="xl" 
                  style={{ minHeight: 120, pointerEvents: 'none' }}
                >
                  <Dropzone.Accept>
                    <IconUpload size={50} stroke={1.5} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={50} stroke={1.5} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconFileTypeCsv size={50} stroke={1.5} />
                  </Dropzone.Idle>

                  <div>
                    <Text size="xl" inline>
                      CSVファイルをドラッグ＆ドロップ
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      または、クリックしてファイルを選択（最大5MB）
                    </Text>
                  </div>
                </Group>
              </Dropzone>
            )}

            {file && preview && (
              <>
                <Alert 
                  icon={<IconCheck size={16} />} 
                  title="ファイル読み込み完了" 
                  color="green"
                >
                  <Stack gap={4}>
                    <Text size="sm">ファイル名: {file.name}</Text>
                    <Text size="sm">総件数: {preview.totalCount}件</Text>
                    <Text size="sm">検出カラム: {preview.columns.join(', ')}</Text>
                  </Stack>
                </Alert>

                <div>
                  <Text fw={600} mb="xs">
                    プレビュー（最初の{preview.previewCount}件）
                  </Text>
                  <div style={{ overflowX: 'auto' }}>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          {preview.columns.map((col) => (
                            <Table.Th key={col}>{col}</Table.Th>
                          ))}
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {preview.sampleData.map((row, i) => (
                          <Table.Tr key={i}>
                            {preview.columns.map((col) => (
                              <Table.Td key={col}>
                                {String(row[col] ?? '')}
                              </Table.Td>
                            ))}
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </div>
                </div>
              </>
            )}

            {result && (
              <>
                <Alert
                  icon={result.errorCount === 0 ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
                  title="インポート結果"
                  color={result.errorCount === 0 ? 'green' : 'yellow'}
                >
                  <Stack gap="xs">
                    <Group gap="md">
                      <Badge color="green" variant="filled">
                        成功: {result.successCount}件
                      </Badge>
                      <Badge color="red" variant="filled">
                        失敗: {result.errorCount}件
                      </Badge>
                      <Badge color="gray" variant="filled">
                        総件数: {result.totalCount}件
                      </Badge>
                    </Group>
                    <Progress
                      value={(result.successCount / result.totalCount) * 100}
                      color="green"
                      size="lg"
                    />
                  </Stack>
                </Alert>

                {result.errors && result.errors.length > 0 && (
                  <Alert 
                    icon={<IconAlertCircle size={16} />} 
                    title="エラー詳細" 
                    color="red"
                  >
                    <Stack gap="xs">
                      {result.errors.map((error, i) => (
                        <Text key={i} size="sm">
                          {error}
                        </Text>
                      ))}
                    </Stack>
                  </Alert>
                )}
              </>
            )}

            <Group justify="space-between" mt="md">
              <Group>
                {file && (
                  <Button variant="subtle" onClick={handleReset}>
                    リセット
                  </Button>
                )}
                <Button variant="subtle" onClick={() => router.push('/more')}>
                  戻る
                </Button>
              </Group>
              
              {file && !result && (
                <Button
                  leftSection={<IconUpload size={16} />}
                  onClick={handleImport}
                  loading={importing}
                  disabled={!preview}
                >
                  {importing ? 'インポート中...' : 'インポート実行'}
                </Button>
              )}
            </Group>
          </Stack>
        </Card>

        {/* CSV フォーマット説明 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="xs">
            <Title order={4}>CSV フォーマット</Title>
            <Text size="sm" c="dimmed">
              <strong>猫データ:</strong> name, gender, birthDate, breed, color, registrationNumber, microchipNumber, notes
            </Text>
            <Text size="sm" c="dimmed">
              <strong>血統書データ:</strong> pedigreeId, catName, title, breedCode, genderCode, coatColorCode
            </Text>
            <Text size="sm" c="dimmed">
              <strong>タグデータ:</strong> name, category, group, color, isActive
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
