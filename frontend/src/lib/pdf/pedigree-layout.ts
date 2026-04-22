/**
 * 血統書レイアウト定義
 * 座標は全て「用紙左上を原点(0,0)とした mm 単位」で表記する。
 * 用紙: 339mm × 239mm
 *
 * バックエンドの backend/src/pedigree/pdf/positions.json と対応させる想定。
 * フロント単独生成時は本ファイルのデフォルト値を使用し、
 * 印刷設定エディタで調整された座標を渡した場合はそちらを優先する。
 */

export interface TextFieldLayout {
  x: number;
  y: number;
  fontSize: number;
  maxWidthMm?: number;
  bold?: boolean;
}

export interface PedigreeLayout {
  title: TextFieldLayout;
  catName: TextFieldLayout;
  registrationNo: TextFieldLayout;
  breed: TextFieldLayout;
  color: TextFieldLayout;
  sex: TextFieldLayout;
  birthDate: TextFieldLayout;
  breeder: TextFieldLayout;
  owner: TextFieldLayout;

  sire: AncestorLayout;
  dam: AncestorLayout;

  sireFather: AncestorLayout;
  sireMother: AncestorLayout;
  damFather: AncestorLayout;
  damMother: AncestorLayout;

  sireFatherFather: AncestorLayout;
  sireFatherMother: AncestorLayout;
  sireMotherFather: AncestorLayout;
  sireMotherMother: AncestorLayout;
  damFatherFather: AncestorLayout;
  damFatherMother: AncestorLayout;
  damMotherFather: AncestorLayout;
  damMotherMother: AncestorLayout;
}

export interface AncestorLayout {
  name: TextFieldLayout;
  color?: TextFieldLayout;
  registrationNo?: TextFieldLayout;
}

/**
 * Brother MFC-J6983CDW のフチあり印刷時の印字可能領域を考慮し、
 * 上下左右 5mm 以上のマージンを確保したデフォルト座標。
 * 「フチなし印刷」設定時はプリンタ側で約 103% 拡大されるため、
 * ドライバ側で「フチなし=OFF」「倍率=100%/実寸」を必ず設定すること。
 */
export const DEFAULT_PEDIGREE_LAYOUT: PedigreeLayout = {
  title: { x: 339 / 2 - 40, y: 10, fontSize: 18, bold: true },

  catName: { x: 25, y: 30, fontSize: 14, maxWidthMm: 110, bold: true },
  registrationNo: { x: 25, y: 40, fontSize: 10, maxWidthMm: 110 },
  breed: { x: 25, y: 50, fontSize: 10, maxWidthMm: 110 },
  color: { x: 25, y: 58, fontSize: 10, maxWidthMm: 110 },
  sex: { x: 25, y: 66, fontSize: 10, maxWidthMm: 50 },
  birthDate: { x: 25, y: 74, fontSize: 10, maxWidthMm: 110 },
  breeder: { x: 25, y: 82, fontSize: 9, maxWidthMm: 110 },
  owner: { x: 25, y: 90, fontSize: 9, maxWidthMm: 110 },

  sire: {
    name: { x: 160, y: 40, fontSize: 11, maxWidthMm: 80, bold: true },
    color: { x: 160, y: 48, fontSize: 9, maxWidthMm: 80 },
    registrationNo: { x: 160, y: 54, fontSize: 9, maxWidthMm: 80 },
  },
  dam: {
    name: { x: 160, y: 160, fontSize: 11, maxWidthMm: 80, bold: true },
    color: { x: 160, y: 168, fontSize: 9, maxWidthMm: 80 },
    registrationNo: { x: 160, y: 174, fontSize: 9, maxWidthMm: 80 },
  },

  sireFather: {
    name: { x: 225, y: 20, fontSize: 10, maxWidthMm: 55 },
    color: { x: 225, y: 27, fontSize: 8, maxWidthMm: 55 },
    registrationNo: { x: 225, y: 33, fontSize: 8, maxWidthMm: 55 },
  },
  sireMother: {
    name: { x: 225, y: 65, fontSize: 10, maxWidthMm: 55 },
    color: { x: 225, y: 72, fontSize: 8, maxWidthMm: 55 },
    registrationNo: { x: 225, y: 78, fontSize: 8, maxWidthMm: 55 },
  },
  damFather: {
    name: { x: 225, y: 140, fontSize: 10, maxWidthMm: 55 },
    color: { x: 225, y: 147, fontSize: 8, maxWidthMm: 55 },
    registrationNo: { x: 225, y: 153, fontSize: 8, maxWidthMm: 55 },
  },
  damMother: {
    name: { x: 225, y: 185, fontSize: 10, maxWidthMm: 55 },
    color: { x: 225, y: 192, fontSize: 8, maxWidthMm: 55 },
    registrationNo: { x: 225, y: 198, fontSize: 8, maxWidthMm: 55 },
  },

  sireFatherFather: {
    name: { x: 285, y: 15, fontSize: 9, maxWidthMm: 48 },
    registrationNo: { x: 285, y: 22, fontSize: 7, maxWidthMm: 48 },
  },
  sireFatherMother: {
    name: { x: 285, y: 37, fontSize: 9, maxWidthMm: 48 },
    registrationNo: { x: 285, y: 44, fontSize: 7, maxWidthMm: 48 },
  },
  sireMotherFather: {
    name: { x: 285, y: 60, fontSize: 9, maxWidthMm: 48 },
    registrationNo: { x: 285, y: 67, fontSize: 7, maxWidthMm: 48 },
  },
  sireMotherMother: {
    name: { x: 285, y: 82, fontSize: 9, maxWidthMm: 48 },
    registrationNo: { x: 285, y: 89, fontSize: 7, maxWidthMm: 48 },
  },
  damFatherFather: {
    name: { x: 285, y: 135, fontSize: 9, maxWidthMm: 48 },
    registrationNo: { x: 285, y: 142, fontSize: 7, maxWidthMm: 48 },
  },
  damFatherMother: {
    name: { x: 285, y: 157, fontSize: 9, maxWidthMm: 48 },
    registrationNo: { x: 285, y: 164, fontSize: 7, maxWidthMm: 48 },
  },
  damMotherFather: {
    name: { x: 285, y: 180, fontSize: 9, maxWidthMm: 48 },
    registrationNo: { x: 285, y: 187, fontSize: 7, maxWidthMm: 48 },
  },
  damMotherMother: {
    name: { x: 285, y: 202, fontSize: 9, maxWidthMm: 48 },
    registrationNo: { x: 285, y: 209, fontSize: 7, maxWidthMm: 48 },
  },
};
