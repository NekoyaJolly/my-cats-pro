'use client';

import { useState, useCallback } from 'react';
import {
    Stack, Group, Text, Button, TextInput, Select, NumberInput,
    ActionIcon, Card, Badge, Collapse, Switch, Modal, useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash, IconEdit, IconChevronDown, IconChevronRight, IconGripVertical } from '@tabler/icons-react';

import type { FieldConfig, FieldDataSource, DataSourceInfo } from './types';

interface FieldsPanelProps {
    positions: Record<string, FieldConfig>;
    dataSources: DataSourceInfo[];
    onAddField: (fieldName: string, config: FieldConfig) => void;
    onUpdateField: (fieldName: string, config: Partial<FieldConfig>) => void;
    onRemoveField: (fieldName: string) => void;
}

/** 新規フィールド追加モーダル用の初期値 */
const defaultNewField: FieldConfig = {
    x: 10,
    y: 10,
    width: 50,
    height: 15,
    fontSize: 12,
    align: 'left',
    fontWeight: 'normal',
    color: '#333333',
    label: '',
};

export function FieldsPanel({
    positions,
    dataSources,
    onAddField,
    onUpdateField,
    onRemoveField,
}: FieldsPanelProps) {
    const theme = useMantineTheme();
    const [opened, { open, close }] = useDisclosure(false);
    const [editField, setEditField] = useState<string | null>(null);
    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldConfig, setNewFieldConfig] = useState<FieldConfig>({ ...defaultNewField });
    const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

    const toggleExpand = useCallback((name: string) => {
        setExpandedFields((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    }, []);

    const handleAddField = () => {
        if (!newFieldKey.trim()) return;
        const key = newFieldKey.trim().replace(/\s+/g, '_');
        if (positions[key]) return;

        onAddField(key, { ...newFieldConfig, label: newFieldConfig.label || key });
        setNewFieldKey('');
        setNewFieldConfig({ ...defaultNewField });
        close();
    };

    const handleOpenEditModal = (fieldName: string) => {
        const pos = positions[fieldName];
        if (!pos) return;
        setEditField(fieldName);
        setNewFieldConfig({ ...pos });
        open();
    };

    const handleSaveEdit = () => {
        if (!editField) return;
        onUpdateField(editField, newFieldConfig);
        setEditField(null);
        setNewFieldConfig({ ...defaultNewField });
        close();
    };

    const handleOpenCreateModal = () => {
        setEditField(null);
        setNewFieldKey('');
        setNewFieldConfig({ ...defaultNewField });
        open();
    };

    /** データソースを変更 */
    const handleDataSourceChange = useCallback((
        type: string | null,
        field?: string,
    ) => {
        if (!type) {
            setNewFieldConfig((prev) => ({ ...prev, dataSource: undefined }));
            return;
        }
        setNewFieldConfig((prev) => ({
            ...prev,
            dataSource: {
                type: type as FieldDataSource['type'],
                field: field ?? undefined,
            },
        }));
    }, []);

    const fieldEntries = Object.entries(positions);
    const dsTypeOptions = dataSources.map((ds) => ({ value: ds.type, label: ds.label }));

    const selectedDsType = newFieldConfig.dataSource?.type;
    const selectedDs = selectedDsType ? dataSources.find((ds) => ds.type === selectedDsType) : null;
    const dsFieldOptions = selectedDs
        ? selectedDs.fields.map((f) => ({ value: f.key, label: f.label }))
        : [];

    return (
        <>
            <Stack gap="md">
                {/* ヘッダ */}
                <Group justify="space-between">
                    <Text fw={600} size="md">フィールド一覧 ({fieldEntries.length})</Text>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        size="compact-sm"
                        onClick={handleOpenCreateModal}
                    >
                        フィールド追加
                    </Button>
                </Group>

                {/* フィールドリスト */}
                {fieldEntries.length === 0 ? (
                    <Text c="dimmed" ta="center" py="xl">
                        フィールドがありません。「フィールド追加」から追加してください。
                    </Text>
                ) : (
                    <Stack gap="xs">
                        {fieldEntries.map(([name, pos]) => (
                            <Card
                                key={name}
                                withBorder
                                padding="xs"
                                style={{
                                    backgroundColor: expandedFields.has(name) ? theme.colors.blue[0] : undefined,
                                }}
                            >
                                <Group justify="space-between" wrap="nowrap">
                                    <Group
                                        gap="xs"
                                        style={{ cursor: 'pointer', flex: 1 }}
                                        onClick={() => toggleExpand(name)}
                                    >
                                        <IconGripVertical size={14} style={{ color: theme.colors.gray[5] }} />
                                        {expandedFields.has(name)
                                            ? <IconChevronDown size={14} />
                                            : <IconChevronRight size={14} />
                                        }
                                        <Text size="sm" fw={500} lineClamp={1}>{pos.label || name}</Text>
                                        {pos.dataSource && (
                                            <Badge size="xs" variant="light" color="grape">
                                                {dataSources.find((ds) => ds.type === pos.dataSource?.type)?.label ?? pos.dataSource.type}
                                            </Badge>
                                        )}
                                    </Group>
                                    <Group gap={4} wrap="nowrap">
                                        <ActionIcon
                                            size="sm" variant="subtle" color="blue"
                                            onClick={() => handleOpenEditModal(name)}
                                        >
                                            <IconEdit size={14} />
                                        </ActionIcon>
                                        <ActionIcon
                                            size="sm" variant="subtle" color="red"
                                            onClick={() => onRemoveField(name)}
                                        >
                                            <IconTrash size={14} />
                                        </ActionIcon>
                                    </Group>
                                </Group>

                                <Collapse in={expandedFields.has(name)}>
                                    <Stack gap="xs" mt="xs" pl={28}>
                                        <Group gap="xs">
                                            <Badge size="xs" variant="outline">X:{pos.x}</Badge>
                                            <Badge size="xs" variant="outline">Y:{pos.y}</Badge>
                                            <Badge size="xs" variant="outline">W:{pos.width ?? 50}</Badge>
                                            <Badge size="xs" variant="outline">H:{pos.height ?? 15}</Badge>
                                            <Badge size="xs" variant="outline">
                                                {pos.fontSize ?? 12}px / {pos.align ?? 'left'}
                                            </Badge>
                                        </Group>
                                        {pos.dataSource && (
                                            <Text size="xs" c="dimmed">
                                                データソース: {dataSources.find((ds) => ds.type === pos.dataSource?.type)?.label ?? pos.dataSource.type}
                                                {pos.dataSource.field ? ` → ${pos.dataSource.field}` : ''}
                                            </Text>
                                        )}
                                    </Stack>
                                </Collapse>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Stack>

            {/* フィールド追加/編集モーダル */}
            <Modal
                opened={opened}
                onClose={close}
                title={editField ? `「${positions[editField]?.label ?? editField}」を編集` : 'フィールを追加'}
                size="lg"
            >
                <Stack gap="md">
                    {/* 新規作成時のみキー名入力 */}
                    {!editField && (
                        <TextInput
                            label="フィールドキー（英数字）"
                            placeholder="例: catName, ownerAddress"
                            value={newFieldKey}
                            onChange={(e) => setNewFieldKey(e.currentTarget.value)}
                            required
                        />
                    )}

                    <TextInput
                        label="表示ラベル"
                        placeholder="例: 猫名"
                        value={newFieldConfig.label}
                        onChange={(e) => setNewFieldConfig((prev) => ({ ...prev, label: e.currentTarget.value }))}
                    />

                    {/* データソース設定 */}
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>データソース</Text>
                        <Group grow>
                            <Select
                                label="ソースタイプ"
                                data={[{ value: '', label: '（なし / 自由入力）' }, ...dsTypeOptions]}
                                value={newFieldConfig.dataSource?.type ?? ''}
                                onChange={(val) => handleDataSourceChange(val || null)}
                                clearable
                            />
                            {selectedDs && (
                                <Select
                                    label="フィールド"
                                    data={dsFieldOptions}
                                    value={newFieldConfig.dataSource?.field ?? ''}
                                    onChange={(val) =>
                                        setNewFieldConfig((prev) => ({
                                            ...prev,
                                            dataSource: prev.dataSource
                                                ? { ...prev.dataSource, field: val ?? undefined }
                                                : undefined,
                                        }))
                                    }
                                    clearable
                                />
                            )}
                        </Group>
                    </Stack>

                    {/* 位置・サイズ */}
                    <Group grow>
                        <NumberInput
                            label="X (mm)" value={newFieldConfig.x} min={0} step={1}
                            onChange={(v) => setNewFieldConfig((prev) => ({ ...prev, x: Number(v) || 0 }))}
                        />
                        <NumberInput
                            label="Y (mm)" value={newFieldConfig.y} min={0} step={1}
                            onChange={(v) => setNewFieldConfig((prev) => ({ ...prev, y: Number(v) || 0 }))}
                        />
                        <NumberInput
                            label="幅 (mm)" value={newFieldConfig.width} min={5} step={1}
                            onChange={(v) => setNewFieldConfig((prev) => ({ ...prev, width: Number(v) || 50 }))}
                        />
                        <NumberInput
                            label="高さ (mm)" value={newFieldConfig.height} min={5} step={1}
                            onChange={(v) => setNewFieldConfig((prev) => ({ ...prev, height: Number(v) || 15 }))}
                        />
                    </Group>

                    {/* テキストスタイル */}
                    <Group grow>
                        <NumberInput
                            label="文字サイズ (px)" value={newFieldConfig.fontSize} min={6} max={72} step={1}
                            onChange={(v) => setNewFieldConfig((prev) => ({ ...prev, fontSize: Number(v) || 12 }))}
                        />
                        <Select
                            label="揃え"
                            data={[
                                { value: 'left', label: '左揃え' },
                                { value: 'center', label: '中央揃え' },
                                { value: 'right', label: '右揃え' },
                            ]}
                            value={newFieldConfig.align}
                            onChange={(v) => setNewFieldConfig((prev) => ({ ...prev, align: (v as FieldConfig['align']) ?? 'left' }))}
                        />
                    </Group>

                    <Group grow>
                        <Switch
                            label="太字"
                            checked={newFieldConfig.fontWeight === 'bold'}
                            onChange={(e) => setNewFieldConfig((prev) => ({
                                ...prev,
                                fontWeight: e.currentTarget.checked ? 'bold' : 'normal',
                            }))}
                        />
                        <TextInput
                            label="文字色"
                            placeholder="#333333"
                            value={newFieldConfig.color}
                            onChange={(e) => setNewFieldConfig((prev) => ({ ...prev, color: e.currentTarget.value }))}
                        />
                    </Group>

                    <Group justify="flex-end">
                        <Button variant="subtle" onClick={close}>キャンセル</Button>
                        <Button
                            onClick={editField ? handleSaveEdit : handleAddField}
                            disabled={!editField && !newFieldKey.trim()}
                        >
                            {editField ? '保存' : '追加'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
