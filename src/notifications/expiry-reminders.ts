// Keeps one local notification per pantry item with an expiry date: the day before, at 9:00.
// It follows the pantry store, like persistence does, so screens never schedule anything.
import * as Notifications from 'expo-notifications';

import { reminderDate } from '@/core/pantry';
import type { PantryItem } from '@/core/types';
import { usePantryStore } from '@/stores/pantry-store';

// The Android channel these reminders are posted to (created in setup.ts).
export const EXPIRY_CHANNEL_ID = 'expiry';

// The notification's id comes from the item's id, so a reminder can be replaced or
// cancelled without storing the id the OS returned.
const reminderId = (itemId: string) => `expiry-${itemId}`;

// The link a tap opens: the same route the app uses, so one deep-link handler covers
// notifications and URLs.
export const pantryItemUrl = (itemId: string) => `/pantry-item?id=${encodeURIComponent(itemId)}`;

export function startExpiryReminders(): void {
  usePantryStore.subscribe((state, previous) => {
    if (state.items === previous.items) return;
    const before = new Map(previous.items.map((item) => [item.id, item]));
    const after = new Set(state.items.map((item) => item.id));

    // Store updates return new objects only for the items that changed.
    for (const item of state.items) {
      if (before.get(item.id) !== item) void scheduleReminder(item);
    }
    for (const id of before.keys()) {
      if (!after.has(id)) void cancelReminder(id);
    }
  });
}

// Schedules again for every item, e.g. right after permission is granted.
export async function rescheduleAllReminders(): Promise<void> {
  await Promise.all(usePantryStore.getState().items.map(scheduleReminder));
}

// Dev screen: the same reminder for `item`, in 10 seconds, to test the tap and deep link
// without waiting for a real expiry date.
export async function scheduleTestReminder(item: PantryItem): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${item.name} expires tomorrow`,
      body: 'Test reminder. Tap to open it in your pantry.',
      data: { url: pantryItemUrl(item.id) },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
      channelId: EXPIRY_CHANNEL_ID,
    },
  });
}

async function scheduleReminder(item: PantryItem): Promise<void> {
  try {
    await cancelReminder(item.id); // the date or name may have changed
    const date = reminderDate(item.expiresOn, new Date());
    if (!date) return; // no expiry date, or the reminder time has passed

    await Notifications.scheduleNotificationAsync({
      identifier: reminderId(item.id),
      content: {
        title: `${item.name} expires tomorrow`,
        body: 'Tap to open it in your pantry.',
        data: { url: pantryItemUrl(item.id) },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: EXPIRY_CHANNEL_ID,
      },
    });
  } catch (error) {
    console.warn(`Could not schedule the reminder for ${item.name}`, error);
  }
}

async function cancelReminder(itemId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(reminderId(itemId));
}
