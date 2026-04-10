'use client';

import { Center, Loader, Stack, Text } from '@mantine/core';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = '読み込み中...' }: PageLoaderProps) {
  return (
    <Center h="60vh">
      <Stack align="center" gap="md">
        <Loader size="lg" type="dots" />
        <Text c="dimmed" size="sm">
          {message}
        </Text>
      </Stack>
    </Center>
  );
}
