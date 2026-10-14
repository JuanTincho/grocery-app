import { FlatList, View } from 'react-native';

import { BenchmarkBar, useMountTime } from '@/components/benchmark-bar';
import { ProductRow } from '@/components/product-row';
import { BENCHMARK_PRODUCTS } from '@/data/fixtures/products';

// Screen C (optional): mounts a window of rows around the screen and unmounts the rest.
export default function ListFlatListScreen() {
  const mountMs = useMountTime();

  return (
    <View className="flex-1 bg-background">
      <BenchmarkBar label="FlatList" count={BENCHMARK_PRODUCTS.length} mountMs={mountMs} />
      <FlatList
        data={BENCHMARK_PRODUCTS}
        keyExtractor={(product) => product.barcode}
        renderItem={({ item }) => <ProductRow product={item} />}
      />
    </View>
  );
}
