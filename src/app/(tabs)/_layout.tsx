import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="cart" md="shopping_cart" />
        <NativeTabs.Trigger.Label>Lists</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pantry">
        <NativeTabs.Trigger.Icon sf="refrigerator" md="kitchen" />
        <NativeTabs.Trigger.Label>Pantry</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      {/* <NativeTabs.Trigger name="scanner">
        <NativeTabs.Trigger.Icon sf="barcode.viewfinder" md="barcode_scanner" />
        <NativeTabs.Trigger.Label>Scanner</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger> */}
    </NativeTabs>
  );
}
