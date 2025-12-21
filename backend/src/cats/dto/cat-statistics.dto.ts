/**
 * 猫統計情報のレスポンスDTO
 * タブ別カウントを含む拡張統計情報
 */

/**
 * タブ別カウント情報
 */
export interface TabCounts {
  /** 全成猫数（子猫除外） */
  total: number;
  /** オス成猫数 */
  male: number;
  /** メス成猫数 */
  female: number;
  /** 子猫数（生後3ヶ月以内 + 母猫あり） */
  kitten: number;
  /** 養成中タグ付き猫数 */
  raising: number;
  /** 卒業予定タグ付き猫数 */
  grad: number;
}

/**
 * 性別分布情報
 */
export interface GenderDistribution {
  MALE: number;
  FEMALE: number;
  NEUTER: number;
  SPAY: number;
}

/**
 * 品種統計情報
 */
export interface BreedStat {
  breed: {
    id: string;
    name: string;
  } | null;
  count: number;
}

/**
 * 猫統計レスポンス
 */
export interface CatStatisticsResponse {
  /** 全猫数 */
  total: number;
  /** 性別分布 */
  genderDistribution: GenderDistribution;
  /** 品種分布（上位10件） */
  breedDistribution: BreedStat[];
  /** タブ別カウント（猫一覧ページ用） */
  tabCounts: TabCounts;
}

