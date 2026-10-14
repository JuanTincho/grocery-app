// TanStack Query setup for React Native. In a browser, the library listens to
// `window` online/offline and focus events by itself. React Native has neither,
// so the two managers below are wired by hand.
import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

import { OffError } from './off-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // product data changes rarely; don't refetch it for 5 min
      gcTime: 30 * 60 * 1000, // keep unused results in memory for 30 min
      // Retry network failures twice, but never a rate limit (503/429) or a client error.
      retry: (failureCount, error) => !(error instanceof OffError) && failureCount < 2,
    },
  },
});

let started = false; // Fast Refresh can re-run the caller; subscribe only once

export function startQueryLifecycle(): void {
  if (started) return;
  started = true;

  // Online/offline: queries pause while offline and resume when the connection returns.
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(!!state.isConnected)),
  );

  // Focus: the app coming back to the foreground counts as "window focus",
  // so stale queries on screen refetch.
  AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
  });
}
