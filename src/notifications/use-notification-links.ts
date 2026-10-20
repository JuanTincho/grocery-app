import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';

// Opens the screen a notification points to when the user taps it. Local reminders and
// remote pushes both carry `data.url`, so one handler serves both.
export function useNotificationLinks(): void {
  useEffect(() => {
    // Cold start: the tap launched the app, before this listener existed.
    const launch = Notifications.getLastNotificationResponse();
    if (launch) open(launch);

    // App already running, in the foreground or background.
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, []);
}

function open(response: Notifications.NotificationResponse): void {
  // Handled once: otherwise the next cold start would open the same screen again.
  Notifications.clearLastNotificationResponse();
  if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

  const url = response.notification.request.content.data?.url;
  // Only paths inside the app. A push payload comes from outside, so check it.
  if (typeof url === 'string' && url.startsWith('/')) {
    router.push(url as Href);
  }
}
