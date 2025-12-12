'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Stack,
  Title,
  Group,
  Button,
  NumberInput,
  Text,
  Accordion,
  Grid,
  Alert,
  LoadingOverlay,
  Divider,
  Badge,
  Tooltip,
  Select,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconRefresh, IconAlertCircle, IconCheck, IconAdjustments } from '@tabler/icons-react';

// 座標設定の型定義
interface Position {
  x: number;
  y: number;
  align?: 'left' | 'center' | 'right';
}

interface ParentPositions {
  name: Position;
  color: Position;
  eyeColor?: Position;
  jcu: Position;
}

interface GrandParentPositions {
  name: Position;
  color: Position;
  jcu: Position;
}

interface GreatGrandParentPositions {
  name: Position;
  jcu: Position;
}

interface FontSizes {
  catName: number;
  wcaNo: number;
  headerInfo: number;
  parentName: number;
  parentDetail: number;
  grandParentName: number;
  grandParentDetail: number;
  greatGrandParent: number;
  footer: number;
}

interface PositionsConfig {
  offsetX: number;
  offsetY: number;
  breed: Position;
  sex: Position;
  dateOfBirth: Position;
  eyeColor: Position;
  color: Position;
  catName: Position;
  wcaNo: Position;
  owner: Position;
  breeder: Position;
  dateOfRegistration: Position;
  littersM: Position;
  littersF: Position;
  sire: ParentPositions;
  dam: ParentPositions;
  grandParents: {
    ff: GrandParentPositions;
    fm: GrandParentPositions;
    mf: GrandParentPositions;
    mm: GrandParentPositions;
  };
  greatGrandParents: {
    fff: GreatGrandParentPositions;
    ffm: GreatGrandParentPositions;
    fmf: GreatGrandParentPositions;
    fmm: GreatGrandParentPositions;
    mff: GreatGrandParentPositions;
    mfm: GreatGrandParentPositions;
    mmf: GreatGrandParentPositions;
    mmm: GreatGrandParentPositions;
  };
  otherOrganizationsNo: Position;
  fontSizes: FontSizes;
}

// 位置入力コンポーネント
function PositionInput({
  label,
  position,
  onChange,
  showAlign = false,
}: {
  label: string;
  position: Position;
  onChange: (pos: Position) => void;
  showAlign?: boolean;
}) {
  return (
    <Grid align="center" gutter="xs">
      <Grid.Col span={showAlign ? 3 : 4}>
        <Text size="sm" fw={500}>{label}</Text>
      </Grid.Col>
      <Grid.Col span={showAlign ? 3 : 4}>
        <NumberInput
          size="xs"
          label="X"
          value={position.x}
          onChange={(val) => onChange({ ...position, x: Number(val) || 0 })}
          min={0}
          max={400}
        />
      </Grid.Col>
      <Grid.Col span={showAlign ? 3 : 4}>
        <NumberInput
          size="xs"
          label="Y"
          value={position.y}
          onChange={(val) => onChange({ ...position, y: Number(val) || 0 })}
          min={0}
          max={300}
        />
      </Grid.Col>
      {showAlign && (
        <Grid.Col span={3}>
          <Select
            size="xs"
            label="揃え"
            value={position.align || 'left'}
            onChange={(val) => onChange({ ...position, align: (val as 'left' | 'center' | 'right') || 'left' })}
            data={[
              { value: 'left', label: '左' },
              { value: 'center', label: '中央' },
              { value: 'right', label: '右' },
            ]}
          />
        </Grid.Col>
      )}
    </Grid>
  );
}

// フォントサイズ入力コンポーネント
function FontSizeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <Grid align="center" gutter="xs">
      <Grid.Col span={6}>
        <Text size="sm">{label}</Text>
      </Grid.Col>
      <Grid.Col span={6}>
        <NumberInput
          size="xs"
          value={value}
          onChange={(val) => onChange(Number(val) || 10)}
          min={6}
          max={24}
          suffix="pt"
        />
      </Grid.Col>
    </Grid>
  );
}

export function PrintSettingsEditor() {
  const [settings, setSettings] = useState<PositionsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

  // 設定を取得
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/v1/pedigrees/print-settings`);
      if (!response.ok) throw new Error('設定の取得に失敗しました');
      const json = await response.json();
      // APIレスポンスは { success: true, data: {...} } 形式
      const data = json.data || json;
      setSettings(data);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // 設定を更新
  const updateSetting = <K extends keyof PositionsConfig>(
    key: K,
    value: PositionsConfig[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  // ネストした設定を更新
  const updateNestedSetting = (
    parentKey: string,
    childKey: string,
    value: Position
  ) => {
    if (!settings) return;
    const parent = settings[parentKey as keyof PositionsConfig];
    if (typeof parent === 'object' && parent !== null) {
      setSettings({
        ...settings,
        [parentKey]: {
          ...(parent as Record<string, unknown>),
          [childKey]: value,
        },
      });
      setHasChanges(true);
    }
  };

  // 保存
  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/pedigrees/print-settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('保存に失敗しました');
      setHasChanges(false);
      notifications.show({
        title: '保存完了',
        message: '印刷設定を保存しました',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: err instanceof Error ? err.message : '保存に失敗しました',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setSaving(false);
    }
  };

  // リセット
  const handleReset = async () => {
    if (!confirm('設定をデフォルトにリセットしますか？')) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/pedigrees/print-settings/reset`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('リセットに失敗しました');
      const json = await response.json();
      // APIレスポンスは { success: true, data: {...} } 形式
      const data = json.data || json;
      setSettings(data);
      setHasChanges(false);
      notifications.show({
        title: 'リセット完了',
        message: '設定をデフォルトにリセットしました',
        color: 'blue',
        icon: <IconRefresh size={16} />,
      });
    } catch (err) {
      notifications.show({
        title: 'エラー',
        message: err instanceof Error ? err.message : 'リセットに失敗しました',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red">
        {error}
        <Button mt="sm" size="xs" onClick={fetchSettings}>
          再読み込み
        </Button>
      </Alert>
    );
  }

  return (
    <Paper p="md" shadow="sm" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} />

      <Stack gap="md">
        <Group justify="space-between">
          <Group>
            <Title order={4}>
              <IconAdjustments size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              印刷位置設定
            </Title>
            {hasChanges && (
              <Badge color="orange" variant="light">未保存の変更あり</Badge>
            )}
          </Group>
          <Group>
            <Tooltip label="デフォルトにリセット">
              <Button
                variant="light"
                color="gray"
                leftSection={<IconRefresh size={16} />}
                onClick={handleReset}
                disabled={saving}
              >
                リセット
              </Button>
            </Tooltip>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges}
            >
              保存
            </Button>
          </Group>
        </Group>

        <Text size="sm" c="dimmed">
          血統書PDFの各項目の印刷位置（mm単位）とフォントサイズを調整できます。
          変更後は「保存」ボタンで反映されます。
        </Text>

        {settings && (
          <Accordion variant="separated" defaultValue="global">
            {/* グローバルオフセット */}
            <Accordion.Item value="global">
              <Accordion.Control>グローバル設定</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">全体のオフセット（用紙のズレ補正）</Text>
                  <Grid>
                    <Grid.Col span={6}>
                      <NumberInput
                        label="X オフセット (mm)"
                        value={settings.offsetX}
                        onChange={(val) => updateSetting('offsetX', Number(val) || 0)}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <NumberInput
                        label="Y オフセット (mm)"
                        value={settings.offsetY}
                        onChange={(val) => updateSetting('offsetY', Number(val) || 0)}
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* ヘッダー情報 */}
            <Accordion.Item value="header">
              <Accordion.Control>ヘッダー情報</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <PositionInput
                    label="猫名"
                    position={settings.catName}
                    onChange={(pos) => updateSetting('catName', pos)}
                    showAlign
                  />
                  <PositionInput
                    label="WCA番号"
                    position={settings.wcaNo}
                    onChange={(pos) => updateSetting('wcaNo', pos)}
                    showAlign
                  />
                  <Divider my="xs" />
                  <PositionInput
                    label="品種"
                    position={settings.breed}
                    onChange={(pos) => updateSetting('breed', pos)}
                  />
                  <PositionInput
                    label="性別"
                    position={settings.sex}
                    onChange={(pos) => updateSetting('sex', pos)}
                  />
                  <PositionInput
                    label="生年月日"
                    position={settings.dateOfBirth}
                    onChange={(pos) => updateSetting('dateOfBirth', pos)}
                  />
                  <PositionInput
                    label="毛色"
                    position={settings.color}
                    onChange={(pos) => updateSetting('color', pos)}
                  />
                  <PositionInput
                    label="目色"
                    position={settings.eyeColor}
                    onChange={(pos) => updateSetting('eyeColor', pos)}
                  />
                  <Divider my="xs" />
                  <PositionInput
                    label="オーナー"
                    position={settings.owner}
                    onChange={(pos) => updateSetting('owner', pos)}
                    showAlign
                  />
                  <PositionInput
                    label="ブリーダー"
                    position={settings.breeder}
                    onChange={(pos) => updateSetting('breeder', pos)}
                    showAlign
                  />
                  <PositionInput
                    label="登録日"
                    position={settings.dateOfRegistration}
                    onChange={(pos) => updateSetting('dateOfRegistration', pos)}
                  />
                  <PositionInput
                    label="同腹数(♂)"
                    position={settings.littersM}
                    onChange={(pos) => updateSetting('littersM', pos)}
                  />
                  <PositionInput
                    label="同腹数(♀)"
                    position={settings.littersF}
                    onChange={(pos) => updateSetting('littersF', pos)}
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* 両親 */}
            <Accordion.Item value="parents">
              <Accordion.Control>両親（Sire / Dam）</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Text fw={500}>父親（Sire）</Text>
                  <PositionInput
                    label="名前"
                    position={settings.sire.name}
                    onChange={(pos) => updateNestedSetting('sire', 'name', pos)}
                  />
                  <PositionInput
                    label="毛色"
                    position={settings.sire.color}
                    onChange={(pos) => updateNestedSetting('sire', 'color', pos)}
                  />
                  <PositionInput
                    label="登録番号"
                    position={settings.sire.jcu}
                    onChange={(pos) => updateNestedSetting('sire', 'jcu', pos)}
                  />

                  <Divider my="xs" />

                  <Text fw={500}>母親（Dam）</Text>
                  <PositionInput
                    label="名前"
                    position={settings.dam.name}
                    onChange={(pos) => updateNestedSetting('dam', 'name', pos)}
                  />
                  <PositionInput
                    label="毛色"
                    position={settings.dam.color}
                    onChange={(pos) => updateNestedSetting('dam', 'color', pos)}
                  />
                  <PositionInput
                    label="登録番号"
                    position={settings.dam.jcu}
                    onChange={(pos) => updateNestedSetting('dam', 'jcu', pos)}
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* 祖父母 */}
            <Accordion.Item value="grandparents">
              <Accordion.Control>祖父母</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  {(['ff', 'fm', 'mf', 'mm'] as const).map((key) => {
                    const labels: Record<string, string> = {
                      ff: '父方祖父',
                      fm: '父方祖母',
                      mf: '母方祖父',
                      mm: '母方祖母',
                    };
                    const gp = settings.grandParents[key];
                    return (
                      <div key={key}>
                        <Text fw={500} mb="xs">{labels[key]}</Text>
                        <Stack gap="xs">
                          <PositionInput
                            label="名前"
                            position={gp.name}
                            onChange={(pos) => {
                              setSettings({
                                ...settings,
                                grandParents: {
                                  ...settings.grandParents,
                                  [key]: { ...gp, name: pos },
                                },
                              });
                              setHasChanges(true);
                            }}
                          />
                          <PositionInput
                            label="毛色"
                            position={gp.color}
                            onChange={(pos) => {
                              setSettings({
                                ...settings,
                                grandParents: {
                                  ...settings.grandParents,
                                  [key]: { ...gp, color: pos },
                                },
                              });
                              setHasChanges(true);
                            }}
                          />
                          <PositionInput
                            label="登録番号"
                            position={gp.jcu}
                            onChange={(pos) => {
                              setSettings({
                                ...settings,
                                grandParents: {
                                  ...settings.grandParents,
                                  [key]: { ...gp, jcu: pos },
                                },
                              });
                              setHasChanges(true);
                            }}
                          />
                        </Stack>
                        <Divider my="sm" />
                      </div>
                    );
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* 曾祖父母 */}
            <Accordion.Item value="greatgrandparents">
              <Accordion.Control>曾祖父母</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  {(['fff', 'ffm', 'fmf', 'fmm', 'mff', 'mfm', 'mmf', 'mmm'] as const).map((key) => {
                    const labels: Record<string, string> = {
                      fff: '父方祖父の父',
                      ffm: '父方祖父の母',
                      fmf: '父方祖母の父',
                      fmm: '父方祖母の母',
                      mff: '母方祖父の父',
                      mfm: '母方祖父の母',
                      mmf: '母方祖母の父',
                      mmm: '母方祖母の母',
                    };
                    const ggp = settings.greatGrandParents[key];
                    return (
                      <div key={key}>
                        <Text fw={500} size="sm" mb="xs">{labels[key]}</Text>
                        <Grid>
                          <Grid.Col span={6}>
                            <PositionInput
                              label="名前"
                              position={ggp.name}
                              onChange={(pos) => {
                                setSettings({
                                  ...settings,
                                  greatGrandParents: {
                                    ...settings.greatGrandParents,
                                    [key]: { ...ggp, name: pos },
                                  },
                                });
                                setHasChanges(true);
                              }}
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <PositionInput
                              label="登録番号"
                              position={ggp.jcu}
                              onChange={(pos) => {
                                setSettings({
                                  ...settings,
                                  greatGrandParents: {
                                    ...settings.greatGrandParents,
                                    [key]: { ...ggp, jcu: pos },
                                  },
                                });
                                setHasChanges(true);
                              }}
                            />
                          </Grid.Col>
                        </Grid>
                      </div>
                    );
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* フォントサイズ */}
            <Accordion.Item value="fonts">
              <Accordion.Control>フォントサイズ</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <FontSizeInput
                    label="猫名"
                    value={settings.fontSizes.catName}
                    onChange={(val) => updateSetting('fontSizes', { ...settings.fontSizes, catName: val })}
                  />
                  <FontSizeInput
                    label="WCA番号"
                    value={settings.fontSizes.wcaNo}
                    onChange={(val) => updateSetting('fontSizes', { ...settings.fontSizes, wcaNo: val })}
                  />
                  <FontSizeInput
                    label="ヘッダー情報"
                    value={settings.fontSizes.headerInfo}
                    onChange={(val) => updateSetting('fontSizes', { ...settings.fontSizes, headerInfo: val })}
                  />
                  <FontSizeInput
                    label="親の名前"
                    value={settings.fontSizes.parentName}
                    onChange={(val) => updateSetting('fontSizes', { ...settings.fontSizes, parentName: val })}
                  />
                  <FontSizeInput
                    label="親の詳細"
                    value={settings.fontSizes.parentDetail}
                    onChange={(val) => updateSetting('fontSizes', { ...settings.fontSizes, parentDetail: val })}
                  />
                  <FontSizeInput
                    label="祖父母の名前"
                    value={settings.fontSizes.grandParentName}
                    onChange={(val) => updateSetting('fontSizes', { ...settings.fontSizes, grandParentName: val })}
                  />
                  <FontSizeInput
                    label="祖父母の詳細"
                    value={settings.fontSizes.grandParentDetail}
                    onChange={(val) => updateSetting('fontSizes', { ...settings.fontSizes, grandParentDetail: val })}
                  />
                  <FontSizeInput
                    label="曾祖父母"
                    value={settings.fontSizes.greatGrandParent}
                    onChange={(val) => updateSetting('fontSizes', { ...settings.fontSizes, greatGrandParent: val })}
                  />
                  <FontSizeInput
                    label="フッター"
                    value={settings.fontSizes.footer}
                    onChange={(val) => updateSetting('fontSizes', { ...settings.fontSizes, footer: val })}
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            {/* その他 */}
            <Accordion.Item value="other">
              <Accordion.Control>その他</Accordion.Control>
              <Accordion.Panel>
                <PositionInput
                  label="他団体登録番号"
                  position={settings.otherOrganizationsNo}
                  onChange={(pos) => updateSetting('otherOrganizationsNo', pos)}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}
      </Stack>
    </Paper>
  );
}
