import { keepPreviousData, onlineManager, useQuery } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { searchProducts } from './off-client';
import { useDebouncedValue } from './use-debounced-value';

export const MIN_SEARCH_LENGTH = 3;
// Wait until typing pauses, so one search runs per word instead of one per letter.
const DEBOUNCE_MS = 500;

// Server state: results live in TanStack Query's cache, keyed by the search term,
// not in a Zustand store.
export function useProductSearch(input: string) {
  const term = input.trim().toLowerCase();
  const debouncedTerm = useDebouncedValue(term, DEBOUNCE_MS);
  const enabled = debouncedTerm.length >= MIN_SEARCH_LENGTH;

  const query = useQuery({
    queryKey: ['products', 'search', debouncedTerm],
    queryFn: ({ signal }) => searchProducts(debouncedTerm, signal),
    enabled,
    placeholderData: keepPreviousData, // keep the old results visible while the next load
  });

  return {
    ...query,
    enabled,
    isWaitingForInput: term !== debouncedTerm, // still typing; no request sent yet
  };
}

// True while the device has a connection, as reported by NetInfo through onlineManager.
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
  );
}
