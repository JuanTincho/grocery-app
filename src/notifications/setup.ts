// Notification setup that has to run once at startup, before any notification arrives.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { EXPIRY_CHANNEL_ID, startExpiryReminders } from './expiry-reminders';

let started = false; // Fast Refresh can re-run the caller; set up only once

// Resolves once the Android channel exists. Android 13+ won't show the permission
// prompt until the app has at least one channel, so permission requests wait for it.
export let channelReady: Promise<unknown> = Promise.resolve();

export function startNotifications(): void {
  if (started) return;
  started = true;

  // Foreground: without a handler, a notification that arrives while the app is open
  // isn't shown at all. Sound stays on because Android hides the banner without it.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Android groups notifications into channels the user can turn off one by one in
  // Settings. Only the name and description can change after the channel is created.
  if (Platform.OS === 'android') {
    channelReady = Notifications.setNotificationChannelAsync(EXPIRY_CHANNEL_ID, {
      name: 'Expiry reminders',
      description: 'A reminder the day before a pantry item expires',
      importance: Notifications.AndroidImportance.HIGH,
    }).catch((error) => console.warn('Could not create the notification channel', error));
  }

  startExpiryReminders();
}
