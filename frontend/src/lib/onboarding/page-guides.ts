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
];

export const PAGE_GUIDES: readonly PageGuide[] = guides;

/** 現在のパスに対応するページガイドを返す。無ければ null */
export function findPageGuide(pathname: string): PageGuide | null {
  return PAGE_GUIDES.find((guide) => guide.match(pathname)) ?? null;
}
