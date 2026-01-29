'use client'

import { MantineProvider, type MantineColorsTuple, type MantineThemeOverride } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { useBootstrapAuth } from '@/lib/auth/useBootstrapAuth'
import { QueryClientProvider } from '@/lib/api/query-client'
import { Notifications } from '@mantine/notifications'
import { PageHeaderProvider } from '@/lib/contexts/page-header-context'
import '@mantine/notifications/styles.css'

export function Providers({ children }: { children: React.ReactNode }) {
  // 認証を先に初期化
  useBootstrapAuth()

  // Define brand palette explicitly to satisfy MantineColorsTuple type (10 shades, light -> dark)
  const brand: MantineColorsTuple = [
    '#eff6ff',
    '#dbeafe',
    '#bfdbfe',
    '#93c5fd',
    '#60a5fa',
    '#3b82f6',
    '#2563eb',
    '#1d4ed8',
    '#1e40af',
    '#1e3a8a',
  ]

  const theme: MantineThemeOverride = {
    primaryColor: 'brand',
    colors: { brand },
    fontFamily: 'Inter, "Noto Sans JP", "Segoe UI", sans-serif',
    headings: {
      fontFamily: 'Inter, "Noto Sans JP", "Segoe UI", sans-serif',
      fontWeight: '700',
    },
    defaultRadius: 'md',
    shadows: {
      xs: '0 1px 3px rgba(0,0,0,0.05)',
      sm: '0 4px 12px rgba(31, 38, 135, 0.05)',
      md: '0 8px 24px rgba(31, 38, 135, 0.08)',
      lg: '0 12px 32px rgba(31, 38, 135, 0.12)',
      xl: '0 16px 48px rgba(31, 38, 135, 0.15)',
    },
    spacing: {
      xs: '8px',
      sm: '12px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    components: {
      Button: {
        defaultProps: {
          radius: 'md',
          size: 'md',
        },
        styles: {
          root: {
            fontWeight: 600,
            transition: 'all 0.2s ease',
            height: '44px',
            padding: '0 16px',
          },
        },
      },
      ActionIcon: {
        defaultProps: {
          radius: 'md',
        },
        styles: {
          root: {
            transition: 'all 0.2s ease',
            color: 'var(--button-icon-color)',
          },
        },
      },
      Container: {
        defaultProps: {
          px: 0,
          fluid: true,
          size: 'var(--container-max-width)',
        },
        styles: {
          root: {
            maxWidth: 'var(--container-max-width)',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: 0,
            paddingRight: 0,
          },
        },
      },
      Badge: {
        defaultProps: {
          radius: 'md',
          variant: 'light',
        },
        styles: {
          root: {
            fontWeight: 600,
          },
        },
      },
      Alert: {
        styles: {
          root: {
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
          },
          title: {
            color: 'var(--text-primary)',
          },
          message: {
            color: 'var(--text-secondary)',
          },
        },
      },
      Notification: {
        styles: {
          root: {
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
          },
        },
      },
      Input: {
        styles: {
          input: {
            backgroundColor: 'var(--input-bg) !important',
            borderRadius: '8px !important',
            border: '1px solid var(--border-primary) !important',
            transition: 'all 0.2s ease',
          },
        },
      },
      Select: {
        styles: {
          input: {
            backgroundColor: 'var(--input-bg) !important',
            borderRadius: '8px !important',
            border: '1px solid var(--border-primary) !important',
          },
          dropdown: {
            backgroundColor: '#fff !important',
            borderRadius: '8px !important',
            border: '1px solid var(--border-primary) !important',
          },
        },
      },
      Slider: {
        defaultProps: {
          radius: 'md',
        },
        styles: {
          root: {
            paddingTop: '12px !important',
            paddingBottom: '12px !important',
          },
          track: {
            backgroundColor: 'var(--slider-track) !important',
            height: '6px !important',
            borderRadius: '3px !important',
          },
          bar: {
            backgroundColor: 'var(--accent) !important',
          },
          thumb: {
            width: '20px !important',
            height: '20px !important',
            border: '2px solid var(--accent) !important',
            backgroundColor: '#fff !important',
            borderRadius: '50% !important',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          },
        },
      },
      Switch: {
        defaultProps: {
          radius: 'xl',
        },
        styles: {
          track: {
            backgroundColor: 'var(--switch-bg) !important',
            border: '1px solid var(--border-subtle) !important',
            borderRadius: '32px !important',
            transition: 'all 0.2s ease !important',
            height: '24px !important',
            width: '44px !important',
            cursor: 'pointer',
          },
          thumb: {
            backgroundColor: 'var(--switch-thumb) !important',
            borderRadius: '50% !important',
            width: '18px !important',
            height: '18px !important',
          },
        },
      },
      Checkbox: {
        styles: {
          input: {
            backgroundColor: 'var(--input-bg) !important',
            borderRadius: '4px !important',
            border: '1px solid var(--border-primary) !important',
          },
          icon: {
            color: 'var(--accent) !important',
          },
        },
      },
      Paper: {
        defaultProps: {
          radius: 'md',
        },
      },
      Card: {
        defaultProps: {
          radius: 'md',
        },
      },
      Modal: {
        defaultProps: {
          radius: 'md',
          overlayProps: {
            backgroundOpacity: 0.55,
            blur: 3,
          },
        },
        styles: {
          root: {
            // Modal ルート
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
          },
          content: {
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            color: '#212529',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          },
          header: {
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e9ecef',
            color: '#212529',
          },
          body: {
            backgroundColor: '#ffffff',
            color: '#212529',
          },
        },
      },
      Tabs: {
        defaultProps: {
          variant: 'default',
        },
        styles: {
          root: {
            // 横スクロール対応
          },
          tab: {
            fontWeight: 500,
            transition: 'all 0.2s ease',
            border: 'none',
            backgroundColor: 'transparent',
            padding: '12px 16px',
            whiteSpace: 'nowrap', // テキストを折り返さない
            flexShrink: 0, // 縮小を防ぐ
            
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
            },
          },
          list: {
            borderBottom: 'none',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              height: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '2px',
            },
          },
        },
      }
    },
  }

  return (
    <QueryClientProvider>
      <MantineProvider defaultColorScheme="light" theme={theme}>
        <ModalsProvider>
          <PageHeaderProvider>
            <Notifications position="top-right" zIndex={1000} />
            {children}
          </PageHeaderProvider>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}
