// MMKV implementation of the core storage interface. MMKV is a native module that
// reads and writes synchronously through JSI, so there is no async/await here.
import { createMMKV } from 'react-native-mmkv';

import { parsePersisted, type AppStorage } from '@/core/storage';

const mmkv = createMMKV({ id: 'grocery-app' });
const STATE_KEY = 'state';

export const mmkvStorage: AppStorage = {
  load: () => parsePersisted(mmkv.getString(STATE_KEY)),
  save: (state) => mmkv.set(STATE_KEY, JSON.stringify(state)),
};
