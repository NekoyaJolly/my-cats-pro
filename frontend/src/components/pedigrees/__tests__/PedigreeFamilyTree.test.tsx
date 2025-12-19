import { isFamilyTreeData, type FamilyTreeData } from '../PedigreeFamilyTree';

const createNode = (
  id: string,
  father: FamilyTreeData | null = null,
  mother: FamilyTreeData | null = null,
): FamilyTreeData => ({
  id,
  pedigreeId: `ped-${id}`,
  catName: `Cat ${id}`,
  breedCode: null,
  gender: null,
  birthDate: null,
  coatColorCode: null,
  breed: null,
  color: null,
  father,
  mother,
});

describe('isFamilyTreeData', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('有効な家系図データを検証できる', () => {
    const tree = createNode('root', createNode('father'), createNode('mother'));

    expect(isFamilyTreeData(tree)).toBe(true);
  });

  it('無効な型は false を返す', () => {
    expect(isFamilyTreeData('invalid')).toBe(false);
  });

  it('深度が上限を超える場合は警告しつつ検証を継続する', () => {
    const deepTree = createNode(
      'root',
      createNode('f1', createNode('f2', createNode('f3', createNode('f4')))),
      null,
    );
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(isFamilyTreeData(deepTree)).toBe(true);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('null や undefined は無効と判定する', () => {
    expect(isFamilyTreeData(null)).toBe(false);
    expect(isFamilyTreeData(undefined)).toBe(false);
  });
});
