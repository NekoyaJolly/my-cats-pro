'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Stack, Group, Text, Slider, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import type { PrintTemplate, FieldConfig } from './types';

// リサイズハンドルの方向
type ResizeDirection = 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw';

interface TemplatePreviewProps {
    template: PrintTemplate;
    onUpdatePosition?: (fieldName: string, x: number, y: number) => void;
    onUpdateSize?: (fieldName: string, width: number, height: number) => void;
    readOnly?: boolean;
}

export function TemplatePreview({
    template,
    onUpdatePosition,
    onUpdateSize,
    readOnly = false,
}: TemplatePreviewProps) {
    const paperRef = useRef<HTMLDivElement>(null);
    const [userScale, setUserScale] = useState(1);
    const displayScale = userScale;
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [resizing, setResizing] = useState<{ field: string; direction: ResizeDirection } | null>(null);

    // ドラッグ / リサイズ開始時の情報を ref に保持（クロージャ問題回避）
    const dragStartRef = useRef({ mouseX: 0, mouseY: 0, elemX: 0, elemY: 0 });
    const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0, x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);

    const isEditable = !readOnly && !!onUpdatePosition;

    /** mm → px 変換 (96dpi 基準) */
    const mmToPx = useCallback((mm: number) => (mm * 96) / 25.4 * displayScale, [displayScale]);
    /** px → mm 変換 */
    const pxToMm = useCallback((px: number) => (px * 25.4) / 96 / displayScale, [displayScale]);

    // ========================================
    // ドラッグ処理
    // ========================================
    const handleDragStart = (e: React.MouseEvent, fieldName: string) => {
        if (!isEditable || !onUpdatePosition) return;
        e.preventDefault();
        e.stopPropagation();
        const pos = template.positions[fieldName];
        if (!pos) return;

        dragStartRef.current = { mouseX: e.clientX, mouseY: e.clientY, elemX: pos.x, elemY: pos.y };
        setSelectedField(fieldName);
        setDragging(fieldName);
    };

    useEffect(() => {
        if (!dragging || !onUpdatePosition) return;

        const handleMove = (e: MouseEvent) => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                const { mouseX, mouseY, elemX, elemY } = dragStartRef.current;
                const dx = pxToMm(e.clientX - mouseX);
                const dy = pxToMm(e.clientY - mouseY);
                const newX = Math.max(0, Math.min(elemX + dx, template.paperWidth - 10));
                const newY = Math.max(0, Math.min(elemY + dy, template.paperHeight - 5));
                onUpdatePosition(dragging, Math.round(newX * 10) / 10, Math.round(newY * 10) / 10);
            });
        };

        const handleUp = () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            // 最終位置を整数mmに丸める
            const pos = template.positions[dragging];
            if (pos) {
                onUpdatePosition(dragging, Math.round(pos.x), Math.round(pos.y));
            }
            setDragging(null);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [dragging, displayScale, template.paperWidth, template.paperHeight, template.positions, onUpdatePosition, pxToMm]);

    // ========================================
    // リサイズ処理
    // ========================================
    const handleResizeStart = (e: React.MouseEvent, fieldName: string, direction: ResizeDirection) => {
        if (!isEditable || !onUpdateSize) return;
        e.preventDefault();
        e.stopPropagation();
        const pos = template.positions[fieldName];
        if (!pos) return;

        resizeStartRef.current = {
            mouseX: e.clientX, mouseY: e.clientY,
            w: pos.width ?? 50, h: pos.height ?? 15,
            x: pos.x, y: pos.y,
        };
        setSelectedField(fieldName);
        setResizing({ field: fieldName, direction });
    };

    useEffect(() => {
        if (!resizing || !onUpdateSize) return;

        const handleMove = (e: MouseEvent) => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                const { mouseX, mouseY, w, h, x, y } = resizeStartRef.current;
                const dxMm = pxToMm(e.clientX - mouseX);
                const dyMm = pxToMm(e.clientY - mouseY);
                const { direction, field } = resizing;

                let nw = w, nh = h, nx = x, ny = y;

                if (direction.includes('e')) nw = Math.max(10, w + dxMm);
                if (direction.includes('w')) { nw = Math.max(10, w - dxMm); nx = x + dxMm; }
                if (direction.includes('s')) nh = Math.max(5, h + dyMm);
                if (direction.includes('n')) { nh = Math.max(5, h - dyMm); ny = y + dyMm; }

                // 用紙範囲制限
                nx = Math.max(0, Math.min(nx, template.paperWidth - 10));
                ny = Math.max(0, Math.min(ny, template.paperHeight - 5));
                nw = Math.min(nw, template.paperWidth - nx);
                nh = Math.min(nh, template.paperHeight - ny);

                if ((direction.includes('w') || direction.includes('n')) && onUpdatePosition) {
                    onUpdatePosition(field, Math.round(nx * 10) / 10, Math.round(ny * 10) / 10);
                }
                onUpdateSize(field, Math.round(nw * 10) / 10, Math.round(nh * 10) / 10);
            });
        };

        const handleUp = () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            // 整数に丸める
            const pos = template.positions[resizing.field];
            if (pos) {
                if (onUpdatePosition) onUpdatePosition(resizing.field, Math.round(pos.x), Math.round(pos.y));
                onUpdateSize(resizing.field, Math.round(pos.width ?? 50), Math.round(pos.height ?? 15));
            }
            setResizing(null);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [resizing, displayScale, template.paperWidth, template.paperHeight, template.positions, onUpdateSize, onUpdatePosition, pxToMm]);

    // ========================================
    // キーボード操作（矢印キー移動）
    // ========================================
    useEffect(() => {
        if (!selectedField || !isEditable || !onUpdatePosition) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const pos = template.positions[selectedField];
            if (!pos) return;
            const step = e.shiftKey ? 10 : 1;
            let nx = pos.x, ny = pos.y;

            switch (e.key) {
                case 'ArrowLeft': nx = Math.max(0, pos.x - step); break;
                case 'ArrowRight': nx = Math.min(template.paperWidth - 10, pos.x + step); break;
                case 'ArrowUp': ny = Math.max(0, pos.y - step); break;
                case 'ArrowDown': ny = Math.min(template.paperHeight - 5, pos.y + step); break;
                case 'Delete':
                case 'Backspace':
                    // フィールド選択解除のみ （削除はFieldsPanelで行う）
                    setSelectedField(null);
                    return;
                default: return;
            }
            e.preventDefault();
            onUpdatePosition(selectedField, nx, ny);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedField, isEditable, template.positions, template.paperWidth, template.paperHeight, onUpdatePosition]);

    const sliderMarks = [
        { value: 0.3, label: '30%' },
        { value: 0.5, label: '50%' },
        { value: 1, label: '100%' },
        { value: 1.5, label: '150%' },
        { value: 2, label: '200%' },
    ];

    return (
        <Stack gap="md">
            {/* ヘッダ: 用紙情報 + ズーム */}
            <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                    <Text size="sm" c="dimmed">
                        用紙サイズ: {template.paperWidth}mm × {template.paperHeight}mm
                    </Text>
                    {isEditable && (
                        <Text size="xs" c="blue">
                            💡 フィールドをドラッグで移動、角・辺でリサイズ、矢印キーで微調整（Shift+矢印で10mm移動）
                        </Text>
                    )}
                </Stack>
                <Stack gap="xs" style={{ minWidth: 200 }}>
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">表示倍率</Text>
                        <Text size="sm" fw={500}>{Math.round(displayScale * 100)}%</Text>
                    </Group>
                    <Slider
                        value={userScale}
                        onChange={setUserScale}
                        min={0.2}
                        max={2}
                        step={0.05}
                        marks={sliderMarks}
                        label={(v) => `${Math.round(v * 100)}%`}
                        size="sm"
                        styles={{ markLabel: { fontSize: 10 } }}
                    />
                </Stack>
            </Group>

            {/* 用紙プレビュー */}
            <div
                style={{
                    padding: 20,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 8,
                    overflow: 'auto',
                    maxHeight: 600,
                    minHeight: 400,
                    cursor: dragging ? 'grabbing' : 'default',
                }}
            >
                <div style={{ display: 'inline-block', minWidth: '100%', textAlign: 'center' }}>
                    <div
                        ref={paperRef}
                        style={{
                            display: 'inline-block',
                            width: mmToPx(template.paperWidth),
                            height: mmToPx(template.paperHeight),
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            position: 'relative',
                            backgroundImage: template.backgroundUrl ? `url(${template.backgroundUrl})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            textAlign: 'left',
                        }}
                        onClick={() => setSelectedField(null)}
                    >
                        {/* 背景オーバーレイ */}
                        {template.backgroundUrl && template.backgroundOpacity < 100 && (
                            <div
                                style={{
                                    position: 'absolute', inset: 0,
                                    backgroundColor: `rgba(255,255,255,${(100 - template.backgroundOpacity) / 100})`,
                                    pointerEvents: 'none',
                                }}
                            />
                        )}

                        {/* グリッド（編集時のみ） */}
                        {isEditable && (
                            <svg
                                style={{
                                    position: 'absolute', top: 0, left: 0,
                                    width: '100%', height: '100%',
                                    pointerEvents: 'none', opacity: 0.2,
                                }}
                            >
                                {Array.from({ length: Math.floor(template.paperWidth / 10) + 1 }, (_, i) => (
                                    <line
                                        key={`v-${i}`}
                                        x1={mmToPx(i * 10)} y1={0}
                                        x2={mmToPx(i * 10)} y2={mmToPx(template.paperHeight)}
                                        stroke="#ccc"
                                        strokeWidth={i % 5 === 0 ? 1 : 0.5}
                                    />
                                ))}
                                {Array.from({ length: Math.floor(template.paperHeight / 10) + 1 }, (_, i) => (
                                    <line
                                        key={`h-${i}`}
                                        x1={0} y1={mmToPx(i * 10)}
                                        x2={mmToPx(template.paperWidth)} y2={mmToPx(i * 10)}
                                        stroke="#ccc"
                                        strokeWidth={i % 5 === 0 ? 1 : 0.5}
                                    />
                                ))}
                            </svg>
                        )}

                        {/* フィールド描画 */}
                        {Object.entries(template.positions).map(([fieldName, pos]) => (
                            <FieldBox
                                key={fieldName}
                                fieldName={fieldName}
                                pos={pos}
                                isSelected={selectedField === fieldName}
                                isDragging={dragging === fieldName}
                                isResizing={resizing?.field === fieldName}
                                isEditable={isEditable}
                                canResize={isEditable && !!onUpdateSize}
                                displayScale={displayScale}
                                mmToPx={mmToPx}
                                onMouseDown={handleDragStart}
                                onSelect={setSelectedField}
                                onResizeStart={handleResizeStart}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {isEditable && (
                <Alert color="blue" icon={<IconAlertCircle size={16} />}>
                    フィールドをドラッグして位置を調整、選択後に四隅・辺のハンドルでサイズを調整できます。
                </Alert>
            )}
        </Stack>
    );
}

// ========================================
// フィールドボックス（単体）
// ========================================
interface FieldBoxProps {
    fieldName: string;
    pos: FieldConfig;
    isSelected: boolean;
    isDragging: boolean;
    isResizing: boolean;
    isEditable: boolean;
    canResize: boolean;
    displayScale: number;
    mmToPx: (mm: number) => number;
    onMouseDown: (e: React.MouseEvent, fieldName: string) => void;
    onSelect: (fieldName: string | null) => void;
    onResizeStart: (e: React.MouseEvent, fieldName: string, direction: ResizeDirection) => void;
}

function FieldBox({
    fieldName, pos, isSelected, isDragging, isResizing,
    isEditable, canResize, displayScale, mmToPx,
    onMouseDown, onSelect, onResizeStart,
}: FieldBoxProps) {
    const fw = pos.width ?? 50;
    const fh = pos.height ?? 15;

    return (
        <div
            onMouseDown={(e) => onMouseDown(e, fieldName)}
            onClick={(e) => { e.stopPropagation(); onSelect(fieldName); }}
            style={{
                position: 'absolute',
                left: mmToPx(pos.x),
                top: mmToPx(pos.y),
                width: mmToPx(fw),
                height: mmToPx(fh),
                fontSize: (pos.fontSize ?? 12) * displayScale,
                textAlign: pos.align ?? 'left',
                color: pos.color ?? '#333',
                fontWeight: pos.fontWeight ?? 'normal',
                whiteSpace: 'normal',
                overflow: 'hidden',
                border: isSelected ? '2px solid #228be6' : '1px dashed #aaa',
                padding: '2px 4px',
                backgroundColor: isSelected ? 'rgba(34,139,230,0.12)' : 'rgba(255,255,200,0.7)',
                cursor: isEditable ? (isDragging || isResizing ? 'grabbing' : 'grab') : 'default',
                userSelect: 'none',
                boxShadow: isSelected ? '0 0 0 2px rgba(34,139,230,0.25)' : undefined,
                zIndex: isSelected || isDragging || isResizing ? 100 : 1,
                transition: isDragging || isResizing ? 'none' : 'box-shadow 0.15s',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                lineHeight: 1.3,
            }}
        >
            <span style={{ flex: 1, overflowWrap: 'break-word' }}>{pos.label ?? fieldName}</span>

            {/* 座標・サイズ情報ラベル */}
            {isEditable && isSelected && (
                <div
                    style={{
                        position: 'absolute', top: -20, left: 0,
                        fontSize: 10, backgroundColor: '#228be6', color: 'white',
                        padding: '1px 4px', borderRadius: 2, whiteSpace: 'nowrap',
                    }}
                >
                    X:{pos.x} Y:{pos.y} W:{fw} H:{fh}
                </div>
            )}

            {/* リサイズハンドル */}
            {canResize && isSelected && (
                <>
                    {/* 四隅のハンドル */}
                    {(['nw', 'ne', 'sw', 'se'] as ResizeDirection[]).map((dir) => (
                        <div
                            key={dir}
                            onMouseDown={(e) => onResizeStart(e, fieldName, dir)}
                            style={{
                                position: 'absolute', width: 10, height: 10,
                                backgroundColor: '#228be6', border: '1px solid white',
                                borderRadius: 2, cursor: `${dir}-resize`, zIndex: 101,
                                ...(dir === 'nw' && { top: -5, left: -5 }),
                                ...(dir === 'ne' && { top: -5, right: -5 }),
                                ...(dir === 'sw' && { bottom: -5, left: -5 }),
                                ...(dir === 'se' && { bottom: -5, right: -5 }),
                            }}
                        />
                    ))}
                    {/* 辺のハンドル */}
                    {(['n', 's', 'e', 'w'] as ResizeDirection[]).map((dir) => (
                        <div
                            key={dir}
                            onMouseDown={(e) => onResizeStart(e, fieldName, dir)}
                            style={{
                                position: 'absolute', backgroundColor: '#228be6',
                                border: '1px solid white', borderRadius: 1, zIndex: 101,
                                ...(dir === 'n' && {
                                    top: -4, left: '50%', transform: 'translateX(-50%)',
                                    width: 20, height: 8, cursor: 'n-resize',
                                }),
                                ...(dir === 's' && {
                                    bottom: -4, left: '50%', transform: 'translateX(-50%)',
                                    width: 20, height: 8, cursor: 's-resize',
                                }),
                                ...(dir === 'e' && {
                                    right: -4, top: '50%', transform: 'translateY(-50%)',
                                    width: 8, height: 20, cursor: 'e-resize',
                                }),
                                ...(dir === 'w' && {
                                    left: -4, top: '50%', transform: 'translateY(-50%)',
                                    width: 8, height: 20, cursor: 'w-resize',
                                }),
                            }}
                        />
                    ))}
                </>
            )}
        </div>
    );
}
