import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ListsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900 ">
      <Text className="dark:text-white">Shopping Lists</Text>
      <Link href="/scanner" asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scan a barcode"
          style={styles.button}
        >
          <Text className="dark:text-white">Open Scanner</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 20,
  },
});
