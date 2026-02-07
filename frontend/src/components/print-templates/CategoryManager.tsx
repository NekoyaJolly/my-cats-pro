'use client';

import { useState, useCallback } from 'react';
import {
    Stack, Group, Text, Button, TextInput, Textarea,
    Table, ActionIcon, Modal, Badge, NumberInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconEdit, IconTrash, IconCategory } from '@tabler/icons-react';

import type { PrintDocCategory } from './types';

interface CategoryManagerProps {
    categories: PrintDocCategory[];
    onSave: (category: Partial<PrintDocCategory> & { name: string; slug: string }) => Promise<void>;
    onUpdate: (id: string, data: Partial<PrintDocCategory>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function CategoryManager({ categories, onSave, onUpdate, onDelete }: CategoryManagerProps) {
    const [opened, { open, close }] = useDisclosure(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', slug: '', description: '', displayOrder: 0 });
    const [saving, setSaving] = useState(false);

    const handleOpenCreate = () => {
        setEditId(null);
        setForm({ name: '', slug: '', description: '', displayOrder: 0 });
        open();
    };

    const handleOpenEdit = (cat: PrintDocCategory) => {
        setEditId(cat.id);
        setForm({
            name: cat.name,
            slug: cat.slug,
            description: cat.description ?? '',
            displayOrder: cat.displayOrder,
        });
        open();
    };

    const handleSubmit = useCallback(async () => {
        if (!form.name.trim() || !form.slug.trim()) return;
        setSaving(true);
        try {
            if (editId) {
                await onUpdate(editId, {
                    name: form.name.trim(),
                    description: form.description.trim() || null,
                    displayOrder: form.displayOrder,
                });
            } else {
                await onSave({
                    name: form.name.trim(),
                    slug: form.slug.trim().toUpperCase().replace(/\s+/g, '_'),
                    description: form.description.trim() || null,
                    displayOrder: form.displayOrder,
                });
            }
            close();
        } finally {
            setSaving(false);
        }
    }, [form, editId, onSave, onUpdate, close]);

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm('このカテゴリを削除しますか？紐づくテンプレートのカテゴリ設定が解除されます。')) return;
        await onDelete(id);
    }, [onDelete]);

    return (
        <>
            <Stack gap="md">
                <Group justify="space-between">
                    <Group gap="xs">
                        <IconCategory size={20} />
                        <Text fw={600} size="md">カテゴリ管理</Text>
                    </Group>
                    <Button leftSection={<IconPlus size={16} />} size="compact-sm" onClick={handleOpenCreate}>
                        カテゴリ追加
                    </Button>
                </Group>

                <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>表示名</Table.Th>
                            <Table.Th>スラッグ</Table.Th>
                            <Table.Th>説明</Table.Th>
                            <Table.Th>フィールド数</Table.Th>
                            <Table.Th>操作</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {categories.map((cat) => (
                            <Table.Tr key={cat.id}>
                                <Table.Td>
                                    <Text size="sm" fw={500}>{cat.name}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Badge size="sm" variant="outline">{cat.slug}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="xs" c="dimmed" lineClamp={1}>{cat.description ?? '-'}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">{cat.defaultFields?.length ?? 0}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap={4}>
                                        <ActionIcon size="sm" variant="subtle" color="blue" onClick={() => handleOpenEdit(cat)}>
                                            <IconEdit size={14} />
                                        </ActionIcon>
                                        {/* テナント固有カテゴリのみ削除可能（共通は保護） */}
                                        {cat.tenantId && (
                                            <ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(cat.id)}>
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        )}
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                        {categories.length === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={5}>
                                    <Text ta="center" c="dimmed" py="lg">カテゴリがありません</Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Stack>

            <Modal
                opened={opened}
                onClose={close}
                title={editId ? 'カテゴリ編集' : 'カテゴリ追加'}
            >
                <Stack gap="md">
                    <TextInput
                        label="カテゴリ名"
                        placeholder="例: 健康診断書"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.currentTarget.value }))}
                        required
                    />
                    <TextInput
                        label="スラッグ（英大文字）"
                        placeholder="例: HEALTH_CERTIFICATE"
                        value={form.slug}
                        onChange={(e) => setForm((p) => ({ ...p, slug: e.currentTarget.value }))}
                        disabled={!!editId}
                        required
                    />
                    <Textarea
                        label="説明"
                        placeholder="任意の説明"
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.currentTarget.value }))}
                        autosize
                        minRows={2}
                    />
                    <NumberInput
                        label="表示順序"
                        value={form.displayOrder}
                        onChange={(v) => setForm((p) => ({ ...p, displayOrder: Number(v) || 0 }))}
                        min={0}
                    />
                    <Group justify="flex-end">
                        <Button variant="subtle" onClick={close}>キャンセル</Button>
                        <Button onClick={handleSubmit} loading={saving} disabled={!form.name.trim() || !form.slug.trim()}>
                            {editId ? '保存' : '作成'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
