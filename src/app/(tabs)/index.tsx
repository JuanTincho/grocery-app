import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ListsScreen() {
  return (
    <View style={styles.container}>
      <Text>Shopping Lists</Text>
      <Link href="/scanner" asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scan a barcode"
          style={styles.button}
        >
          <Text>Open Scanner</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 20,
  },
});
