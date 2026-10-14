import { FlashList } from '@shopify/flash-list';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductRow } from '@/components/product-row';
import { ScreenMessage } from '@/components/screen-message';
import type { Product } from '@/core/types';
import { OffError } from '@/data/off-client';
import { MIN_SEARCH_LENGTH, useIsOnline, useProductSearch } from '@/data/use-product-search';
import { useListsStore } from '@/stores/lists-store';
import { color } from '@/theme/colors';

export default function SearchScreen() {
  const [input, setInput] = useState('');
  // Which products were added, kept here and not inside the row: FlashList reuses row
  // components for other products, so state inside a row would follow the wrong product.
  const [added, setAdded] = useState<ReadonlySet<string>>(new Set());

  const search = useProductSearch(input);
  const isOnline = useIsOnline();
  const addItem = useListsStore((s) => s.add);
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme ?? 'light';

  const addToList = (product: Product) => {
    addItem({ name: product.name });
    setAdded((current) => new Set(current).add(product.barcode));
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="gap-3 px-4 pb-3 pt-4">
        <Text accessibilityRole="header" className="text-3xl font-bold text-foreground">
          Search
        </Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Search products, e.g. oat milk"
            placeholderTextColor={color(scheme, 'muted')}
            accessibilityLabel="Search products"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing" // iOS only: the built-in clear button
            className="min-h-11 flex-1 rounded-full border border-border bg-surface px-4 text-base text-foreground"
          />
          {search.isFetching ? <ActivityIndicator color={color(scheme, 'primary')} /> : null}
        </View>
        {!isOnline ? (
          <Text accessibilityRole="alert" className="text-sm text-warning">
            You are offline. Showing saved results where available.
          </Text>
        ) : null}
      </View>

      <FlashList
        data={search.enabled ? (search.data ?? []) : []}
        keyExtractor={(product) => product.barcode}
        keyboardShouldPersistTaps="handled" // the Add buttons work while the keyboard is open
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            action={
              <AddButton
                name={item.name}
                added={added.has(item.barcode)}
                tintColor={color(scheme, 'primary-foreground')}
                onPress={() => addToList(item)}
              />
            }
          />
        )}
        ListEmptyComponent={<EmptyState input={input} search={search} isOnline={isOnline} />}
      />
    </SafeAreaView>
  );
}

type AddButtonProps = {
  name: string;
  added: boolean;
  tintColor: string;
  onPress: () => void;
};

function AddButton({ name, added, tintColor, onPress }: AddButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={added}
      accessibilityRole="button"
      accessibilityLabel={added ? `${name} added to list` : `Add ${name} to list`}
      accessibilityState={{ disabled: added }}
      className={`h-11 w-11 items-center justify-center rounded-full bg-primary active:opacity-80 ${
        added ? 'opacity-50' : ''
      }`}
    >
      <SymbolView
        name={
          added
            ? { ios: 'checkmark', android: 'check', web: 'check' }
            : { ios: 'plus', android: 'add', web: 'add' }
        }
        size={22}
        tintColor={tintColor}
      />
    </Pressable>
  );
}

type EmptyStateProps = {
  input: string;
  search: ReturnType<typeof useProductSearch>;
  isOnline: boolean;
};

// What to show when there are no rows: one of hint, typing, loading, offline, error or empty.
function EmptyState({ input, search, isOnline }: EmptyStateProps) {
  if (input.trim().length < MIN_SEARCH_LENGTH) {
    return (
      <ScreenMessage
        title="Find a product"
        detail={`Type at least ${MIN_SEARCH_LENGTH} letters to search Open Food Facts.`}
      />
    );
  }
  if (search.isWaitingForInput) return null; // still typing; the request hasn't started
  if (search.isError) {
    const rateLimited =
      search.error instanceof OffError && [429, 503].includes(search.error.status);
    return (
      <ScreenMessage
        title={rateLimited ? 'Too many searches' : 'Search failed'}
        detail={
          rateLimited
            ? 'Open Food Facts is limiting requests. Wait a moment and try again.'
            : 'Something went wrong while searching. Check your connection and try again.'
        }
        actionLabel="Try again"
        onAction={() => search.refetch()}
      />
    );
  }
  if (search.isPending) {
    // Pending with nothing fetching means the query is paused because the device is offline.
    return isOnline ? null : (
      <ScreenMessage
        title="You are offline"
        detail="This search will run when the connection is back."
      />
    );
  }
  return (
    <ScreenMessage
      title="No products found"
      detail={`Nothing matched "${input.trim()}". Try a different name.`}
    />
  );
}
