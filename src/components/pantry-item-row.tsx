import { Pressable, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { daysUntil, expiryStatus, type ExpiryStatus } from '@/core/pantry';
import type { IsoDate, PantryItem } from '@/core/types';

type Props = {
  item: PantryItem;
  today: IsoDate;
  onRemove: (id: string) => void;
};

// Text colour per status. The label always says the status in words too,
// so it doesn't rely on colour alone.
const STATUS_CLASS: Record<ExpiryStatus, string> = {
  expired: 'text-danger',
  today: 'text-danger',
  soon: 'text-warning',
  ok: 'text-muted',
  none: 'text-muted',
};

// Swipe left to delete, like the shopping list row. The key on Swipeable matters here:
// FlashList reuses this row for other items, and without it a row left swiped open
// would show up open again on whichever item reuses it.
export function PantryItemRow({ item, today, onRemove }: Props) {
  const status = expiryStatus(item.expiresOn, today);

  return (
    <Swipeable
      key={item.id}
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
        accessible
        accessibilityActions={[{ name: 'delete', label: 'Delete' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'delete') onRemove(item.id);
        }}
        className="min-h-14 flex-row items-center gap-3 border-b border-border bg-surface px-4 py-2"
      >
        <View className="flex-1 gap-0.5">
          <Text className="text-base text-foreground">{item.name}</Text>
          <Text className={`text-sm ${STATUS_CLASS[status]}`}>
            {expiryLabel(item.expiresOn, today)}
          </Text>
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

function expiryLabel(expiresOn: IsoDate | undefined, today: IsoDate): string {
  if (!expiresOn) return 'No expiry date';
  const days = daysUntil(expiresOn, today);
  if (days < -1) return `Expired ${-days} days ago`;
  if (days === -1) return 'Expired yesterday';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `Expires in ${days} days`;
}
