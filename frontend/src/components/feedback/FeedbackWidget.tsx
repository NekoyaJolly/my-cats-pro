'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionIcon, Button, Group, Modal, Stack, Text, Textarea, Tooltip } from '@mantine/core';
import { IconMail } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { submitFeedback } from '@/lib/api/feedback';

const POSITION_KEY = 'feedback-widget-position';
const MAX_LENGTH = 200;
const DRAG_THRESHOLD = 5; // この距離を超えて動いたらドラッグと判定（クリックと区別）
const BUTTON_SIZE = 52;

interface Position {
  x: number;
  y: number;
}

/** ボタンが画面外に出ないように位置を制限する */
function clampToViewport(pos: Position): Position {
  if (typeof window === 'undefined') return pos;
  const maxX = Math.max(0, window.innerWidth - BUTTON_SIZE);
  const maxY = Math.max(0, window.innerHeight - BUTTON_SIZE);
  return {
    x: Math.min(Math.max(0, pos.x), maxX),
    y: Math.min(Math.max(0, pos.y), maxY),
  };
}

/**
 * 常駐のフィードバック手紙アイコン。
 * - ドラッグで位置を移動でき、位置は localStorage に保存される
 * - クリック（ドラッグでない）でフィードバックモーダルを開く
 * - 送信で /feedback（管理者宛メール）に届く
 */
export function FeedbackWidget() {
  const [position, setPosition] = useState<Position | null>(null);
  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const positionRef = useRef<Position | null>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const movedRef = useRef(false);

  // 初期位置（localStorage か既定値=右下）を復元
  useEffect(() => {
    let initial: Position | null = null;
    try {
      const stored = localStorage.getItem(POSITION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Position>;
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          initial = { x: parsed.x, y: parsed.y };
        }
      }
    } catch {
      // ignore
    }
    if (!initial) {
      initial = {
        x: window.innerWidth - BUTTON_SIZE - 20,
        y: window.innerHeight - BUTTON_SIZE - 150,
      };
    }
    const clamped = clampToViewport(initial);
    positionRef.current = clamped;
    setPosition(clamped);
  }, []);

  // リサイズ時に画面内へ収める
  useEffect(() => {
    const onResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const clamped = clampToViewport(prev);
        positionRef.current = clamped;
        return clamped;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const pos = positionRef.current;
    if (!pos) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = { pointerX: e.clientX, pointerY: e.clientY, x: pos.x, y: pos.y };
    movedRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    const dx = e.clientX - start.pointerX;
    const dy = e.clientY - start.pointerY;
    if (!movedRef.current && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      movedRef.current = true;
    }
    if (movedRef.current) {
      const next = clampToViewport({ x: start.x + dx, y: start.y + dy });
      positionRef.current = next;
      setPosition(next);
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (movedRef.current) {
      // ドラッグ終了 → 位置を保存
      try {
        if (positionRef.current) {
          localStorage.setItem(POSITION_KEY, JSON.stringify(positionRef.current));
        }
      } catch {
        // ignore
      }
    } else {
      // クリック → モーダルを開く
      setOpened(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (sending) return;
    setOpened(false);
  }, [sending]);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const { sent } = await submitFeedback(trimmed);
      notifications.show({
        title: sent ? 'フィードバックを送信しました' : 'フィードバックを受け付けました',
        message: sent
          ? 'ご意見ありがとうございます！'
          : 'ありがとうございます。送信は受け付けましたが、配信設定により届かない場合があります。',
        color: sent ? 'teal' : 'yellow',
      });
      setMessage('');
      setOpened(false);
    } catch {
      notifications.show({
        title: 'エラー',
        message: 'フィードバックの送信に失敗しました。時間をおいて再度お試しください。',
        color: 'red',
      });
    } finally {
      setSending(false);
    }
  }, [message]);

  if (!position) return null;

  return (
    <>
      <Tooltip label="フィードバックを送る" withArrow position="left">
        <ActionIcon
          variant="filled"
          color="blue"
          radius="xl"
          size={BUTTON_SIZE}
          aria-label="フィードバックを送る"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          data-testid="feedback-widget-button"
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 150,
            touchAction: 'none',
            cursor: 'grab',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.2)',
          }}
        >
          <IconMail size={24} />
        </ActionIcon>
      </Tooltip>

      <Modal opened={opened} onClose={handleClose} title="フィードバック" centered data-testid="feedback-modal">
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            ご意見・ご要望をお聞かせください（最大{MAX_LENGTH}文字）。
          </Text>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value.slice(0, MAX_LENGTH))}
            maxLength={MAX_LENGTH}
            minRows={4}
            autosize
            placeholder="気づいたこと・改善してほしいことなど"
            data-autofocus
            data-testid="feedback-textarea"
          />
          <Text size="xs" c="dimmed" ta="right">
            {message.length} / {MAX_LENGTH}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={handleClose} disabled={sending}>
              キャンセル
            </Button>
            <Button
              onClick={handleSend}
              loading={sending}
              disabled={!message.trim()}
              data-testid="feedback-send"
            >
              送信
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
