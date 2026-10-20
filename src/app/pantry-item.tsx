import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenMessage } from '@/components/screen-message';
import { fromIsoDate, toIsoDate } from '@/core/pantry';
import type { IsoDate } from '@/core/types';
import { usePantryStore } from '@/stores/pantry-store';
import { color } from '@/theme/colors';

// One screen for both adding and editing a pantry item:
// - /pantry-item?id=…                 edit an existing item (also the notification deep link)
// - /pantry-item?name=…&barcode=…     add, prefilled by the scanner
// - /pantry-item                      add from scratch
// Route params are always strings: the scanner can pass a name, never a callback.
type Params = { id?: string; name?: string; barcode?: string };

type Form = { name: string; quantity: string; expiresOn?: IsoDate };

export default function PantryItemScreen() {
  const params = useLocalSearchParams<Params>();
  const existing = usePantryStore((s) => s.items.find((item) => item.id === params.id));
  const add = usePantryStore((s) => s.add);
  const update = usePantryStore((s) => s.update);
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme ?? 'light';

  // The values the screen opened with, to tell whether anything has changed.
  // Lazy useState: computed on the first render only, not every time the store changes.
  const [initial] = useState<Form>(() => ({
    name: existing?.name ?? params.name ?? '',
    quantity: String(existing?.quantity ?? 1),
    expiresOn: existing?.expiresOn,
  }));
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [androidPickerOpen, setAndroidPickerOpen] = useState(false);
  const quantityRef = useRef<TextInput>(null);

  const isEdit = params.id !== undefined;
  const quantity = Number.parseInt(form.quantity, 10);
  const isValid = form.name.trim().length > 0 && quantity >= 1;
  const isDirty =
    form.name !== initial.name ||
    form.quantity !== initial.quantity ||
    form.expiresOn !== initial.expiresOn;

  // Unsaved changes: block leaving the screen and ask first. This covers the Cancel button,
  // Android's back button and back gesture, and the iOS swipe-down on the modal: the native
  // stack tells iOS not to dismiss the sheet while this is true (preventNativeDismiss).
  usePreventRemove(isDirty && !saved, ({ data }) => {
    Alert.alert('Discard changes?', 'Your changes to this item will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      // Replays the navigation that was blocked (back, swipe, Cancel).
      { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  // Leave only after the render where `saved` is true: by then usePreventRemove has been
  // told to stop blocking. Calling router.back() straight after setSaved() would still be
  // blocked, because state updates don't apply until the next render.
  useEffect(() => {
    if (saved) router.back();
  }, [saved]);

  const save = () => {
    if (!isValid) return;
    const values = { name: form.name.trim(), quantity, expiresOn: form.expiresOn };
    if (existing) {
      update(existing.id, values);
    } else {
      add({ ...values, barcode: params.barcode });
    }
    setSaved(true);
  };

  const setExpiry = (date: Date) => setForm((f) => ({ ...f, expiresOn: toIsoDate(date) }));
  const today = fromIsoDate(toIsoDate(new Date())); // midnight, so today itself can be picked
  // Earliest pickable day: today, or the item's own date if it has already expired,
  // so the picker can still show it.
  const minimumDate =
    initial.expiresOn && fromIsoDate(initial.expiresOn) < today
      ? fromIsoDate(initial.expiresOn)
      : today;

  // Opened from a link or a notification for an item that has since been deleted.
  if (isEdit && !existing && !saved) {
    return (
      <>
        <Stack.Screen options={{ title: 'Item not found' }} />
        <ScreenMessage
          title="This item is no longer in your pantry"
          actionLabel="Close"
          onAction={() => router.back()}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isEdit ? 'Edit item' : 'New item',
          headerLeft: () => (
            <HeaderButton label="Cancel" onPress={() => router.back()} scheme={scheme} />
          ),
          headerRight: () => (
            <HeaderButton label="Save" onPress={save} disabled={!isValid} scheme={scheme} bold />
          ),
        }}
      />
      {/* Same approach as the Lists tab: padding works on both platforms now that
          Android draws edge to edge and no longer resizes the window for the keyboard. */}
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          className="flex-1 bg-background"
          keyboardShouldPersistTaps="handled" // the first tap on a button works with the keyboard up
          keyboardDismissMode="interactive" // iOS: drag the keyboard down with the content
          contentContainerClassName="gap-6 p-4"
        >
          <Field label="Name">
            <TextInput
              value={form.name}
              onChangeText={(name) => setForm((f) => ({ ...f, name }))}
              placeholder="e.g. Milk"
              placeholderTextColor={color(scheme, 'muted')}
              accessibilityLabel="Name"
              autoFocus={!form.name} // straight to typing for a new item, not when prefilled
              autoCapitalize="sentences"
              returnKeyType="next"
              submitBehavior="submit" // keep the keyboard up while focus moves on
              onSubmitEditing={() => quantityRef.current?.focus()}
              className="min-h-11 rounded-xl border border-border bg-surface px-4 text-base text-foreground"
            />
          </Field>

          <Field label="Quantity">
            <TextInput
              ref={quantityRef}
              value={form.quantity}
              onChangeText={(text) =>
                setForm((f) => ({ ...f, quantity: text.replace(/[^0-9]/g, '') }))
              }
              accessibilityLabel="Quantity"
              keyboardType="number-pad" // no return key on iOS; Save is in the header
              returnKeyType="done"
              onSubmitEditing={save}
              maxLength={3}
              className="min-h-11 w-24 rounded-xl border border-border bg-surface px-4 text-base text-foreground"
            />
          </Field>

          <Field label="Expiry date">
            <View className="flex-row flex-wrap items-center gap-3">
              {form.expiresOn ? (
                Platform.OS === 'ios' ? (
                  // iOS: a compact button in the form; tapping it opens a calendar popover.
                  <DateTimePicker
                    value={fromIsoDate(form.expiresOn)}
                    onValueChange={(_, date) => setExpiry(date)}
                    display="compact"
                    minimumDate={minimumDate}
                    accentColor={color(scheme, 'primary')}
                  />
                ) : (
                  // Android: no inline control; a button shows the date and opens a dialog.
                  <OutlineButton
                    label={formatDay(form.expiresOn)}
                    accessibilityLabel={`Expiry date, ${formatDay(form.expiresOn)}. Change`}
                    onPress={() => setAndroidPickerOpen(true)}
                  />
                )
              ) : (
                <OutlineButton
                  label="Add expiry date"
                  onPress={() =>
                    // iOS shows the picker as soon as there is a date; Android opens the dialog.
                    Platform.OS === 'ios' ? setExpiry(today) : setAndroidPickerOpen(true)
                  }
                />
              )}
              {form.expiresOn ? (
                <OutlineButton
                  label="No expiry"
                  accessibilityLabel="Remove expiry date"
                  onPress={() => setForm((f) => ({ ...f, expiresOn: undefined }))}
                />
              ) : null}
            </View>
          </Field>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* The Android dialog opens when mounted, and must be unmounted when it closes. */}
      {androidPickerOpen ? (
        <DateTimePicker
          value={form.expiresOn ? fromIsoDate(form.expiresOn) : today}
          presentation="dialog"
          minimumDate={minimumDate}
          onValueChange={(_, date) => {
            setAndroidPickerOpen(false);
            setExpiry(date);
          }}
          onDismiss={() => setAndroidPickerOpen(false)}
        />
      ) : null}
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-muted">{label}</Text>
      {children}
    </View>
  );
}

type OutlineButtonProps = { label: string; accessibilityLabel?: string; onPress: () => void };

function OutlineButton({ label, accessibilityLabel, onPress }: OutlineButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      className="min-h-11 justify-center rounded-full border border-border px-4 active:opacity-80"
    >
      <Text className="font-semibold text-foreground">{label}</Text>
    </Pressable>
  );
}

type HeaderButtonProps = {
  label: string;
  onPress: () => void;
  scheme: 'light' | 'dark';
  disabled?: boolean;
  bold?: boolean;
};

function HeaderButton({ label, onPress, scheme, disabled, bold }: HeaderButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      hitSlop={8}
      className={`min-h-11 justify-center px-2 ${disabled ? 'opacity-40' : ''}`}
    >
      <Text
        style={{ color: color(scheme, 'primary') }}
        className={`text-base ${bold ? 'font-semibold' : ''}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// e.g. "12 Nov 2026", in the device's language.
function formatDay(day: IsoDate): string {
  return fromIsoDate(day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
