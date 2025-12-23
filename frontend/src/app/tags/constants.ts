/**
 * タグ管理ページで使用する定数
 */

// プリセットカラー
export const PRESET_COLORS = [
  '#e74c3c',
  '#e67e22',
  '#f39c12',
  '#f1c40f',
  '#2ecc71',
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#95a5a6',
];

// デフォルトカラー
export const DEFAULT_CATEGORY_COLOR = '#6366F1';
export const DEFAULT_CATEGORY_TEXT_COLOR = '#111827';
export const DEFAULT_GROUP_COLOR = '#3B82F6';
export const DEFAULT_GROUP_TEXT_COLOR = '#111827';
export const DEFAULT_TAG_COLOR = '#3B82F6';
export const DEFAULT_TAG_TEXT_COLOR = '#FFFFFF';

// カテゴリのスコープ選択肢（アプリ定義）
export const CATEGORY_SCOPE_OPTIONS = [
  { value: 'global', label: '全てのページ' },
  { value: 'cats', label: '猫一覧' },
  { value: 'cats-detail', label: '猫詳細' },
  { value: 'breeding', label: '交配管理' },
  { value: 'kittens', label: '子猫管理' },
  { value: 'care', label: 'ケアスケジュール' },
  { value: 'pedigrees', label: '血統書データ' },
  { value: 'medical-records', label: '医療データ' },
  { value: 'gallery', label: 'ギャラリー' },
  { value: 'tags', label: 'タグ管理' },
  { value: 'staff-shifts', label: 'スタッフシフト' },
  { value: 'settings', label: '設定' },
  { value: 'tenants', label: 'ユーザー設定' },
];

// ルールタイプオプション（シンプル化されたUI用）
export const RULE_TYPE_OPTIONS = [
  { value: 'PAGE_ACTION', label: 'イベント発生時' },
  { value: 'AGE_THRESHOLD', label: '年齢条件に達した時' },
  { value: 'TAG_ASSIGNED', label: '特定タグが付与された時' },
];

// アクションタイプオプション
export const ACTION_TYPE_OPTIONS = [
  { value: 'ASSIGN', label: 'タグを付与する' },
  { value: 'REMOVE', label: 'タグを削除する' },
];

// 年齢タイプオプション
export const AGE_TYPE_OPTIONS = [
  { value: 'days', label: '子猫（日数で指定）' },
  { value: 'months', label: '成猫（月数で指定）' },
];

// トリガータイプオプション（内部用・互換性維持）
export const TRIGGER_TYPE_OPTIONS = [
  { value: 'EVENT', label: 'イベント駆動' },
  { value: 'SCHEDULE', label: 'スケジュール' },
];

// イベントタイプオプション（内部用・互換性維持）
export const EVENT_TYPE_OPTIONS = [
  { value: 'BREEDING_PLANNED', label: '交配予定' },
  { value: 'BREEDING_CONFIRMED', label: '交配確認' },
  { value: 'PREGNANCY_CONFIRMED', label: '妊娠確認' },
  { value: 'KITTEN_REGISTERED', label: '子猫登録' },
  { value: 'AGE_THRESHOLD', label: '年齢閾値' },
  { value: 'PAGE_ACTION', label: 'ページ・アクション駆動' },
  { value: 'TAG_ASSIGNED', label: 'タグ付与時' },
  { value: 'CUSTOM', label: 'カスタム' },
];

// 自動化ルールで使用可能なスコープのデフォルトリスト（互換性維持）
export const AUTOMATION_SCOPE_OPTIONS = [
  { value: 'cats', label: '猫管理' },
  { value: 'breeding', label: '交配管理' },
  { value: 'health', label: '健康管理' },
  { value: 'care', label: 'ケア記録' },
  { value: 'pedigree', label: '血統管理' },
];

// PAGE_ACTIONで選択可能なページ（実際のナビゲーション構造に基づく）
export const PAGE_OPTIONS = [
  { value: 'cats', label: '猫一覧', href: '/cats' },
  { value: 'cats-new', label: '新規猫登録', href: '/cats/new' },
  { value: 'cats-detail', label: '猫詳細', href: '/cats/[id]' },
  { value: 'breeding', label: '交配管理', href: '/breeding' },
  { value: 'kittens', label: '子猫管理', href: '/kittens' },
  { value: 'care', label: 'ケアスケジュール', href: '/care' },
  { value: 'pedigrees', label: '血統書データ', href: '/pedigrees' },
  { value: 'medical-records', label: '医療データ', href: '/medical-records' },
  { value: 'gallery', label: 'ギャラリー', href: '/gallery' },
  { value: 'tags', label: 'タグ管理', href: '/tags' },
  { value: 'staff-shifts', label: 'スタッフシフト', href: '/staff/shifts' },
];

// ページごとに利用可能なアクション
export const PAGE_ACTIONS_MAP: Record<string, Array<{ value: string; label: string; description?: string }>> = {
  'cats': [
    { value: 'view', label: '一覧表示', description: '猫一覧ページが表示された時' },
    { value: 'filter', label: 'フィルタ適用', description: '検索・フィルタが適用された時' },
    { value: 'sort', label: 'ソート変更', description: '並び順が変更された時' },
  ],
  'cats-new': [
    { value: 'create', label: '新規登録', description: '新しい猫が登録された時' },
    { value: 'create_success', label: '登録成功', description: '猫の登録が成功した時' },
  ],
  'cats-detail': [
    { value: 'view', label: '詳細表示', description: '猫の詳細が表示された時' },
    { value: 'update', label: '情報更新', description: '猫の情報が更新された時' },
    { value: 'delete', label: '削除', description: '猫が削除された時' },
    { value: 'tag_added', label: 'タグ追加', description: '猫にタグが追加された時' },
    { value: 'tag_removed', label: 'タグ削除', description: '猫からタグが削除された時' },
  ],
  'breeding': [
    { value: 'create', label: '交配予定登録', description: '新しい交配予定が登録された時' },
    { value: 'update', label: '交配情報更新', description: '交配情報が更新された時' },
    { value: 'confirm', label: '交配確認', description: '交配が確認された時' },
    { value: 'pregnancy_confirmed', label: '妊娠確認', description: '妊娠が確認された時' },
    { value: 'cancel', label: 'キャンセル', description: '交配予定がキャンセルされた時' },
  ],
  'kittens': [
    { value: 'register', label: '子猫登録', description: '新しい子猫が登録された時' },
    { value: 'update', label: '子猫情報更新', description: '子猫の情報が更新された時' },
    { value: 'graduate', label: '卒業処理', description: '子猫が卒業した時' },
    { value: 'health_check', label: '健康チェック', description: '健康チェックが記録された時' },
  ],
  'care': [
    { value: 'create', label: 'ケア予定登録', description: '新しいケア予定が登録された時' },
    { value: 'complete', label: 'ケア完了', description: 'ケアが完了した時' },
    { value: 'update', label: 'ケア情報更新', description: 'ケア情報が更新された時' },
    { value: 'cancel', label: 'キャンセル', description: 'ケア予定がキャンセルされた時' },
  ],
  'pedigrees': [
    { value: 'create', label: '血統書作成', description: '新しい血統書が作成された時' },
    { value: 'update', label: '血統書更新', description: '血統書が更新された時' },
    { value: 'export', label: 'エクスポート', description: '血統書がエクスポートされた時' },
  ],
  'medical-records': [
    { value: 'create', label: '医療記録登録', description: '新しい医療記録が登録された時' },
    { value: 'update', label: '医療記録更新', description: '医療記録が更新された時' },
    { value: 'delete', label: '医療記録削除', description: '医療記録が削除された時' },
  ],
  'gallery': [
    { value: 'upload', label: '画像アップロード', description: '新しい画像がアップロードされた時' },
    { value: 'delete', label: '画像削除', description: '画像が削除された時' },
  ],
  'tags': [
    { value: 'create', label: 'タグ作成', description: '新しいタグが作成された時' },
    { value: 'update', label: 'タグ更新', description: 'タグが更新された時' },
    { value: 'delete', label: 'タグ削除', description: 'タグが削除された時' },
  ],
  'staff-shifts': [
    { value: 'create', label: 'シフト登録', description: '新しいシフトが登録された時' },
    { value: 'update', label: 'シフト更新', description: 'シフトが更新された時' },
    { value: 'delete', label: 'シフト削除', description: 'シフトが削除された時' },
  ],
};

// 対象猫の選択方法
export const TARGET_SELECTION_OPTIONS = [
  { value: 'event_target', label: 'イベント対象の猫' },
  { value: 'specific_cats', label: '特定の猫' },
  { value: 'all_cats', label: '全ての猫' },
];
