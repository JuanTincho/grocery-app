import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// The Expo push token: the address the Expo push service sends to. It needs a real
// device, permission, and the EAS projectId from app.json. A real app would send it to
// its own server; here it's shown on the dev screen to paste into curl.
export async function getPushToken(): Promise<string> {
  if (!Device.isDevice) throw new Error('Push needs a physical device, not a simulator.');

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error('No EAS projectId in app.json. Run `eas init`.');

  // Makes a network request: fails offline.
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}
