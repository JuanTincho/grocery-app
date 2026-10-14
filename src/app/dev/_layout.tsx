import { Redirect, Stack } from 'expo-router';

import { SHOW_DEV_TOOLS } from '@/config';

// Dev tools are not part of the shipped app: outside development (or a benchmark
// build) every route in this folder redirects home.
export default function DevLayout() {
  if (!SHOW_DEV_TOOLS) return <Redirect href="/" />;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Dev tools' }} />
      <Stack.Screen name="list-map" options={{ title: 'ScrollView + map' }} />
      <Stack.Screen name="list-flatlist" options={{ title: 'FlatList' }} />
      <Stack.Screen name="list-flashlist" options={{ title: 'FlashList' }} />
    </Stack>
  );
}
