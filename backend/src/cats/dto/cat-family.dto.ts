/**
 * 猫の家族情報（血統タブ用）DTO
 */

/**
 * 祖先（祖父母・曾祖父母）の情報
 * Pedigreeテーブルから取得される先祖情報
 */
export interface AncestorInfo {
  /** 血統書ID（Pedigreeレコードがある場合） */
  pedigreeId: string | null;
  /** 猫の名前 */
  catName: string | null;
  /** 毛色 */
  coatColor: string | null;
  /** タイトル */
  title: string | null;
  /** JCU番号 */
  jcu: string | null;
}

/**
 * 親情報（父または母）
 * 猫レコードとPedigreeレコードの両方から情報を取得
 */
export interface ParentInfo {
  /** 猫ID（Catレコードがある場合） */
  id: string | null;
  /** 血統書ID（Pedigreeレコードがある場合） */
  pedigreeId: string | null;
  /** 猫の名前 */
  name: string;
  /** 性別 */
  gender: string | null;
  /** 生年月日 */
  birthDate: string | null;
  /** 品種 */
  breed: { id: string; name: string } | null;
  /** 毛色 */
  coatColor: { id: string; name: string } | string | null;
  /** 父方祖父 */
  father: AncestorInfo | null;
  /** 父方祖母 */
  mother: AncestorInfo | null;
}

/**
 * 兄弟姉妹情報
 */
export interface SiblingInfo {
  /** 猫ID */
  id: string;
  /** 名前 */
  name: string;
  /** 性別 */
  gender: string;
  /** 生年月日 */
  birthDate: string;
  /** 品種 */
  breed: { id: string; name: string } | null;
  /** 毛色 */
  coatColor: { id: string; name: string } | null;
  /** 血統書ID */
  pedigreeId: string | null;
}

/**
 * 子猫情報
 */
export interface OffspringInfo {
  /** 猫ID */
  id: string;
  /** 名前 */
  name: string;
  /** 性別 */
  gender: string;
  /** 生年月日 */
  birthDate: string;
  /** 品種 */
  breed: { id: string; name: string } | null;
  /** 毛色 */
  coatColor: { id: string; name: string } | null;
  /** 血統書ID */
  pedigreeId: string | null;
  /** 相手の親（この猫がオスなら母、メスなら父） */
  otherParent: {
    id: string;
    name: string;
    gender: string;
    pedigreeId: string | null;
  } | null;
}

/**
 * 猫の家族情報レスポンス
 */
export interface CatFamilyResponse {
  /** 本猫の情報 */
  cat: {
    id: string;
    name: string;
    gender: string;
    birthDate: string;
    pedigreeId: string | null;
    breed: { id: string; name: string } | null;
    coatColor: { id: string; name: string } | null;
  };
  /** 父親情報（Pedigreeから祖父母・曾祖父母を含む） */
  father: ParentInfo | null;
  /** 母親情報（Pedigreeから祖父母・曾祖父母を含む） */
  mother: ParentInfo | null;
  /** 兄弟姉妹（両親が一致する猫のみ） */
  siblings: SiblingInfo[];
  /** 子猫一覧（この猫が親の場合） */
  offspring: OffspringInfo[];
}

