import { FlashList } from '@shopify/flash-list';
import { Link, router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PantryItemRow } from '@/components/pantry-item-row';
import { ScreenMessage } from '@/components/screen-message';
import { sortByExpiry, toIsoDate } from '@/core/pantry';
import { usePantryStore } from '@/stores/pantry-store';

// Module level, so it's the same function on every render and doesn't make rows re-render.
const openItem = (id: string) => router.push({ pathname: '/pantry-item', params: { id } });

export default function PantryScreen() {
  const items = usePantryStore((s) => s.items); // same reference until the pantry changes
  const removeItem = usePantryStore((s) => s.remove);
  // Sorted here, not in the selector: a selector that returns a new array every call
  // makes Zustand re-render in a loop.
  const sorted = useMemo(() => sortByExpiry(items), [items]);
  // Read on every render. If the app stays open past midnight, this is stale until the
  // screen renders again. To do: refresh it when AppState returns to 'active'.
  const today = toIsoDate(new Date());
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <FlashList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListHeaderComponent={
          <View className="flex-row items-center justify-between gap-3 px-4 pb-2 pt-4">
            <Text accessibilityRole="header" className="text-3xl font-bold text-foreground">
              Pantry
            </Text>
            <View className="flex-row items-center gap-2">
              <Link href="/pantry-item" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add a pantry item"
                  className="min-h-11 justify-center rounded-full border border-border px-4 active:opacity-80"
                >
                  <Text className="font-semibold text-foreground">Add</Text>
                </Pressable>
              </Link>
              <Link href="/scanner" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Scan a barcode"
                  className="min-h-11 justify-center rounded-full bg-primary px-4 active:opacity-80"
                >
                  <Text className="font-semibold text-primary-foreground">Scan</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <PantryItemRow item={item} today={today} onPress={openItem} onRemove={removeItem} />
        )}
        ListEmptyComponent={
          <ScreenMessage
            title="Your pantry is empty"
            detail="Scan a product or tap Add to keep track of what you have and when it expires."
          />
        }
      />
    </SafeAreaView>
  );
}
