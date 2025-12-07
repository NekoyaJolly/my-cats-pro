import { redirect } from 'next/navigation';

/**
 * 旧血統書登録ページ - リダイレクト用
 * 
 * このページは `/pedigrees/new` へのアクセスを `/pedigrees?tab=register` にリダイレクトします。
 * 新しい統合UIでは、タブ切り替えで登録・編集・更新が可能です。
 */
export default function NewPedigreeRedirect() {
  redirect('/pedigrees?tab=register');
}
