'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PageHeaderContextType {
  pageTitle: string | null;
  pageActions: ReactNode | null;
  setPageHeader: (title: string | null, actions?: ReactNode) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const [pageActions, setPageActions] = useState<ReactNode | null>(null);

  const setPageHeader = (title: string | null, actions?: ReactNode) => {
    setPageTitle(title);
    setPageActions(actions || null);
  };

  return (
    <PageHeaderContext.Provider value={{ pageTitle, pageActions, setPageHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (context === undefined) {
    throw new Error('usePageHeader must be used within a PageHeaderProvider');
  }
  return context;
}
