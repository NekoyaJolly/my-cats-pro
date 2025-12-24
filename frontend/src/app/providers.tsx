'use client'

import { MantineProvider, type MantineColorsTuple, type MantineThemeOverride } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { useBootstrapAuth } from '@/lib/auth/useBootstrapAuth'
import { QueryClientProvider } from '@/lib/api/query-client'
import { Notifications } from '@mantine/notifications'
import { PageHeaderProvider } from '@/lib/contexts/page-header-context'
import { useTheme } from '@/lib/store/theme-store'
import '@mantine/notifications/styles.css'

export function Providers({ children }: { children: React.ReactNode }) {
  // 認証を先に初期化（テーマ設定が認証状態に依存する可能性があるため）
  useBootstrapAuth()
  // その後テーマを取得
  const { theme: currentTheme } = useTheme()

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

  // テーマを明示的に定義（将来的な拡張に対応）
  const isMonolith = currentTheme === 'monolith'
  const isOrganic = currentTheme === 'organic'
  const isEthereal = currentTheme === 'ethereal'

  const theme: MantineThemeOverride = {
    primaryColor: 'brand',
    colors: { brand },
    fontFamily: 'Inter, "Noto Sans JP", "Segoe UI", sans-serif',
    headings: {
      fontFamily: 'Inter, "Noto Sans JP", "Segoe UI", sans-serif',
      fontWeight: isMonolith ? '800' : isOrganic ? '600' : isEthereal ? '700' : '700',
    },
    defaultRadius: isMonolith ? '0' : isOrganic ? '32px' : isEthereal ? 'xl' : 'xl',
    shadows: {
      xs: '0 1px 3px rgba(0,0,0,0.05)',
      sm: '0 4px 12px rgba(31, 38, 135, 0.05)',
      md: '0 8px 24px rgba(31, 38, 135, 0.08)',
      lg: '0 12px 32px rgba(31, 38, 135, 0.12)',
      xl: '0 16px 48px rgba(31, 38, 135, 0.15)',
    },
    spacing: isMonolith ? {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
    } : {
      xs: '8px',
      sm: '12px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    components: {
      Button: {
        defaultProps: {
          radius: isMonolith ? '0' : isOrganic ? '32px' : 'xl',
        },
        styles: {
          root: {
            fontWeight: 700,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            textTransform: isMonolith ? 'uppercase' : 'none',
            letterSpacing: isMonolith ? '0.05em' : 'normal',
            // テーマ統一: CSS変数を使用
            '--button-radius': 'var(--button-primary-radius, var(--radius-base))',
          },
        },
      },
      ActionIcon: {
        defaultProps: {
          radius: isMonolith ? '0' : isOrganic ? '32px' : 'xl',
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
          radius: isMonolith ? '0' : 'xl',
          variant: isMonolith ? 'outline' : isOrganic ? 'filled' : 'light',
        },
        styles: {
          root: {
            fontWeight: 800,
            textTransform: isMonolith ? 'uppercase' : 'none',
            borderWidth: isMonolith ? 'var(--border-width, 1px)' : '1px',
          },
        },
      },
      Alert: {
        styles: {
          root: {
            backgroundColor: 'var(--glass-bg, var(--bg-surface))',
            border: isMonolith ? 'var(--border-width, 1px) solid var(--border-primary)' : '1px solid var(--glass-border, transparent)',
            borderRadius: 'var(--radius-base, 16px)',
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
            backgroundColor: 'var(--glass-bg, var(--bg-surface))',
            backdropFilter: 'blur(var(--glass-blur, 0px))',
            WebkitBackdropFilter: 'blur(var(--glass-blur, 0px))',
            border: isMonolith ? 'var(--border-width, 1px) solid var(--border-primary)' : '1px solid var(--glass-border, transparent)',
            borderRadius: 'var(--radius-base, 16px)',
            color: 'var(--text-primary)',
          },
        },
      },
      Input: {
        styles: {
          input: {
            backgroundColor: 'var(--input-bg) !important',
            borderRadius: isMonolith ? '0 !important' : isOrganic ? '16px !important' : '12px !important',
            border: isMonolith ? 'var(--border-width, 1px) solid var(--border-primary) !important' : '1px solid var(--glass-border) !important',
            transition: 'all 0.2s ease',
          },
        },
      },
      Select: {
        styles: {
          input: {
            backgroundColor: 'var(--input-bg) !important',
            borderRadius: isMonolith ? '0 !important' : isOrganic ? '16px !important' : '12px !important',
            border: isMonolith ? 'var(--border-width, 1px) solid var(--border-primary) !important' : '1px solid var(--glass-border) !important',
          },
          dropdown: {
            backgroundColor: 'var(--glass-bg, #fff) !important',
            backdropFilter: 'blur(var(--glass-blur, 0px)) !important',
            WebkitBackdropFilter: 'blur(var(--glass-blur, 0px)) !important',
            borderRadius: isMonolith ? '0 !important' : '12px !important',
            border: isMonolith ? 'var(--border-width, 1px) solid var(--border-primary) !important' : '1px solid var(--glass-border, transparent) !important',
          },
        },
      },
      Slider: {
        defaultProps: {
          radius: isMonolith ? '0' : 'xl',
        },
        styles: {
          root: {
            paddingTop: '12px !important',
            paddingBottom: '12px !important',
          },
          track: {
            backgroundColor: 'var(--slider-track) !important',
            height: isMonolith ? '8px !important' : '6px !important',
            borderRadius: isMonolith ? '0 !important' : '3px !important',
          },
          bar: {
            backgroundColor: 'var(--accent) !important',
          },
          thumb: {
            width: isMonolith ? '16px !important' : '20px !important',
            height: isMonolith ? '16px !important' : '20px !important',
            border: isMonolith ? 'var(--border-width, 1px) solid var(--border-primary) !important' : '2px solid var(--accent) !important',
            backgroundColor: '#fff !important',
            borderRadius: isMonolith ? '0 !important' : '50% !important',
            boxShadow: 'var(--shadow-ethereal) !important',
          },
        },
      },
      Switch: {
        defaultProps: {
          radius: isMonolith ? '0' : 'xl',
        },
        styles: {
          track: {
            backgroundColor: 'var(--switch-bg) !important',
            border: isMonolith ? 'var(--border-width, 1px) solid var(--border-primary) !important' : '1px solid var(--glass-border) !important',
            borderRadius: isMonolith ? '0 !important' : '32px !important',
            transition: 'all 0.2s ease !important',
            height: '24px !important',
            width: '44px !important',
            cursor: 'pointer',
          },
          thumb: {
            backgroundColor: 'var(--switch-thumb) !important',
            borderRadius: isMonolith ? '0 !important' : '50% !important',
            border: isMonolith ? 'var(--border-width, 1px) solid var(--border-primary) !important' : 'none !important',
            width: isMonolith ? '14px !important' : '18px !important',
            height: isMonolith ? '14px !important' : '18px !important',
          },
        },
      },
      Checkbox: {
        styles: {
          input: {
            backgroundColor: 'var(--input-bg) !important',
            borderRadius: isMonolith ? '0 !important' : '4px !important',
            border: isMonolith ? 'var(--border-width, 1px) solid var(--border-primary) !important' : '1px solid var(--glass-border) !important',
          },
          icon: {
            color: 'var(--accent) !important',
          },
        },
      },
      Paper: {
        defaultProps: {
          radius: isMonolith ? '0' : isOrganic ? '32px' : 'lg',
        },
      },
      Card: {
        defaultProps: {
          radius: isMonolith ? '0' : isOrganic ? '32px' : 'lg',
        },
      },
      Modal: {
        styles: {
          content: {
            backgroundColor: isMonolith ? 'var(--bg-surface) !important' : 'var(--glass-bg, rgba(255, 255, 255, 0.7)) !important',
            backdropFilter: isMonolith ? 'none !important' : 'blur(var(--glass-blur, 24px)) !important',
            WebkitBackdropFilter: isMonolith ? 'none !important' : 'blur(var(--glass-blur, 24px)) !important',
            borderRadius: 'var(--radius-base, 24px) !important',
            border: isMonolith ? 'var(--border-width, 1px) solid var(--border-primary) !important' : '1px solid var(--glass-border, rgba(255, 255, 255, 0.4)) !important',
            color: 'var(--text-primary) !important',
          },
          header: {
            backgroundColor: 'transparent !important',
            color: 'var(--text-primary) !important',
          },
          body: {
            color: 'var(--text-primary) !important',
          },
        },
      },
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
