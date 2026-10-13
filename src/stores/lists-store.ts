// Client state for shopping lists. A thin wrapper: the store creates ids and timestamps
// (things src/core can't do without Expo or the clock) and delegates the logic to src/core.
import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

import {
  addItem,
  moveItem,
  removeItem,
  toggleChecked,
  updateItem,
  type ItemChanges,
  type NewItem,
} from '@/core/lists';
import type { ShoppingList } from '@/core/types';
import { SAMPLE_ITEMS } from '@/stores/sample-items';

type ListsState = {
  list: ShoppingList;
  add: (input: Omit<NewItem, 'id'>) => void;
  update: (id: string, changes: ItemChanges) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  move: (id: string, toIndex: number) => void;
};

const now = () => new Date().toISOString();

export const useListsStore = create<ListsState>()((set) => ({
  // Initial value for a first launch; src/storage/persistence.ts replaces it with saved data.
  // Sample data in development only; release builds start empty.
  list: { id: 'default', name: 'Shopping list', items: __DEV__ ? SAMPLE_ITEMS : [] },
  add: (input) => set((s) => ({ list: addItem(s.list, { ...input, id: randomUUID() }, now()) })),
  update: (id, changes) => set((s) => ({ list: updateItem(s.list, id, changes, now()) })),
  toggle: (id) => set((s) => ({ list: toggleChecked(s.list, id, now()) })),
  remove: (id) => set((s) => ({ list: removeItem(s.list, id) })),
  move: (id, toIndex) => set((s) => ({ list: moveItem(s.list, id, toIndex, now()) })),
}));
