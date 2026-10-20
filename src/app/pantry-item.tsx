import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useColorScheme } from 'nativewind';
import { useRef, useState, type ReactNode } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenMessage } from '@/components/screen-message';
import { fromIsoDate, toIsoDate } from '@/core/pantry';
import type { IsoDate } from '@/core/types';
import { rescheduleAllReminders } from '@/notifications/expiry-reminders';
import { ensureNotificationPermission } from '@/notifications/permissions';
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
  const insets = useSafeAreaInsets();

  // The values the screen opened with, to tell whether anything has changed.
  // Lazy useState: computed on the first render only, not every time the store changes.
  const [initial] = useState<Form>(() => ({
    name: existing?.name ?? params.name ?? '',
    quantity: String(existing?.quantity ?? 1),
    expiresOn: existing?.expiresOn,
  }));
  const [form, setForm] = useState(initial);
  const [androidPickerOpen, setAndroidPickerOpen] = useState(false);
  const quantityRef = useRef<TextInput>(null);

  const isEdit = params.id !== undefined;
  const quantity = Number.parseInt(form.quantity, 10);
  const isValid = form.name.trim().length > 0 && quantity >= 1;
  const isDirty =
    form.name !== initial.name ||
    form.quantity !== initial.quantity ||
    form.expiresOn !== initial.expiresOn;

  // Set by Save just before leaving, so the block below lets that one exit through.
  const leavingAfterSave = useRef(false);

  // Unsaved changes: block leaving the screen and ask first. This covers the Cancel button,
  // Android's back button and back gesture, and the iOS swipe-down on the modal: the native
  // stack tells iOS not to dismiss the sheet while this is true (preventNativeDismiss).
  usePreventRemove(isDirty, ({ data }) => {
    // Replaying data.action leaves without asking again: it carries a mark that this screen
    // already approved it. Save goes out the same way as Discard, with prevention still on.
    // Turning prevention off first would change the native header's props in the same frame
    // the screen is removed, which crashes react-native-screens on Android.
    if (leavingAfterSave.current) {
      navigation.dispatch(data.action);
      return;
    }
    Alert.alert('Discard changes?', 'Your changes to this item will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  const save = () => {
    if (!isValid) return;
    const values = { name: form.name.trim(), quantity, expiresOn: form.expiresOn };
    if (existing) {
      update(existing.id, values);
    } else {
      add({ ...values, barcode: params.barcode });
    }
    // The first item with a date is when a reminder makes sense, so ask then. Reminders
    // scheduled before the answer are scheduled again once permission is granted.
    if (values.expiresOn) {
      void ensureNotificationPermission().then((granted) => {
        if (granted) void rescheduleAllReminders();
      });
    }
    // A ref, not state: it must be true right now, when the block above runs, not after
    // the next render.
    leavingAfterSave.current = true;
    router.back();
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
  if (isEdit && !existing) {
    return (
      <ScreenMessage
        title="This item is no longer in your pantry"
        actionLabel="Close"
        onAction={() => router.back()}
      />
    );
  }

  return (
    <>
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
              keyboardType="number-pad" // no return key on iOS; Save is in the bar below
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

        {/* Cancel and Save live in the screen, not the native header: changing header
            options while the screen closes (as Save does) crashes react-native-screens on
            Android. Inside the KeyboardAvoidingView, so the bar rises with the keyboard. */}
        <View
          style={{ paddingBottom: insets.bottom + 8 }}
          className="flex-row gap-3 border-t border-border bg-background px-4 pt-3"
        >
          <View className="flex-1">
            <OutlineButton label="Cancel" onPress={() => router.back()} />
          </View>
          <Pressable
            onPress={save}
            disabled={!isValid}
            accessibilityRole="button"
            accessibilityState={{ disabled: !isValid }}
            className={`min-h-11 flex-1 items-center justify-center rounded-full bg-primary active:opacity-80 ${
              isValid ? '' : 'opacity-40'
            }`}
          >
            <Text className="font-semibold text-primary-foreground">Save</Text>
          </Pressable>
        </View>
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
      className="min-h-11 items-center justify-center rounded-full border border-border px-4 active:opacity-80"
    >
      <Text className="font-semibold text-foreground">{label}</Text>
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
