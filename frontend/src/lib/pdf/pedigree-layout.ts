import type { TextAlign } from './mm-coordinate-helper';

/**
 * 血統書レイアウト定義
 * 座標は全て「用紙左上を原点(0,0)とした mm 単位」で表記する。
 * 用紙: 339mm × 239mm
 *
 * バックエンドの pedigree_print_settings テーブルに保存された PositionsConfig を
 * print-settings-adapter.ts で変換して差し替えて使用する。
 */

export interface TextFieldLayout {
  x: number;
  y: number;
  fontSize: number;
  maxWidthMm?: number;
  bold?: boolean;
  align?: TextAlign;
}

export interface AncestorLayout {
  /** チャンピオン称号の位置（赤文字）。adapter で name.y - 6mm に自動配置される */
  title?: TextFieldLayout;
  name: TextFieldLayout;
  color?: TextFieldLayout;
  eyeColor?: TextFieldLayout;
  registrationNo?: TextFieldLayout;
}

export interface PedigreeLayout {
  breed: TextFieldLayout;
  sex: TextFieldLayout;
  birthDate: TextFieldLayout;
  eyeColor: TextFieldLayout;
  color: TextFieldLayout;
  catName: TextFieldLayout;
  registrationNo: TextFieldLayout;
  owner: TextFieldLayout;
  breeder: TextFieldLayout;
  registrationDate: TextFieldLayout;
  littersM: TextFieldLayout;
  littersF: TextFieldLayout;
  otherOrganizationsNo: TextFieldLayout;

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

/**
 * バックエンドの PrintSettingsService.defaultSettings をフロント型に変換したデフォルト。
 * バックエンド DB に設定が存在しない場合のフォールバックとして使用する。
 * 通常は print-settings-adapter の convertPositionsConfigToLayout() を使って
 * DB から取得した設定で上書きする。
 */
export const DEFAULT_PEDIGREE_LAYOUT: PedigreeLayout = {
  breed: { x: 50, y: 50, fontSize: 11 },
  sex: { x: 50, y: 60, fontSize: 11 },
  birthDate: { x: 77, y: 60, fontSize: 11 },
  eyeColor: { x: 50, y: 69, fontSize: 11 },
  color: { x: 77, y: 69, fontSize: 11 },
  catName: { x: 170, y: 55, fontSize: 13, align: 'center', bold: true },
  registrationNo: { x: 170, y: 69, fontSize: 12, align: 'center' },
  owner: { x: 320, y: 50, fontSize: 11, align: 'right' },
  breeder: { x: 320, y: 60, fontSize: 11, align: 'right' },
  registrationDate: { x: 240, y: 69, fontSize: 11 },
  littersM: { x: 277, y: 69, fontSize: 11 },
  littersF: { x: 285, y: 69, fontSize: 11 },
  otherOrganizationsNo: { x: 85, y: 210, fontSize: 7 },

  sire: {
    name: { x: 50, y: 110, fontSize: 12 },
    color: { x: 50, y: 127, fontSize: 11 },
    eyeColor: { x: 50, y: 132, fontSize: 11 },
    registrationNo: { x: 50, y: 137, fontSize: 11 },
  },
  dam: {
    name: { x: 50, y: 160, fontSize: 12 },
    color: { x: 50, y: 177, fontSize: 11 },
    eyeColor: { x: 50, y: 182, fontSize: 11 },
    registrationNo: { x: 50, y: 188, fontSize: 11 },
  },

  sireFather: {
    name: { x: 140, y: 101, fontSize: 11 },
    color: { x: 140, y: 106, fontSize: 11 },
    registrationNo: { x: 140, y: 111, fontSize: 11 },
  },
  sireMother: {
    name: { x: 140, y: 127, fontSize: 11 },
    color: { x: 140, y: 132, fontSize: 11 },
    registrationNo: { x: 140, y: 137, fontSize: 11 },
  },
  damFather: {
    name: { x: 140, y: 152, fontSize: 11 },
    color: { x: 140, y: 157, fontSize: 11 },
    registrationNo: { x: 140, y: 162, fontSize: 11 },
  },
  damMother: {
    name: { x: 140, y: 178, fontSize: 11 },
    color: { x: 140, y: 183, fontSize: 11 },
    registrationNo: { x: 140, y: 188, fontSize: 11 },
  },

  sireFatherFather: {
    name: { x: 232, y: 94, fontSize: 10 },
    registrationNo: { x: 232, y: 98, fontSize: 10 },
  },
  sireFatherMother: {
    name: { x: 232, y: 107, fontSize: 10 },
    registrationNo: { x: 232, y: 111, fontSize: 10 },
  },
  sireMotherFather: {
    name: { x: 232, y: 120, fontSize: 10 },
    registrationNo: { x: 232, y: 124, fontSize: 10 },
  },
  sireMotherMother: {
    name: { x: 232, y: 133, fontSize: 10 },
    registrationNo: { x: 232, y: 137, fontSize: 10 },
  },
  damFatherFather: {
    name: { x: 232, y: 146, fontSize: 10 },
    registrationNo: { x: 232, y: 150, fontSize: 10 },
  },
  damFatherMother: {
    name: { x: 232, y: 158, fontSize: 10 },
    registrationNo: { x: 232, y: 162, fontSize: 10 },
  },
  damMotherFather: {
    name: { x: 232, y: 171, fontSize: 10 },
    registrationNo: { x: 232, y: 175, fontSize: 10 },
  },
  damMotherMother: {
    name: { x: 232, y: 184, fontSize: 10 },
    registrationNo: { x: 232, y: 188, fontSize: 10 },
  },
};
