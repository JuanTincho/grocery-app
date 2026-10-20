import { Link, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import { scheduleTestReminder } from '@/notifications/expiry-reminders';
import { ensureNotificationPermission } from '@/notifications/permissions';
import { getPushToken } from '@/notifications/push-token';
import { usePantryStore } from '@/stores/pantry-store';

const BENCHMARKS: { href: Href; title: string; detail: string }[] = [
  {
    href: '/dev/list-map',
    title: 'ScrollView + map',
    detail: 'Mounts all 1,000 rows at once.',
  },
  {
    href: '/dev/list-flatlist',
    title: 'FlatList',
    detail: 'Virtualized: mounts rows near the screen, unmounts the rest.',
  },
  {
    href: '/dev/list-flashlist',
    title: 'FlashList',
    detail: 'Recycles row views instead of creating new ones.',
  },
];

export default function DevToolsScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-3 p-4">
      <Text accessibilityRole="header" className="text-lg font-semibold text-foreground">
        List benchmark (1,000 products)
      </Text>
      <Text className="text-sm text-muted">
        Same data and same row in each screen. Measure in a release build.
      </Text>
      {BENCHMARKS.map((benchmark) => (
        <Link key={benchmark.title} href={benchmark.href} asChild>
          <Pressable
            accessibilityRole="button"
            className="min-h-11 rounded-lg border border-border bg-surface p-4 active:opacity-80"
          >
            <Text className="text-base font-semibold text-foreground">{benchmark.title}</Text>
            <Text className="text-sm text-muted">{benchmark.detail}</Text>
          </Pressable>
        </Link>
      ))}

      <NotificationTools />
    </ScrollView>
  );
}

function NotificationTools() {
  const firstItem = usePantryStore((s) => s.items[0]);
  const [status, setStatus] = useState('');
  const [token, setToken] = useState('');

  const showToken = async () => {
    setStatus('Getting the push token…');
    try {
      if (!(await ensureNotificationPermission())) {
        setStatus('Notifications are not allowed for this app.');
        return;
      }
      const value = await getPushToken();
      setToken(value);
      setStatus('Long-press the token to copy it. It is also in the Metro log.');
      console.log('Expo push token:', value);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  };

  const testReminder = async () => {
    if (!firstItem) return;
    if (!(await ensureNotificationPermission())) {
      setStatus('Notifications are not allowed for this app.');
      return;
    }
    await scheduleTestReminder(firstItem);
    setStatus(`Reminder for ${firstItem.name} in 10 seconds. Try it with the app closed too.`);
  };

  return (
    <>
      <Text accessibilityRole="header" className="mt-4 text-lg font-semibold text-foreground">
        Notifications
      </Text>
      <DevButton
        title="Show push token"
        detail="For the Expo push tool or curl. Needs a real device."
        onPress={showToken}
      />
      <DevButton
        title="Test reminder in 10 seconds"
        detail={
          firstItem
            ? `For "${firstItem.name}". Tapping it should open that item.`
            : 'Add a pantry item first.'
        }
        onPress={testReminder}
        disabled={!firstItem}
      />
      {status ? <Text className="text-sm text-muted">{status}</Text> : null}
      {token ? (
        <Text selectable className="font-mono text-sm text-foreground">
          {token}
        </Text>
      ) : null}
    </>
  );
}

type DevButtonProps = {
  title: string;
  detail: string;
  onPress: () => void;
  disabled?: boolean;
};

function DevButton({ title, detail, onPress, disabled }: DevButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`min-h-11 rounded-lg border border-border bg-surface p-4 active:opacity-80 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <Text className="text-base font-semibold text-foreground">{title}</Text>
      <Text className="text-sm text-muted">{detail}</Text>
    </Pressable>
  );
}
