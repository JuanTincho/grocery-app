import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { queryClient, startQueryLifecycle } from '@/data/query-client';
import { startNotifications } from '@/notifications/setup';
import { useNotificationLinks } from '@/notifications/use-notification-links';
import { startPersistence } from '@/storage/persistence';
import { ThemeProvider } from '@/theme/theme-provider';

// MMKV reads synchronously, so stored data is in the store before the first render:
// no loading state, and the splash screen stays up until React draws the real data.
startPersistence();
// Tells TanStack Query about connectivity (NetInfo) and foreground/background (AppState).
startQueryLifecycle();
// Foreground handler, Android channel, and expiry reminders that follow the pantry store.
startNotifications();

// The screen under a modal opened straight from a link or a notification tap (cold start):
// without it, closing the pantry item would leave nothing to go back to.
export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  useNotificationLinks(); // a tap on a notification opens the screen in its data.url

  return (
    // Required once at the root for react-native-gesture-handler (e.g. swipe to delete).
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* Titles are set here, once. Screens don't call setOptions while open: an
                options update during a modal's close crashed react-native-screens on Android. */}
            <Stack.Screen
              name="scanner"
              options={{ presentation: 'modal', title: 'Scan a barcode' }}
            />
            <Stack.Screen
              name="pantry-item"
              options={({ route }) => ({
                presentation: 'modal',
                title: (route.params as { id?: string } | undefined)?.id ? 'Edit item' : 'New item',
              })}
            />
            <Stack.Screen name="dev" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
