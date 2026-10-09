import { Checkbox, Host } from '@expo/ui';
import { Pressable, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import type { ListItem } from '@/core/types';

type Props = {
  item: ListItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

// Swipe left to reveal a Delete button. Screen reader users can't swipe,
// so the same action is offered as an accessibility action.
export function ListItemRow({ item, onToggle, onRemove }: Props) {
  return (
    <Swipeable
      friction={2}
      rightThreshold={40}
      renderRightActions={() => (
        <Pressable
          onPress={() => onRemove(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.name}`}
          className="w-24 items-center justify-center bg-danger active:opacity-80"
        >
          <Text className="font-semibold text-white">Delete</Text>
        </Pressable>
      )}
    >
      <View
        accessibilityActions={[{ name: 'delete', label: 'Delete' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'delete') onRemove(item.id);
        }}
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
    </Swipeable>
  );
}
