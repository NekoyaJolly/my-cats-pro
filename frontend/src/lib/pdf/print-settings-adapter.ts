import type {
  AncestorLayout,
  PedigreeLayout,
  TextFieldLayout,
} from './pedigree-layout';
import type { TextAlign } from './mm-coordinate-helper';

/**
 * バックエンド `/pedigrees/print-settings` GET のレスポンス型。
 * backend/src/pedigree/pdf/print-settings.service.ts の PositionsConfig と対応する。
 * DB の pedigree_print_settings.settings JSON カラムに保存されている。
 */

export interface BackendPosition {
  x: number;
  y: number;
  align?: TextAlign;
}

export interface BackendParentPositions {
  name: BackendPosition;
  color: BackendPosition;
  eyeColor?: BackendPosition;
  jcu: BackendPosition;
}

export interface BackendGrandParentPositions {
  name: BackendPosition;
  color: BackendPosition;
  jcu: BackendPosition;
}

export interface BackendGreatGrandParentPositions {
  name: BackendPosition;
  jcu: BackendPosition;
}

export interface BackendFontSizes {
  catName: number;
  wcaNo: number;
  headerInfo: number;
  parentName: number;
  parentDetail: number;
  grandParentName: number;
  grandParentDetail: number;
  greatGrandParent: number;
  footer: number;
}

export interface BackendPositionsConfig {
  offsetX: number;
  offsetY: number;
  breed: BackendPosition;
  sex: BackendPosition;
  dateOfBirth: BackendPosition;
  eyeColor: BackendPosition;
  color: BackendPosition;
  catName: BackendPosition;
  wcaNo: BackendPosition;
  owner: BackendPosition;
  breeder: BackendPosition;
  dateOfRegistration: BackendPosition;
  littersM: BackendPosition;
  littersF: BackendPosition;
  sire: BackendParentPositions;
  dam: BackendParentPositions;
  grandParents: {
    ff: BackendGrandParentPositions;
    fm: BackendGrandParentPositions;
    mf: BackendGrandParentPositions;
    mm: BackendGrandParentPositions;
  };
  greatGrandParents: {
    fff: BackendGreatGrandParentPositions;
    ffm: BackendGreatGrandParentPositions;
    fmf: BackendGreatGrandParentPositions;
    fmm: BackendGreatGrandParentPositions;
    mff: BackendGreatGrandParentPositions;
    mfm: BackendGreatGrandParentPositions;
    mmf: BackendGreatGrandParentPositions;
    mmm: BackendGreatGrandParentPositions;
  };
  otherOrganizationsNo: BackendPosition;
  fontSizes: BackendFontSizes;
}

const buildField = (
  pos: BackendPosition,
  fontSize: number,
  extras: { bold?: boolean; maxWidthMm?: number } = {},
): TextFieldLayout => ({
  x: pos.x,
  y: pos.y,
  fontSize,
  align: pos.align,
  bold: extras.bold,
  maxWidthMm: extras.maxWidthMm,
});

/** 現物血統書の観察から、称号行は名前の 6mm 上に配置される */
const TITLE_OFFSET_ABOVE_NAME_MM = 6;

const buildTitleLayout = (namePos: BackendPosition, nameFontSize: number): TextFieldLayout => ({
  x: namePos.x,
  y: namePos.y - TITLE_OFFSET_ABOVE_NAME_MM,
  fontSize: Math.max(nameFontSize - 1, 8),
  align: namePos.align,
});

const buildParentLayout = (
  parent: BackendParentPositions,
  nameFontSize: number,
  detailFontSize: number,
): AncestorLayout => ({
  title: buildTitleLayout(parent.name, nameFontSize),
  name: buildField(parent.name, nameFontSize, { bold: true }),
  color: buildField(parent.color, detailFontSize),
  eyeColor: parent.eyeColor ? buildField(parent.eyeColor, detailFontSize) : undefined,
  registrationNo: buildField(parent.jcu, detailFontSize),
});

const buildGrandParentLayout = (
  grand: BackendGrandParentPositions,
  nameFontSize: number,
  detailFontSize: number,
): AncestorLayout => ({
  title: buildTitleLayout(grand.name, nameFontSize),
  name: buildField(grand.name, nameFontSize),
  color: buildField(grand.color, detailFontSize),
  registrationNo: buildField(grand.jcu, detailFontSize),
});

const buildGreatGrandParentLayout = (
  great: BackendGreatGrandParentPositions,
  fontSize: number,
): AncestorLayout => ({
  title: buildTitleLayout(great.name, fontSize),
  name: buildField(great.name, fontSize),
  registrationNo: buildField(great.jcu, fontSize),
});

/**
 * バックエンド API `/pedigrees/print-settings` GET の戻り値を、
 * フロント pdf-lib ジェネレータが使う PedigreeLayout に変換する。
 *
 * offsetX/offsetY は PedigreeLayout には含めず、generatePedigreePdf の
 * offsetXmm/offsetYmm として別途渡すため、別関数で取り出す。
 */
export const convertPositionsConfigToLayout = (
  config: BackendPositionsConfig,
): PedigreeLayout => {
  const fs = config.fontSizes;
  return {
    breed: buildField(config.breed, fs.headerInfo),
    sex: buildField(config.sex, fs.headerInfo),
    birthDate: buildField(config.dateOfBirth, fs.headerInfo),
    eyeColor: buildField(config.eyeColor, fs.headerInfo),
    color: buildField(config.color, fs.headerInfo),
    catName: buildField(config.catName, fs.catName, { bold: true }),
    registrationNo: buildField(config.wcaNo, fs.wcaNo),
    owner: buildField(config.owner, fs.headerInfo),
    breeder: buildField(config.breeder, fs.headerInfo),
    registrationDate: buildField(config.dateOfRegistration, fs.headerInfo),
    littersM: buildField(config.littersM, fs.headerInfo),
    littersF: buildField(config.littersF, fs.headerInfo),
    otherOrganizationsNo: buildField(config.otherOrganizationsNo, fs.footer),

    sire: buildParentLayout(config.sire, fs.parentName, fs.parentDetail),
    dam: buildParentLayout(config.dam, fs.parentName, fs.parentDetail),

    sireFather: buildGrandParentLayout(config.grandParents.ff, fs.grandParentName, fs.grandParentDetail),
    sireMother: buildGrandParentLayout(config.grandParents.fm, fs.grandParentName, fs.grandParentDetail),
    damFather: buildGrandParentLayout(config.grandParents.mf, fs.grandParentName, fs.grandParentDetail),
    damMother: buildGrandParentLayout(config.grandParents.mm, fs.grandParentName, fs.grandParentDetail),

    sireFatherFather: buildGreatGrandParentLayout(config.greatGrandParents.fff, fs.greatGrandParent),
    sireFatherMother: buildGreatGrandParentLayout(config.greatGrandParents.ffm, fs.greatGrandParent),
    sireMotherFather: buildGreatGrandParentLayout(config.greatGrandParents.fmf, fs.greatGrandParent),
    sireMotherMother: buildGreatGrandParentLayout(config.greatGrandParents.fmm, fs.greatGrandParent),
    damFatherFather: buildGreatGrandParentLayout(config.greatGrandParents.mff, fs.greatGrandParent),
    damFatherMother: buildGreatGrandParentLayout(config.greatGrandParents.mfm, fs.greatGrandParent),
    damMotherFather: buildGreatGrandParentLayout(config.greatGrandParents.mmf, fs.greatGrandParent),
    damMotherMother: buildGreatGrandParentLayout(config.greatGrandParents.mmm, fs.greatGrandParent),
  };
};

export const extractOffsetFromConfig = (
  config: BackendPositionsConfig,
): { offsetXmm: number; offsetYmm: number } => ({
  offsetXmm: config.offsetX,
  offsetYmm: config.offsetY,
});
