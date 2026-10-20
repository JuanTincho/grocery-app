// Connects the lists and pantry stores to storage: load once at startup, then save on every change.
// Mobile apps get no reliable "about to close" event (the OS can kill a backgrounded
// app at any time), so the data is written as it changes rather than on exit.
import { STORAGE_VERSION, type AppStorage } from '@/core/storage';
import { mmkvStorage } from '@/storage/mmkv-storage';
import { useListsStore } from '@/stores/lists-store';
import { usePantryStore } from '@/stores/pantry-store';

let started = false; // Fast Refresh can re-run the caller; subscribe only once

export function startPersistence(storage: AppStorage = mmkvStorage): void {
  if (started) return;
  started = true;

  const loaded = storage.load();

  if (loaded.status === 'unreadable') {
    // Never drop data we can't read: keep running in memory and don't save over it.
    console.warn(`Stored data is unreadable (${loaded.reason}); changes won't be saved.`);
    return;
  }
  if (loaded.status === 'ok') {
    useListsStore.setState({ list: loaded.state.list });
    usePantryStore.setState({ items: loaded.state.pantry });
  }

  // Everything is stored under one key, so each save writes both stores together.
  const save = () =>
    storage.save({
      version: STORAGE_VERSION,
      list: useListsStore.getState().list,
      pantry: usePantryStore.getState().items,
    });

  // Each store saves only when its own data changed (new reference), not on every set().
  useListsStore.subscribe((state, previous) => {
    if (state.list !== previous.list) save();
  });
  usePantryStore.subscribe((state, previous) => {
    if (state.items !== previous.items) save();
  });
}
