import type { MasterDataItem } from '@/lib/api/hooks/use-master-data';

export interface MasterOption {
  value: string;
  label: string;
  code?: number;
}

export type MasterDisplayMap = Map<number, string>;

export function createDisplayNameMap(items?: MasterDataItem[] | null): MasterDisplayMap {
  if (!items || items.length === 0) {
    return new Map();
  }

  return items.reduce<MasterDisplayMap>((acc, item) => {
    const baseLabel = (item.displayName ?? item.name ?? '').trim();
    acc.set(item.code, baseLabel);
    return acc;
  }, new Map());
}

interface HasDataProperty<T> {
  data?: ReadonlyArray<T> | null;
}

interface OptionSource {
  id: string;
  name: string;
  code?: number | null;
}

type OptionRecords<T extends OptionSource> =
  | ReadonlyArray<T>
  | HasDataProperty<T>
  | null
  | undefined;

export function buildMasterOptions<T extends OptionSource>(
  records: OptionRecords<T>,
  displayMap?: MasterDisplayMap,
): MasterOption[] {
  const normalized = resolveRecords(records).filter((record) => !isPlaceholderRecord(record));
  if (normalized.length === 0) {
    return [];
  }

  return normalized.map((record) => ({
    value: record.id,
    code: typeof record.code === 'number' ? record.code : undefined,
    label: resolveLabel(record, displayMap),
  }));
}

function isPlaceholderRecord(record: OptionSource): boolean {
  const noName = !record.name || record.name.trim().length === 0;
  return record.code === 0 && noName;
}

function resolveRecords<T extends OptionSource>(records: OptionRecords<T>): ReadonlyArray<T> {
  if (!records) {
    return [];
  }

  if (isOptionArray(records)) {
    return records;
  }

  if (hasArrayData(records)) {
    return records.data;
  }

  return [];
}

function hasDataProperty<T extends OptionSource>(value: OptionRecords<T>): value is HasDataProperty<T> {
  return typeof value === 'object' && value !== null && 'data' in value;
}

function isOptionArray<T extends OptionSource>(value: OptionRecords<T>): value is ReadonlyArray<T> {
  return Array.isArray(value);
}

function hasArrayData<T extends OptionSource>(value: OptionRecords<T>): value is HasDataProperty<T> & { data: ReadonlyArray<T> } {
  return hasDataProperty(value) && Array.isArray(value.data);
}

function resolveLabel(record: OptionSource, displayMap?: MasterDisplayMap): string {
  if (typeof record.code === 'number') {
    const display = displayMap?.get(record.code);
    if (display) {
      return display;
    }
    const baseName = record.name?.trim() ?? '';
    if (baseName) {
      return baseName;
    }
    return String(record.code);
  }

  return record.name;
}
