import { Link } from 'expo-router';
import { useMemo } from 'react';
import { KeyboardAvoidingView, Pressable, SectionList, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListItemRow } from '@/components/list-item-row';
import { QuickAddInput } from '@/components/quick-add-input';
import { SHOW_DEV_TOOLS } from '@/config';
import { groupByCategory } from '@/core/lists';
import { useListsStore } from '@/stores/lists-store';

export default function ListsScreen() {
  const items = useListsStore((s) => s.list.items); // re-renders only when items changes
  const toggleItem = useListsStore((s) => s.toggle);
  const addItem = useListsStore((s) => s.add);
  const removeItem = useListsStore((s) => s.remove);

  const sections = useMemo(() => groupByCategory(items), [items]);
  const insets = useSafeAreaInsets();

  return (
    // This tab has no header, so keep content below the status bar / notch.
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior="padding" // NEEDED! on Android, regarding what docs say
        style={{ flex: 1 }}
        keyboardVerticalOffset={-insets.bottom}
      >
        <SectionList
          sections={sections}
          keyExtractor={({ id }) => id}
          // keyboardShouldPersistTaps="handled" // Not needed
          stickySectionHeadersEnabled // default is true on iOS, false on Android
          contentContainerStyle={{ paddingBottom: 16 }}
          ListHeaderComponent={
            <View className="flex-row items-center justify-between gap-3 px-4 pb-2 pt-4">
              <Text accessibilityRole="header" className="text-3xl font-bold text-foreground">
                Shopping list
              </Text>
              <View className="flex-row items-center gap-2">
                {SHOW_DEV_TOOLS ? (
                  <Link href="/dev" asChild>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Open dev tools"
                      className="min-h-11 justify-center rounded-full border border-border px-4 active:opacity-80"
                    >
                      <Text className="font-semibold text-foreground">Dev</Text>
                    </Pressable>
                  </Link>
                ) : null}
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
          renderSectionHeader={({ section: { category } }) => (
            <Text
              accessibilityRole="header"
              className="bg-background px-4 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted"
            >
              {category}
            </Text>
          )}
          renderItem={({ item }) => (
            <ListItemRow item={item} onToggle={toggleItem} onRemove={removeItem} />
          )}
          ListEmptyComponent={
            <View className="items-center px-8 py-16">
              <Text className="text-center text-base text-muted">
                No items yet. Type below to add your first one.
              </Text>
            </View>
          }
        />
        {/* Bottom inset as a style: it's only known at runtime. */}
        <View style={{ paddingBottom: insets.bottom }} className="bg-background">
          <QuickAddInput onAdd={addItem} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
