import { StyleSheet, Text, View } from 'react-native';

export default function ScannerScreen() {
  return (
    <View style={styles.container}>
      <Text>Scanner</Text>
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
