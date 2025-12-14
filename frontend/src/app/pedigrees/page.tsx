'use client';

import { Container, Tabs } from '@mantine/core';
import { PedigreeRegistrationForm } from '@/components/pedigrees/PedigreeRegistrationForm';
import { PedigreeList } from '@/components/pedigrees/PedigreeList';
import { PedigreeFamilyTree } from '@/components/pedigrees/PedigreeFamilyTree';
import { PrintSettingsEditor } from '@/components/pedigrees/PrintSettingsEditor';
import { IconPlus, IconList, IconBinaryTree, IconSettings } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function PedigreesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'register';
  const treeIdParam = searchParams.get('id');
  const [selectedFamilyTreeId, setSelectedFamilyTreeId] = useState<string | null>(null);
  const { setPageTitle } = usePageHeader();

  useEffect(() => {
    setPageTitle('血統書管理');
    return () => setPageTitle(null);
  }, [setPageTitle]);

  const handleFamilyTreeSelect = (id: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'tree');
    nextParams.set('id', id);
    nextParams.delete('copyFromId');
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleTabChange = (nextTab: string | null) => {
    if (!nextTab) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', nextTab);

    if (nextTab !== 'tree') {
      nextParams.delete('id');
    }

    if (nextTab !== 'register') {
      nextParams.delete('copyFromId');
    }

    router.push(`${pathname}?${nextParams.toString()}`);
  };

  useEffect(() => {
    if (tabParam === 'tree' && treeIdParam) {
      setSelectedFamilyTreeId(treeIdParam);
    }
  }, [tabParam, treeIdParam]);

  return (
    <Container size="xl" py="md">
      <Tabs value={tabParam} onChange={handleTabChange} mt="md">
        <Tabs.List>
          <Tabs.Tab value="register" leftSection={<IconPlus size={14} />}>
            新規登録
          </Tabs.Tab>
          <Tabs.Tab value="list" leftSection={<IconList size={14} />}>
            データ管理
          </Tabs.Tab>
          <Tabs.Tab value="tree" leftSection={<IconBinaryTree size={14} />}>
            Family Tree
          </Tabs.Tab>
          <Tabs.Tab value="print-settings" leftSection={<IconSettings size={14} />}>
            印刷設定
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="register" pt="md">
          <PedigreeRegistrationForm onSuccess={() => handleTabChange('list')} />
        </Tabs.Panel>

        <Tabs.Panel value="list" pt="md">
          <PedigreeList onSelectFamilyTree={handleFamilyTreeSelect} />
        </Tabs.Panel>

        <Tabs.Panel value="tree" pt="md">
          <PedigreeFamilyTree pedigreeId={selectedFamilyTreeId} />
        </Tabs.Panel>

        <Tabs.Panel value="print-settings" pt="md">
          <PrintSettingsEditor />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
