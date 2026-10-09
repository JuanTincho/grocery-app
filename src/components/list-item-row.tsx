import { Checkbox, Host } from '@expo/ui';
import { Text, View } from 'react-native';

import type { ListItem } from '@/core/types';

type Props = {
  item: ListItem;
  onToggle: (id: string) => void;
};

export function ListItemRow({ item, onToggle }: Props) {
  return (
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
            onValueChange={() => onToggle(item.id)}
          />
        </Host>
      </View>
      {item.quantity > 1 && (
        <Text className="text-sm text-muted" accessibilityLabel={`Quantity ${item.quantity}`}>
          ×{item.quantity}
        </Text>
      )}
    </View>
  );
}
