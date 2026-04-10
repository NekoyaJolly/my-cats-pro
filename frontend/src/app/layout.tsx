import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import { Suspense } from "react";
import { Providers } from "./providers";
import { AppLayout } from "@/components/AppLayout";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
  preload: false,
});

export const metadata: Metadata = {
  title: 'MyCats Pro',
  description: 'MyCats: 猫の個体・血統・ケア情報を一元管理するアプリケーション',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'MyCats Pro',
    description: '猫の個体・血統・ケア情報を一元管理するアプリケーション',
    url: 'https://example.com',
    siteName: 'MyCats Pro',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: 'MyCats Pro',
    description: '猫の個体・血統・ケア情報を一元管理するアプリケーション',
  },
  // PWA: Apple Web App 設定
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyCats Pro',
  },
  // PWA: アプリケーション名
  applicationName: 'MyCats Pro',
  // PWA: フォーマット検出の無効化（電話番号の自動リンク防止）
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  // PWA: ビューポート設定
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} ${notoSansJP.variable} font-sans antialiased`}>
        <Providers>
          <Suspense fallback={null}>
            <AppLayout>{children}</AppLayout>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
