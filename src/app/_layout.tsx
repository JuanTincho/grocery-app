import '@/global.css';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { startPersistence } from '@/storage/persistence';
import { ThemeProvider } from '@/theme/theme-provider';

// MMKV reads synchronously, so stored data is in the store before the first render:
// no loading state, and the splash screen stays up until React draws the real data.
startPersistence();

export default function RootLayout() {
  return (
    // Required once at the root for react-native-gesture-handler (e.g. swipe to delete).
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="scanner" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
