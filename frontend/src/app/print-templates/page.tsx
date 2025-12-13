'use client';

import { Container } from '@mantine/core';
import { useEffect } from 'react';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { PrintTemplateManager } from '@/components/print-templates/PrintTemplateManager';

export default function PrintTemplatesPage() {
  const { setPageTitle } = usePageHeader();

  useEffect(() => {
    setPageTitle('印刷テンプレート管理');
    return () => setPageTitle(null);
  }, [setPageTitle]);

  return (
    <Container size="xl" py="md">
      <PrintTemplateManager />
    </Container>
  );
}
