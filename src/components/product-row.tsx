import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import type { Product } from '@/core/types';

const IMAGE_SIZE = 56;

type Props = {
  product: Product;
  action?: ReactNode; // optional trailing control, e.g. an Add button
};

// One product: image, name, brand and pack size. Shared by the search results and the
// list benchmark, so every list renders exactly the same row.
export function ProductRow({ product, action }: Props) {
  const details = [product.brand, product.quantity].filter(Boolean).join(' · ');

  return (
    <View className="min-h-[72px] flex-row items-center gap-3 border-b border-border bg-surface px-4 py-2">
      {/* The grey box shows while the image loads, or when there is none. */}
      <View className="overflow-hidden rounded-lg bg-border">
        <Image
          source={product.imageUrl}
          // Lists that recycle rows reuse this view for another product. The key tells
          // expo-image to clear the old picture instead of showing it until the new one loads.
          recyclingKey={product.barcode}
          contentFit="cover"
          accessible={false} // decorative: the name is read from the text
          style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
        />
      </View>
      <View className="flex-1">
        <Text numberOfLines={2} className="text-base text-foreground">
          {product.name}
        </Text>
        {details ? (
          <Text numberOfLines={1} className="text-sm text-muted">
            {details}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
