import '@/global.css';

import { Stack } from 'expo-router';

import { ThemeProvider } from '@/theme/theme-provider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="scanner" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-item" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
