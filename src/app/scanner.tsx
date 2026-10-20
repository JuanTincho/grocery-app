import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductRow } from '@/components/product-row';
import { ScreenMessage } from '@/components/screen-message';
import type { Product } from '@/core/types';
import { OffError } from '@/data/off-client';
import { useProductLookup } from '@/data/use-product-lookup';
import { useIsOnline } from '@/data/use-product-search';
import { useListsStore } from '@/stores/lists-store';

// The barcodes printed on grocery products. Fewer types means less work per camera frame.
const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e'] as const;

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  return (
    <>
      {permission === null ? (
        // Still reading the permission status: don't flash the "allow" message.
        <View className="flex-1 bg-background" />
      ) : permission.granted ? (
        <Scanner />
      ) : permission.canAskAgain ? (
        // Asked from a button, after saying why: iOS shows its prompt only once per install.
        <View className="flex-1 bg-background">
          <ScreenMessage
            title="Scan barcodes with your camera"
            detail="Allow camera access to look up products by their barcode."
            actionLabel="Allow camera"
            onAction={requestPermission}
          />
        </View>
      ) : (
        // Denied for good (or "Don't ask again" on Android): only the Settings app can change it.
        <View className="flex-1 bg-background">
          <ScreenMessage
            title="Camera access is off"
            detail="Turn on camera access for this app in Settings to scan barcodes."
            actionLabel="Open Settings"
            onAction={() => Linking.openSettings()}
          />
        </View>
      )}
    </>
  );
}

function Scanner() {
  const [barcode, setBarcode] = useState<string | null>(null);
  // onBarcodeScanned fires for many frames per second while a code is in view. State
  // only changes on the next render, so a ref is what stops the frames in between.
  const locked = useRef(false);
  const insets = useSafeAreaInsets();

  const onScanned = ({ data }: BarcodeScanningResult) => {
    if (locked.current) return;
    locked.current = true;
    setBarcode(data);
  };

  const scanAgain = () => {
    locked.current = false;
    setBarcode(null);
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        // No handler once a code is read, so the camera stops reporting codes.
        onBarcodeScanned={barcode ? undefined : onScanned}
      />
      {/* Overlays are siblings of the camera, not children. */}
      <View
        pointerEvents="none"
        className="absolute inset-x-10 top-1/4 h-40 rounded-2xl border-2 border-white/80"
      />
      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-surface pt-4"
      >
        {barcode ? (
          <ScanResult barcode={barcode} onScanAgain={scanAgain} />
        ) : (
          <Text className="px-4 py-2 text-center text-base text-foreground">
            Point the camera at a product barcode.
          </Text>
        )}
      </View>
    </View>
  );
}

type ScanResultProps = { barcode: string; onScanAgain: () => void };

// What a scanned barcode turned into: loading, offline, error, not found or a product.
function ScanResult({ barcode, onScanAgain }: ScanResultProps) {
  const lookup = useProductLookup(barcode);
  const isOnline = useIsOnline();
  const addToList = useListsStore((s) => s.add);

  const addProductToList = (product: Product) => {
    addToList({ name: product.name });
    router.back();
  };

  // Replace, not push: closing the form should go back to where the scan started,
  // not to the scanner. Params are plain strings, the only thing a route can carry.
  const openPantryForm = (params: { name?: string; barcode: string }) =>
    router.replace({ pathname: '/pantry-item', params });

  if (lookup.isPending) {
    // Pending without fetching means TanStack Query paused it: the device is offline.
    return lookup.fetchStatus === 'paused' || !isOnline ? (
      <Panel
        title="You are offline"
        detail={`Barcode ${barcode}. Look it up when you're back online, or add it by hand.`}
      >
        <Button label="Add to pantry by hand" onPress={() => openPantryForm({ barcode })} />
        <Button label="Scan again" onPress={onScanAgain} secondary />
      </Panel>
    ) : (
      <View className="items-center gap-2 py-4">
        <ActivityIndicator />
        <Text className="text-base text-muted">Looking up {barcode}…</Text>
      </View>
    );
  }

  if (lookup.isError) {
    const rateLimited =
      lookup.error instanceof OffError && [429, 503].includes(lookup.error.status);
    return (
      <Panel
        title={rateLimited ? 'Too many lookups' : 'Lookup failed'}
        detail={
          rateLimited
            ? 'Open Food Facts is limiting requests. Wait a minute and try again.'
            : 'Something went wrong. Check your connection and try again.'
        }
      >
        <Button label="Try again" onPress={() => lookup.refetch()} />
        <Button label="Scan again" onPress={onScanAgain} secondary />
      </Panel>
    );
  }

  const product = lookup.data;
  if (!product) {
    return (
      <Panel title="Product not found" detail={`Barcode ${barcode} isn't in Open Food Facts.`}>
        <Button label="Add to pantry by hand" onPress={() => openPantryForm({ barcode })} />
        <Button label="Scan again" onPress={onScanAgain} secondary />
      </Panel>
    );
  }

  return (
    <View className="gap-3">
      <ProductRow product={product} />
      <View className="gap-2 px-4">
        <Button label="Add to shopping list" onPress={() => addProductToList(product)} />
        <Button
          label="Add to pantry"
          onPress={() => openPantryForm({ name: product.name, barcode: product.barcode })}
        />
        <Button label="Scan again" onPress={onScanAgain} secondary />
      </View>
    </View>
  );
}

function Panel({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3 px-4">
      <View accessible accessibilityRole="alert" className="gap-1">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
        <Text className="text-base text-muted">{detail}</Text>
      </View>
      {children}
    </View>
  );
}

type ButtonProps = { label: string; onPress: () => void; secondary?: boolean };

function Button({ label, onPress, secondary }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`min-h-11 items-center justify-center rounded-full px-5 active:opacity-80 ${
        secondary ? 'border border-border' : 'bg-primary'
      }`}
    >
      <Text
        className={`font-semibold ${secondary ? 'text-foreground' : 'text-primary-foreground'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
