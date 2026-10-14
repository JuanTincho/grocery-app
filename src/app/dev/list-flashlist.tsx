import { FlashList } from '@shopify/flash-list';
import { View } from 'react-native';

import { BenchmarkBar, useMountTime } from '@/components/benchmark-bar';
import { ProductRow } from '@/components/product-row';
import { BENCHMARK_PRODUCTS } from '@/data/fixtures/products';

// Screen B: keeps a small pool of row views and reuses them for new data while scrolling.
// FlashList v2 measures rows itself, so there is no estimatedItemSize.
export default function ListFlashListScreen() {
  const mountMs = useMountTime();

  return (
    <View className="flex-1 bg-background">
      <BenchmarkBar label="FlashList" count={BENCHMARK_PRODUCTS.length} mountMs={mountMs} />
      <FlashList
        data={BENCHMARK_PRODUCTS}
        keyExtractor={(product) => product.barcode}
        renderItem={({ item }) => <ProductRow product={item} />}
      />
    </View>
  );
}
