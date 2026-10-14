import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { queryClient, startQueryLifecycle } from '@/data/query-client';
import { startPersistence } from '@/storage/persistence';
import { ThemeProvider } from '@/theme/theme-provider';

// MMKV reads synchronously, so stored data is in the store before the first render:
// no loading state, and the splash screen stays up until React draws the real data.
startPersistence();
// Tells TanStack Query about connectivity (NetInfo) and foreground/background (AppState).
startQueryLifecycle();

export default function RootLayout() {
  return (
    // Required once at the root for react-native-gesture-handler (e.g. swipe to delete).
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="scanner" options={{ presentation: 'modal' }} />
            <Stack.Screen name="dev" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
