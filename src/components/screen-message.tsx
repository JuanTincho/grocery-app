import { Pressable, Text, View } from 'react-native';

type Props = {
  title: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
};

// Centred message for empty, error and offline states.
export function ScreenMessage({ title, detail, actionLabel, onAction }: Props) {
  return (
    <View className="items-center gap-2 px-8 py-16">
      <Text className="text-center text-lg font-semibold text-foreground">{title}</Text>
      {detail ? <Text className="text-center text-base text-muted">{detail}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          className="mt-2 min-h-11 justify-center rounded-full bg-primary px-5 active:opacity-80"
        >
          <Text className="font-semibold text-primary-foreground">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
