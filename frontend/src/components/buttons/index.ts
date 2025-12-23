/**
 * 統一ボタンコンポーネント
 * 
 * 設計思想:
 * - PrimaryButton: セクションのメインアクション（1セクション = 1ボタン）
 * - IconActionButton: レコード操作用アイコンボタン
 * - 優先順位: コンポーネント単位 > ページ単位 > グローバル
 */

export { PrimaryButton, type PrimaryButtonProps, type MenuAction } from './PrimaryButton';
export { IconActionButton, type IconActionButtonProps, type IconActionVariant } from './IconActionButton';

