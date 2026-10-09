import { Checkbox, Host } from '@expo/ui';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { groupByCategory } from '@/core/lists';
import { useListsStore } from '@/stores/lists-store';
import { color } from '@/theme/colors';

const FAB_SIZE = 56; // h-14 / w-14
const FAB_OFFSET = 16; // gap between the button and the bottom safe area

export default function ListsScreen() {
  const items = useListsStore((s) => s.list.items); // re-renders only when items changes
  const toggleItem = useListsStore((s) => s.toggle);

  const sections = useMemo(() => groupByCategory(items), [items]);
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    // This tab has no header, so keep content below the status bar / notch.
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <SectionList
        sections={sections}
        keyExtractor={({ id }) => id}
        stickySectionHeadersEnabled // default is true on iOS, false on Android
        contentInsetAdjustmentBehavior="automatic" // iOS: keep the last rows clear of the tab bar
        contentContainerStyle={{ paddingBottom: FAB_SIZE + FAB_OFFSET * 2 }} // last row scrolls clear of the button
        ListHeaderComponent={
          <View className="flex-row items-center justify-between gap-3 px-4 pb-2 pt-4">
            <Text accessibilityRole="header" className="text-3xl font-bold text-foreground">
              Shopping list
            </Text>
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
        }
        renderSectionHeader={({ section: { category } }) => (
          <Text
            accessibilityRole="header"
            className="bg-background px-4 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted"
          >
            {category}
          </Text>
        )}
        renderItem={({ item }) => (
          <View
            className={`min-h-12 flex-row items-center gap-3 border-b border-border bg-surface px-4 py-2 ${
              item.checked ? 'opacity-50' : ''
            }`}
          >
            <View className="flex-1">
              <Host matchContents>
                <Checkbox
                  label={item.name}
                  value={item.checked}
                  onValueChange={() => toggleItem(item.id)}
                />
              </Host>
            </View>
            {item.quantity > 1 && (
              <Text className="text-sm text-muted" accessibilityLabel={`Quantity ${item.quantity}`}>
                ×{item.quantity}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center px-8 py-16">
            <Text className="text-center text-base text-muted">
              No items yet. Scan a barcode or search for a product to add one.
            </Text>
          </View>
        }
      />
      {/* Floating add button. Drawn after the list so it sits on top.
          `bottom` is a style, not a class: classes are compiled at build time,
          and the inset is only known at runtime. */}
      <Link asChild href="/add-item">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add item"
          style={{ bottom: insets.bottom + FAB_OFFSET }}
          className="absolute right-4 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-80"
        >
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={28}
            tintColor={color(colorScheme ?? 'light', 'primary-foreground')}
          />
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}
