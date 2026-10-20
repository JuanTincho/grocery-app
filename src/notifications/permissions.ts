import * as Notifications from 'expo-notifications';

import { channelReady } from './setup';

// Asks only when there is a reason the user can see (they just saved an item with an
// expiry date), not at launch: iOS shows its prompt once per install, and a prompt with
// no context is the one people decline.
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false; // denied for good: only Settings can change it

  await channelReady; // Android 13+: no prompt without a channel
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}
