import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { parseQuickAdd, type QuickAddResult } from '@/core/quick-add';
import { color } from '@/theme/colors';

type Props = {
  onAdd: (item: QuickAddResult) => void;
};

// Type a name and press return (or +) to add it. The keyboard stays open
// so several items can be added in a row.
export function QuickAddInput({ onAdd }: Props) {
  const [text, setText] = useState('');
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const parsed = parseQuickAdd(text);

  const submit = () => {
    if (!parsed) return;
    onAdd(parsed);
    setText('');
  };

  return (
    <View className="flex-row items-center gap-2 border-t border-border bg-background px-4 py-2">
      <TextInput
        value={text}
        onChangeText={setText}
        onSubmitEditing={submit}
        submitBehavior="submit" // keep the keyboard open after adding
        returnKeyType="done"
        autoCapitalize="sentences"
        placeholder='Add an item, e.g. "2 milk"'
        placeholderTextColor={color(scheme, 'muted')}
        accessibilityLabel="New item"
        accessibilityHint='Type a name, optionally with a quantity like "2 milk", then press return'
        className="min-h-11 flex-1 rounded-full border border-border bg-surface px-4 text-base text-foreground"
      />
      <Pressable
        onPress={submit}
        disabled={!parsed}
        accessibilityRole="button"
        accessibilityLabel="Add item"
        accessibilityState={{ disabled: !parsed }}
        className={`h-11 w-11 items-center justify-center rounded-full bg-primary active:opacity-80 ${
          parsed ? '' : 'opacity-40'
        }`}
      >
        <SymbolView
          name={{ ios: 'plus', android: 'add', web: 'add' }}
          size={22}
          tintColor={color(scheme, 'primary-foreground')}
        />
      </Pressable>
    </View>
  );
}
