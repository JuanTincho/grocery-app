// Connects the lists store to storage: load once at startup, then save on every change.
// Mobile apps get no reliable "about to close" event (the OS can kill a backgrounded
// app at any time), so the data is written as it changes rather than on exit.
import { STORAGE_VERSION, type AppStorage } from '@/core/storage';
import { mmkvStorage } from '@/storage/mmkv-storage';
import { useListsStore } from '@/stores/lists-store';

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
  }
  // Placeholder until the pantry store exists: keep whatever was loaded, unchanged.
  const pantry = loaded.status === 'ok' ? loaded.state.pantry : [];

  useListsStore.subscribe((state, previous) => {
    if (state.list !== previous.list) {
      storage.save({ version: STORAGE_VERSION, list: state.list, pantry });
    }
  });
}
