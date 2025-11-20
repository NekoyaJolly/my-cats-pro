'use client';

import { Container, Tabs } from '@mantine/core';
import { PedigreeRegistrationForm } from '@/components/pedigrees/PedigreeRegistrationForm';
import { PedigreeList } from '@/components/pedigrees/PedigreeList';
import { PedigreeFamilyTree } from '@/components/pedigrees/PedigreeFamilyTree';
import { IconPlus, IconList, IconBinaryTree } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { usePageHeader } from '@/lib/contexts/page-header-context';

export default function PedigreesPage() {
  const [activeTab, setActiveTab] = useState<string | null>('register');
  const [selectedFamilyTreeId, setSelectedFamilyTreeId] = useState<string | null>(null);
  const { setPageTitle } = usePageHeader();

  useEffect(() => {
    setPageTitle('血統書管理');
    return () => setPageTitle(null);
  }, [setPageTitle]);

  const handleFamilyTreeSelect = (id: string) => {
    setSelectedFamilyTreeId(id);
    setActiveTab('tree');
  };

  return (
    <Container size="xl" py="md">
      <Tabs value={activeTab} onChange={setActiveTab} mt="md">
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
        </Tabs.List>

        <Tabs.Panel value="register" pt="md">
          <PedigreeRegistrationForm onSuccess={() => setActiveTab('list')} />
        </Tabs.Panel>

        <Tabs.Panel value="list" pt="md">
          <PedigreeList onSelectFamilyTree={handleFamilyTreeSelect} />
        </Tabs.Panel>

        <Tabs.Panel value="tree" pt="md">
          <PedigreeFamilyTree pedigreeId={selectedFamilyTreeId} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
