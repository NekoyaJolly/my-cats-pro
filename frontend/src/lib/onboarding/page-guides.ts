import {
  IconLayoutGrid,
  IconPaw,
  IconHeart,
  IconCalendarEvent,
  IconAdjustments,
  IconPlus,
  IconSearch,
  IconArrowsSort,
  IconColumns,
  IconEdit,
  IconBabyCarriage,
  IconClipboardCheck,
  IconScale,
  IconBan,
  IconLayoutList,
  IconList,
  IconChevronDown,
  IconCalendar,
  IconCalendarPlus,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconFilter,
  IconStethoscope,
  IconFolder,
  IconStack,
  IconTag,
  IconRobot,
  IconBinaryTree,
  IconPrinter,
  IconCopy,
  IconUser,
  IconUserPlus,
  IconClipboard,
  IconLock,
  IconShield,
  IconTrash,
  IconBuildingSkyscraper,
  IconCategory,
  IconUpload,
  IconPhoto,
  IconFileExport,
  IconFileImport,
  IconDownload,
  IconAlertCircle,
} from '@tabler/icons-react';

/** Tabler アイコンコンポーネントの型（バージョン非依存に typeof で取得） */
type GuideIcon = typeof IconPaw;

export interface GuideFeature {
  icon: GuideIcon;
  /** 体言止めの短い見出し */
  title: string;
  /** 何ができるかの1文説明 */
  description: string;
}

export interface PageGuide {
  /** 表示済み管理に使う安定キー */
  pageKey: string;
  /** このガイドを表示するルートか判定する（pathname はクエリを含まない） */
  match: (pathname: string) => boolean;
  /** ドロワーの見出し */
  title: string;
  /** 導入文（任意） */
  intro?: string;
  /** このページでできることの一覧 */
  features: GuideFeature[];
}

const guides: PageGuide[] = [
  {
    pageKey: 'home',
    match: (pathname) => pathname === '/',
    title: 'ホームでできること',
    intro: 'よく使う情報の確認と、各機能への入口がまとまっています。',
    features: [
      {
        icon: IconLayoutGrid,
        title: '頭数サマリー',
        description: 'オス・メス・子猫・卒業予定の頭数をひと目で確認できます。',
      },
      {
        icon: IconPaw,
        title: '新規猫登録',
        description: '「新規猫登録」から猫を追加し、詳細情報を入力できます。',
      },
      {
        icon: IconHeart,
        title: '交配の予定',
        description: '本日の交配予定や全体のスケジュール数を確認できます。',
      },
      {
        icon: IconCalendarEvent,
        title: 'ケアの未完了',
        description: '対応が必要なケアスケジュールの件数を確認できます。',
      },
      {
        icon: IconAdjustments,
        title: 'カードの設定',
        description: '右上の設定から、表示するカードや並び順をカスタマイズできます。',
      },
    ],
  },
  {
    pageKey: 'cats',
    match: (pathname) => pathname === '/cats',
    title: '在舎猫の一覧でできること',
    intro: '登録した猫の検索・編集・分類をまとめて行えます。',
    features: [
      {
        icon: IconPlus,
        title: '新規登録',
        description: '右上の作成ボタンから新しい猫を登録できます。',
      },
      {
        icon: IconLayoutList,
        title: 'タブで分類',
        description: 'オス・メス・子猫・育成中・卒業などのタブで絞り込んで表示できます。',
      },
      {
        icon: IconSearch,
        title: '検索・絞り込み',
        description: '名前・毛色・品種で検索し、条件を組み合わせて絞り込めます。',
      },
      {
        icon: IconArrowsSort,
        title: '並び替え',
        description: '名前順・年齢順・品種順・性別順など複数のパターンで並び替えできます。',
      },
      {
        icon: IconColumns,
        title: '列幅の調整',
        description: '一覧の列幅をドラッグで調整でき、設定は自動で保存されます。',
      },
      {
        icon: IconEdit,
        title: '編集・削除・複製',
        description: '各行から編集・削除・詳細表示・複製を行えます。',
      },
      {
        icon: IconBabyCarriage,
        title: '子猫の展開',
        description: '母猫の行から子猫を展開して、親子関係を確認できます。',
      },
    ],
  },
  {
    pageKey: 'breeding',
    match: (pathname) => pathname === '/breeding',
    title: '交配管理でできること',
    intro: '交配から妊娠・出産・育成までを、フェーズごとに管理できます。',
    features: [
      {
        icon: IconCalendarEvent,
        title: '交配スケジュール',
        description: 'カレンダーでオス・メスのペアと期間を設定し、実績を記録できます。',
      },
      {
        icon: IconClipboardCheck,
        title: '妊娠確認',
        description: '交配後の妊娠の有無を確認し、出産予定へ進められます。',
      },
      {
        icon: IconBabyCarriage,
        title: '出産登録',
        description: '出産日・頭数・死亡数を記録し、生存した子猫を自動登録できます。',
      },
      {
        icon: IconScale,
        title: '育成・発送管理',
        description: '子猫の体重記録・タグ管理・発送先（里親・販売）を管理できます。',
      },
      {
        icon: IconBan,
        title: 'NG交配ルール',
        description: '禁止する組み合わせを設定し、該当ペアの選択時に警告を表示します。',
      },
      {
        icon: IconLayoutList,
        title: 'フェーズ別タブ',
        description: '交配・妊娠・出産・育成・体重・出荷の各フェーズをタブで切り替えられます。',
      },
    ],
  },
  {
    pageKey: 'kittens',
    match: (pathname) => pathname === '/kittens',
    title: '子猫管理でできること',
    intro: '出産した母猫ごとに、子猫の成長を記録・管理できます。',
    features: [
      {
        icon: IconBabyCarriage,
        title: '母猫グループ表示',
        description: '出産した母猫ごとに子猫をまとめ、父猫や出産日を確認できます。',
      },
      {
        icon: IconScale,
        title: '体重記録',
        description: '子猫ごと、またはグループ一括で体重を日時付きで記録できます。',
      },
      {
        icon: IconList,
        title: '子猫情報の管理',
        description: '名前・性別・毛色・生年月日の登録/編集や、処分タイプ（訓練/販売/死亡）を管理できます。',
      },
      {
        icon: IconCalendar,
        title: '日齢の確認',
        description: '生後日数を日・週・月で自動計算して確認できます。',
      },
      {
        icon: IconChevronDown,
        title: 'グループの展開',
        description: 'グループを展開/折りたたみして、子猫リストの表示を切り替えられます。',
      },
    ],
  },
  {
    pageKey: 'care',
    match: (pathname) => pathname === '/care',
    title: 'ケアスケジュールでできること',
    intro: '猫ごとの定期的なケア予定を登録し、実施状況を管理できます。',
    features: [
      {
        icon: IconCalendarPlus,
        title: 'ケア予定の登録',
        description: 'ケア名・対象猫・繰り返し（毎日/毎週/毎月/生後○日目など）を指定して登録できます。',
      },
      {
        icon: IconCheck,
        title: '完了の記録',
        description: '実施したケアを完了にし、完了日・次回予定日・メモを残せます。',
      },
      {
        icon: IconEdit,
        title: '編集・削除',
        description: '登録済みのケア予定を後から更新・削除できます。',
      },
      {
        icon: IconLayoutGrid,
        title: '統計カード',
        description: 'ケア名ごとの対象頭数を統計カードでひと目で確認できます。',
      },
      {
        icon: IconEye,
        title: '詳細の確認',
        description: '対象猫・予定日・繰り返し設定・登録者などの詳細を確認できます。',
      },
    ],
  },
  {
    pageKey: 'medical-records',
    match: (pathname) => pathname === '/medical-records',
    title: '医療データでできること',
    intro: '猫ごとの通院・診断・治療の記録をまとめて管理できます。',
    features: [
      {
        icon: IconCalendarPlus,
        title: '医療記録の登録',
        description: '受診日・病院・症状・診断・治療計画・次回予定を登録できます。',
      },
      {
        icon: IconFilter,
        title: '猫で絞り込み',
        description: '猫を選んで、その猫の医療記録だけを表示できます。',
      },
      {
        icon: IconStethoscope,
        title: '治療ステータス管理',
        description: '治療の進行状況をステータスで管理できます。',
      },
      {
        icon: IconEye,
        title: '詳細の閲覧',
        description: '基本情報・症状・診断/治療を詳細表示で確認できます。',
      },
      {
        icon: IconList,
        title: '一覧表示',
        description: '受診日・猫名・診断・病院・ステータスを一覧で確認できます。',
      },
    ],
  },
  {
    pageKey: 'tags',
    match: (pathname) => pathname === '/tags',
    title: 'タグ管理でできること',
    intro: 'カテゴリ→グループ→タグの階層で、分類ラベルを整理できます。',
    features: [
      {
        icon: IconFolder,
        title: 'カテゴリ管理',
        description: 'タグの大分類カテゴリを作成・編集・削除し、色やスコープを設定できます。',
      },
      {
        icon: IconStack,
        title: 'グループ管理',
        description: 'カテゴリ内のグループを作成・編集・削除し、並び替えできます。',
      },
      {
        icon: IconTag,
        title: 'タグ管理',
        description: 'グループ内のタグを作成・編集・削除し、並び替えできます。',
      },
      {
        icon: IconRobot,
        title: '自動化ルール',
        description: '条件に応じてタグを自動で付与/削除するルールを作成・実行できます。',
      },
      {
        icon: IconLayoutList,
        title: '表示の切り替え',
        description: 'カテゴリ階層・タグ一覧・自動化ルールのタブを切り替えられます。',
      },
      {
        icon: IconEyeOff,
        title: '非アクティブ表示',
        description: '非アクティブな項目を表示/非表示で切り替えられます。',
      },
    ],
  },
  {
    pageKey: 'pedigrees',
    match: (pathname) => pathname === '/pedigrees',
    title: '血統書データでできること',
    intro: '血統書の登録・検索・家系図表示・PDF印刷までを行えます。',
    features: [
      {
        icon: IconPlus,
        title: '血統書の作成',
        description: '猫の血統書データをフォームから登録できます。',
      },
      {
        icon: IconSearch,
        title: '検索・絞り込み',
        description: '血統書番号・名前・性別・猫種・親情報などで検索できます。',
      },
      {
        icon: IconBinaryTree,
        title: '家系図の表示',
        description: '選択した猫の2〜5世代の家系図を視覚的に表示できます。',
      },
      {
        icon: IconPrinter,
        title: 'PDF生成・印刷',
        description: '各血統書をPDF化して開いたり、印刷したりできます。',
      },
      {
        icon: IconAdjustments,
        title: '印刷位置の設定',
        description: 'PDF各項目の座標やフォントサイズをプレビューで調整できます。',
      },
      {
        icon: IconCopy,
        title: 'データの複製',
        description: '既存の血統書をコピーして、新規登録に流用できます。',
      },
    ],
  },
  {
    pageKey: 'staff-shifts',
    match: (pathname) => pathname === '/staff/shifts',
    title: 'スタッフシフトでできること',
    intro: 'スタッフを登録し、カレンダー上で勤務シフトを組めます。',
    features: [
      {
        icon: IconUserPlus,
        title: 'スタッフ登録',
        description: '名前・役職・カラー・出勤曜日・勤務時間を登録できます。',
      },
      {
        icon: IconEdit,
        title: '編集・削除',
        description: '既存スタッフの情報を更新・削除できます。',
      },
      {
        icon: IconCalendarEvent,
        title: 'ドラッグでシフト作成',
        description: 'スタッフをカレンダーへドラッグして、指定日にシフトを作成できます。',
      },
      {
        icon: IconCalendarPlus,
        title: 'テンプレート一括入力',
        description: '出勤曜日テンプレートから、表示期間内のシフトを一括生成できます。',
      },
      {
        icon: IconClipboard,
        title: 'シフトのコピー',
        description: '日付ごとのシフトをテキスト化して、クリップボードにコピーできます。',
      },
    ],
  },
  {
    pageKey: 'tenants',
    match: (pathname) => pathname === '/tenants',
    title: 'ユーザー設定でできること',
    intro: '自分のプロフィールと、テナント内ユーザーの権限を管理できます。',
    features: [
      {
        icon: IconUser,
        title: 'プロフィール編集',
        description: 'ユーザー名・メールアドレスを変更できます。',
      },
      {
        icon: IconLock,
        title: 'パスワード変更',
        description: '現在のパスワードと新しいパスワードを入力して変更できます。',
      },
      {
        icon: IconUserPlus,
        title: 'ユーザー招待',
        description: 'テナント内に新規ユーザーを招待し、ロールを指定できます（管理者）。',
      },
      {
        icon: IconShield,
        title: 'ロール変更',
        description: 'テナント内ユーザーの権限（一般/管理者）を変更できます。',
      },
      {
        icon: IconTrash,
        title: 'ユーザー削除',
        description: 'テナント内のユーザーを削除できます。',
      },
      {
        icon: IconBuildingSkyscraper,
        title: 'テナント管理',
        description: 'テナントの作成・編集・削除や管理者の招待ができます（スーパー管理者）。',
      },
    ],
  },
  {
    pageKey: 'gallery',
    match: (pathname) => pathname === '/gallery',
    title: 'ギャラリーでできること',
    intro: '子猫・父猫・母猫・卒業猫の写真や動画を一元管理できます。',
    features: [
      {
        icon: IconCategory,
        title: 'カテゴリ切り替え',
        description: '子猫・父猫・母猫・卒業猫のタブで表示を切り替えられます。',
      },
      {
        icon: IconUpload,
        title: '写真・動画の追加',
        description: '画像ファイルやYouTube動画URLを、基本情報付きで追加できます。',
      },
      {
        icon: IconEdit,
        title: '情報の編集',
        description: '各エントリの名前・性別・毛色・メモなどを編集できます。',
      },
      {
        icon: IconTrash,
        title: '削除',
        description: '不要なエントリを確認ダイアログ付きで削除できます。',
      },
      {
        icon: IconPhoto,
        title: '拡大表示',
        description: '写真や動画をライトボックスでフルスクリーン閲覧できます。',
      },
    ],
  },
  {
    pageKey: 'more',
    match: (pathname) => pathname === '/more',
    title: 'その他の機能でできること',
    intro: 'データの入出力や印刷テンプレートの設定にアクセスできます。',
    features: [
      {
        icon: IconPrinter,
        title: '印刷テンプレート管理',
        description: '血統書など各種書類の印刷レイアウトを設定・カスタマイズできます。',
      },
      {
        icon: IconFileExport,
        title: 'データエクスポート',
        description: '猫の情報などをCSV/PDFで出力して外部で利用できます。',
      },
      {
        icon: IconFileImport,
        title: 'データインポート',
        description: 'CSVファイルから猫の情報を一括登録できます。',
      },
    ],
  },
  {
    pageKey: 'export',
    match: (pathname) => pathname === '/export',
    title: 'エクスポートでできること',
    intro: '登録済みデータをファイルに書き出して、外部で活用できます。',
    features: [
      {
        icon: IconFileExport,
        title: 'データの出力',
        description: '猫・血統書・ケア・タグのデータをファイルに書き出せます。',
      },
      {
        icon: IconDownload,
        title: '形式の選択',
        description: 'CSV（表計算向け）かJSON（構造保持）を選んでダウンロードできます。',
      },
      {
        icon: IconCalendar,
        title: '期間で絞り込み',
        description: '開始日・終了日を指定して、該当期間のデータだけ出力できます。',
      },
    ],
  },
  {
    pageKey: 'import',
    match: (pathname) => pathname === '/import',
    title: 'インポートでできること',
    intro: 'CSVファイルから、データをまとめて取り込めます。',
    features: [
      {
        icon: IconList,
        title: '対象の選択',
        description: '猫・血統書・タグから、インポートする対象を選べます。',
      },
      {
        icon: IconUpload,
        title: 'ファイルのアップロード',
        description: 'CSVをドラッグ＆ドロップ（最大5MB）で読み込めます。',
      },
      {
        icon: IconEye,
        title: '内容の確認',
        description: '件数・カラム名・先頭データをプレビューで検証できます。',
      },
      {
        icon: IconFileImport,
        title: '取り込みの実行',
        description: '成功/失敗の件数と進捗を確認しながらインポートできます。',
      },
      {
        icon: IconAlertCircle,
        title: 'エラーの確認',
        description: 'インポート失敗時に、エラーの詳細を一覧で確認できます。',
      },
    ],
  },
];

export const PAGE_GUIDES: readonly PageGuide[] = guides;

/** 現在のパスに対応するページガイドを返す。無ければ null */
export function findPageGuide(pathname: string): PageGuide | null {
  return PAGE_GUIDES.find((guide) => guide.match(pathname)) ?? null;
}
