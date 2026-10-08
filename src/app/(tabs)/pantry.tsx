import { StyleSheet, Text, View } from 'react-native';

export default function PantryScreen() {
  return (
    <View style={styles.container}>
      <Text>Pantry</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
