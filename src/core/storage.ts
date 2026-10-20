// Storage contract and the persisted data format. No storage library is imported here:
// src/storage provides the implementation (MMKV), and another client could provide its own.
import type { PantryItem, ShoppingList } from './types';

export const STORAGE_VERSION = 2;

// What is written to disk: plain JSON with a version, so the format can change later.
export type PersistedState = {
  version: number;
  list: ShoppingList;
  pantry: PantryItem[]; // added in version 2
};

export type LoadResult =
  | { status: 'empty' } // nothing saved yet (first launch)
  | { status: 'ok'; state: PersistedState }
  // Saved data this app version can't read (newer version or corrupt).
  // The caller must not overwrite it.
  | { status: 'unreadable'; reason: string };

export interface AppStorage {
  load(): LoadResult;
  save(state: PersistedState): void;
}

// Turns the raw stored string into a LoadResult. Never throws.
export function parsePersisted(raw: string | undefined): LoadResult {
  if (raw === undefined) return { status: 'empty' };

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { status: 'unreadable', reason: 'not valid JSON' };
  }

  if (!isRecord(data) || typeof data.version !== 'number') {
    return { status: 'unreadable', reason: 'missing version' };
  }
  if (data.version > STORAGE_VERSION) {
    // Written by a newer app version: we can't know what it means, so don't touch it.
    return { status: 'unreadable', reason: `unknown version ${data.version}` };
  }
  if (!isRecord(data.list) || !Array.isArray(data.list.items)) {
    return { status: 'unreadable', reason: 'missing list' };
  }
  // Version 1 had no pantry. Upgrade in memory; the next save writes version 2.
  if (data.version === 1) {
    return { status: 'ok', state: { ...(data as PersistedState), version: 2, pantry: [] } };
  }
  if (data.version !== STORAGE_VERSION || !Array.isArray(data.pantry)) {
    return { status: 'unreadable', reason: 'missing pantry' };
  }
  return { status: 'ok', state: data as PersistedState };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
