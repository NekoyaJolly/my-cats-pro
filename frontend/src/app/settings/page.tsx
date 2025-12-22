import { redirect } from 'next/navigation';

/**
 * 設定ページ - tenantsページのユーザー設定タブへリダイレクト
 * 
 * ボトムナビゲーション設定はユーザー設定タブに統合されました。
 */
export default function SettingsPage() {
  redirect('/tenants');
}
