// Client state for the pantry. Same shape as the lists store: the store creates ids and
// timestamps and delegates the logic to src/core. Sorting and expiry status are derived
// in the screen, because they depend on the current day and aren't stored.
import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';

import {
  addPantryItem,
  removePantryItem,
  updatePantryItem,
  type NewPantryItem,
  type PantryChanges,
} from '@/core/pantry';
import type { PantryItem } from '@/core/types';

type PantryState = {
  items: PantryItem[];
  add: (input: Omit<NewPantryItem, 'id'>) => void;
  update: (id: string, changes: PantryChanges) => void;
  remove: (id: string) => void;
};

const now = () => new Date().toISOString();

export const usePantryStore = create<PantryState>()((set) => ({
  // Empty on first launch; src/storage/persistence.ts replaces it with saved data.
  items: [],
  add: (input) =>
    set((s) => ({ items: addPantryItem(s.items, { ...input, id: randomUUID() }, now()) })),
  update: (id, changes) => set((s) => ({ items: updatePantryItem(s.items, id, changes, now()) })),
  remove: (id) => set((s) => ({ items: removePantryItem(s.items, id) })),
}));
