import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function ListsScreen() {
  return (
    <View className="bg-background flex-1 items-center justify-center gap-4">
      <Text className="text-foreground text-lg font-semibold">Shopping Lists</Text>
      <Link href="/scanner" asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scan a barcode"
          className="bg-primary min-h-11 justify-center rounded-lg px-5 active:opacity-80"
        >
          <Text className="text-primary-foreground font-semibold">Open Scanner</Text>
        </Pressable>
      </Link>
    </View>
  );
}
