import { ScrollView, View } from 'react-native';

import { BenchmarkBar, useMountTime } from '@/components/benchmark-bar';
import { ProductRow } from '@/components/product-row';
import { BENCHMARK_PRODUCTS } from '@/data/fixtures/products';

// Screen A: every row is created and mounted up front, on screen or not.
export default function ListMapScreen() {
  const mountMs = useMountTime();

  return (
    <View className="flex-1 bg-background">
      <BenchmarkBar label="ScrollView + map" count={BENCHMARK_PRODUCTS.length} mountMs={mountMs} />
      <ScrollView>
        {BENCHMARK_PRODUCTS.map((product) => (
          <ProductRow key={product.barcode} product={product} />
        ))}
      </ScrollView>
    </View>
  );
}
