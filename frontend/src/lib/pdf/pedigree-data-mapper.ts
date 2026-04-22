import type { AncestorData, PedigreeData } from './pedigree-pdf-generator';

/**
 * バックエンド `/pedigrees/pedigree-id/:pedigreeId` GET のレスポンス（Prisma Pedigree + relations）を
 * pdf-lib ジェネレータが要求する PedigreeData に変換する。
 *
 * Pedigree モデルは 3 世代分の先祖情報を単一レコード上の文字列フィールドで保持しているため、
 * ここで nested 構造に組み替える。
 */

export interface BackendPedigreeDetail {
  pedigreeId: string;
  catName: string | null;
  catName2: string | null;
  title: string | null;
  eyeColor: string | null;
  birthDate: string | null;
  registrationDate: string | null;
  breederName: string | null;
  ownerName: string | null;
  brotherCount: number | null;
  sisterCount: number | null;
  otherNo: string | null;

  breed: { code: number; name: string } | null;
  coatColor: { code: number; name: string } | null;
  gender: { code: number; name: string } | null;

  fatherTitle: string | null;
  fatherCatName: string | null;
  fatherCatName2: string | null;
  fatherCoatColor: string | null;
  fatherEyeColor: string | null;
  fatherJCU: string | null;

  motherTitle: string | null;
  motherCatName: string | null;
  motherCatName2: string | null;
  motherCoatColor: string | null;
  motherEyeColor: string | null;
  motherJCU: string | null;

  ffTitle: string | null; ffCatName: string | null; ffCatColor: string | null; ffjcu: string | null;
  fmTitle: string | null; fmCatName: string | null; fmCatColor: string | null; fmjcu: string | null;
  mfTitle: string | null; mfCatName: string | null; mfCatColor: string | null; mfjcu: string | null;
  mmTitle: string | null; mmCatName: string | null; mmCatColor: string | null; mmjcu: string | null;

  fffTitle: string | null; fffCatName: string | null; fffjcu: string | null;
  ffmTitle: string | null; ffmCatName: string | null; ffmjcu: string | null;
  fmfTitle: string | null; fmfCatName: string | null; fmfjcu: string | null;
  fmmTitle: string | null; fmmCatName: string | null; fmmjcu: string | null;
  mffTitle: string | null; mffCatName: string | null; mffjcu: string | null;
  mfmTitle: string | null; mfmCatName: string | null; mfmjcu: string | null;
  mmfTitle: string | null; mmfCatName: string | null; mmfjcu: string | null;
  mmmTitle: string | null; mmmCatName: string | null; mmmjcu: string | null;
}

// 称号は別描画（赤文字）するため、名前部分だけを連結する。
const joinName = (
  name: string | null,
  name2: string | null,
): string => [name, name2].filter((v): v is string => Boolean(v)).join(' ');

// 本猫の名前だけは title を先頭に含めて表示する（ヘッダーのリボン内は単一行のため）。
const joinCatNameWithTitle = (
  title: string | null,
  name: string | null,
  name2: string | null,
): string => [title, name, name2].filter((v): v is string => Boolean(v)).join(' ');

// 既存 Access 出力と揃えるため yyyy.mm.dd（ドット区切り）で表示する。
const formatDate = (date: string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

const parentData = (
  title: string | null,
  name: string | null,
  name2: string | null,
  color: string | null,
  eyeColor: string | null,
  registrationNo: string | null,
): AncestorData => ({
  title: title ?? undefined,
  name: joinName(name, name2),
  color: color ?? undefined,
  eyeColor: eyeColor ?? undefined,
  registrationNo: registrationNo ?? undefined,
});

const grandParentData = (
  title: string | null,
  name: string | null,
  color: string | null,
  registrationNo: string | null,
): AncestorData => ({
  title: title ?? undefined,
  name: name ?? '',
  color: color ?? undefined,
  registrationNo: registrationNo ?? undefined,
});

const greatGrandParentData = (
  title: string | null,
  name: string | null,
  registrationNo: string | null,
): AncestorData => ({
  title: title ?? undefined,
  name: name ?? '',
  registrationNo: registrationNo ?? undefined,
});

export const mapBackendPedigreeToPdfData = (p: BackendPedigreeDetail): PedigreeData => ({
  catName: joinCatNameWithTitle(p.title, p.catName, p.catName2),
  registrationNo: p.pedigreeId,
  breed: p.breed?.name ?? '',
  color: p.coatColor?.name ?? '',
  sex: p.gender?.name ?? '',
  eyeColor: p.eyeColor ?? '',
  birthDate: formatDate(p.birthDate),
  registrationDate: formatDate(p.registrationDate),
  breeder: p.breederName ?? '',
  owner: p.ownerName ?? '',
  littersM: p.brotherCount != null ? String(p.brotherCount) : '',
  littersF: p.sisterCount != null ? String(p.sisterCount) : '',
  otherOrganizationsNo: p.otherNo ?? '',

  sire: parentData(p.fatherTitle, p.fatherCatName, p.fatherCatName2, p.fatherCoatColor, p.fatherEyeColor, p.fatherJCU),
  dam: parentData(p.motherTitle, p.motherCatName, p.motherCatName2, p.motherCoatColor, p.motherEyeColor, p.motherJCU),

  sireFather: grandParentData(p.ffTitle, p.ffCatName, p.ffCatColor, p.ffjcu),
  sireMother: grandParentData(p.fmTitle, p.fmCatName, p.fmCatColor, p.fmjcu),
  damFather: grandParentData(p.mfTitle, p.mfCatName, p.mfCatColor, p.mfjcu),
  damMother: grandParentData(p.mmTitle, p.mmCatName, p.mmCatColor, p.mmjcu),

  sireFatherFather: greatGrandParentData(p.fffTitle, p.fffCatName, p.fffjcu),
  sireFatherMother: greatGrandParentData(p.ffmTitle, p.ffmCatName, p.ffmjcu),
  sireMotherFather: greatGrandParentData(p.fmfTitle, p.fmfCatName, p.fmfjcu),
  sireMotherMother: greatGrandParentData(p.fmmTitle, p.fmmCatName, p.fmmjcu),
  damFatherFather: greatGrandParentData(p.mffTitle, p.mffCatName, p.mffjcu),
  damFatherMother: greatGrandParentData(p.mfmTitle, p.mfmCatName, p.mfmjcu),
  damMotherFather: greatGrandParentData(p.mmfTitle, p.mmfCatName, p.mmfjcu),
  damMotherMother: greatGrandParentData(p.mmmTitle, p.mmmCatName, p.mmmjcu),
});
