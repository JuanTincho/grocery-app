# Grocery app — CLAUDE.md

## Project description

An offline-first grocery app in React Native (Expo): shopping lists, a pantry
with expiry dates, product search and barcode scanning. It's a 7-day
upskilling project to prepare for a React Native interview, so the goal is
to learn and be able to explain decisions, not only to ship features.

The focus is React Native and Expo behaviour that differs from the web:
platform differences (Android back, iOS swipe-back, keyboard, pickers),
native modules and CNG/prebuild, gestures instead of hover, app lifecycle,
offline-first, permissions, push and deep links, performance, and OTA
updates vs store builds. Tests and schema migrations are not a focus.

- Generic branding only: no real retailer names, logos or colours.
- It's a learning project. Explain the trade-offs when introducing a library or
  pattern. Keep changes small enough to review and understand. When something
  has a common interview question behind it (for example, FlatList vs
  FlashList, or server state vs client state), say so in a sentence.

---

## What I already know

Before this project I did the Expo tutorial app
(https://docs.expo.dev/tutorial/introduction/), with a third tab and a
component ported from web on top of it. Don't re-explain these basics. Reuse
the same patterns and go deeper instead of starting over.

- Expo Router: tabs, a modal route, per-tab headers and icons.
- Image picker, gestures, taking a screenshot, platform differences, status
  bar, splash screen and app icon.
- Porting a web component to RN (`div` → `View`, CSS → styles, `onClick` →
  `Pressable`, no cascade, no hover). Component: _fill in_

Go deeper here on modals that carry data back to the screen that opened
them (the scanner modal).

---

## Upskilling tasks done in this app

Two tasks from my upskilling lead are done here instead of in the tutorial
app. Both are on my "by hand" list below.

### List performance: 1,000 images, `.map()` vs FlashList (Day 4)

- [ ] A fixture of 1,000 products (name, brand, image URL), fetched once from
      Open Food Facts by a script and saved as JSON, so the comparison is
      stable and doesn't hit the rate limit.
- [ ] Screen A: the 1,000 products rendered with `array.map()` inside a
      `ScrollView`.
- [ ] Screen B: the same data and the same item component, with FlashList.
- [ ] Both screens sit behind a "Benchmark" entry in a dev-only settings
      screen, not in the main tabs.
- [ ] Compare in a release build, because dev mode slows everything down:
      time to first render, memory (Xcode Instruments / Android Studio
      profiler), JS and UI FPS while scrolling fast (Perf Monitor), and blank
      areas while scrolling.
- [ ] Write the numbers and conclusions in `docs/list-comparison.md`:
      `ScrollView` + `map` mounts all 1,000 items at once, FlatList
      virtualizes, and FlashList recycles item views. Optional: add FlatList
      as a third column.
- Keep the comparison fair: same item component, same image size, same data.
  FlashList v2 (New Architecture) no longer needs `estimatedItemSize`; check
  its current docs.

### Push notifications (Day 5)

- [ ] expo-notifications: request permission, get the Expo push token, set a
      foreground handler, and handle a tap that deep-links to a pantry item
      (e.g. "Milk expires tomorrow" opens that item).
- [ ] Send test pushes from the Expo push tool (https://expo.dev/notifications)
      or with `curl` to the Expo push API. A real backend isn't needed.
- [ ] Local notifications for pantry expiry share the same handler and
      deep-link code.
- Remote push needs a physical device and a development build (not Expo Go).
  Android needs FCM credentials uploaded to EAS. iOS needs a paid Apple
  Developer account for APNs; without one, do Android only and say so.

---

## How to use AI in this project

I want to learn this, not only finish it. Behave differently depending on the
area.

### I write it by hand

Give hints, point me to docs, review and explain, but don't write the
implementation unless I say "write it".

- The architecture and folder decisions, and the storage interface.
- The load-at-startup pattern and app lifecycle (`AppState`).
- Zustand stores and TanStack Query hooks (server state vs client state),
  including wiring TanStack Query to NetInfo and `AppState`.
- The add-item form: keyboard handling and the date picker.
- Gestures (swipe to delete, drag to reorder) and Android back / iOS
  swipe-back handling.
- The `.map()` and FlashList screens and the performance measurements.
- The push notification code: permission, token, handlers and deep links.
  (Credentials and EAS config can be AI.)
- Debugging native build, permission and runtime errors. I read the error
  first. Explain the cause before suggesting a fix.
- The accessibility pass with a real screen reader.
- The README's "decisions and trade-offs" and my interview answers, in my own
  words. You can review them for accuracy.

### AI does it

Write these freely:

- Setup and config boilerplate: NativeWind, ESLint/Prettier, EAS profiles,
  `app.json` plugins.
- TypeScript types for Open Food Facts responses, mock data and fixtures,
  including the script that fetches the 1,000-product fixture.
- Tests, if I ask for them (optional, not a focus of this project).
- Repetitive UI (empty, loading, error and offline states) once I've built the
  pattern once.
- Code review of what I wrote, explanations of concepts, and comparisons of
  two approaches.
- Quizzing me with interview questions about the code I wrote.

### Habits to keep (rules for both of us)

- I write first, then ask for a review, rather than generating code and
  reading it.
- When something fails, explain why before fixing it.
- I don't commit code I can't explain line by line. If you wrote it, walk me
  through it when I ask.
- Check Expo and library APIs against current docs; don't rely on memory.
- Keep changes small and reviewable.

---

## Stack

- Expo (latest SDK, New Architecture on) + TypeScript (strict).
- Routing: Expo Router (file-based, under `src/app/`).
- Styling: NativeWind (Tailwind for RN). Light and dark themes are both
  supported and follow the system setting.
- Client state: Zustand. Server state: TanStack Query. Don't keep the same
  data in both.
- Storage: react-native-mmkv. Because it's a native module, it needs a
  development build (`npx expo run:ios|android` or EAS), not Expo Go.
- Lists: @shopify/flash-list.
- Camera/scanning: expo-camera. Notifications: expo-notifications (remote
  push plus local pantry-expiry notifications).
- Gestures and animation: react-native-gesture-handler + Reanimated.
- Date picker: chosen on Day 2 after checking the current docs.
- Network status: @react-native-community/netinfo.
- Tests (optional): Jest for `src/core`. End-to-end (optional): Maestro.
- Builds: EAS Build. Optional: EAS Update.

## Data source

Open Food Facts (https://world.openfoodfacts.org), free with no API key. The
data is ODbL.

- Product by barcode: `GET /api/v2/product/{barcode}.json`
- Search: `GET /cgi/search.pl?search_terms=...&json=1&page_size=20`
- Send a custom `User-Agent` (app name + contact), as their API docs ask.
- Search has a low rate limit. Debounce input and rely on TanStack Query's
  cache. Check the current limits in their docs.

---

## Architecture

```
src/app/                 Expo Router routes (tabs: lists, pantry, search; modal: scanner)
src/core/            Pure TypeScript: domain types, list/pantry logic, totals,
                     expiry rules, storage interface.
                     No React, no React Native, no Expo imports.
src/data/            Open Food Facts client + TanStack Query hooks
src/storage/         MMKV implementation of the core storage interface
src/stores/          Zustand stores
src/components/      UI components
e2e/                 Maestro flows (optional)
```

- `src/core` must stay framework-agnostic, to keep domain logic separate
  from UI and reusable by another client.
- Storage goes through an interface defined in `src/core`
  (`load`/`save`, or per-item `saveItem`). The MMKV implementation lives in
  `src/storage`.
- Persisted data is plain JSON with a `version` field and ISO dates. Never
  drop data on an unknown version.
- The app loads stored data once at startup and shows a "not ready" state
  until then. After that, it keeps the data in memory and writes changes
  through to storage.
- Each list item and pantry item has an `updatedAt` so a future sync can
  merge by the later timestamp.

## Features

1. Shopping lists: add, edit, check off and reorder items, grouped by
   category. Fully usable offline.
2. Product search (Open Food Facts) with add-to-list.
3. Barcode scanner modal: scan → product lookup → add to a list or the pantry.
4. Pantry with expiry dates, plus a local notification the day before expiry.
5. Basket summary: item count and a nutrition summary, both computed in
   `src/core`.
6. Stretch: sync one list between two devices (e.g. Supabase), merging per
   item by `updatedAt`.

## Quality bar

- Accessibility: every touchable has an `accessibilityLabel` and role,
  touch targets are at least 44pt, it works with VoiceOver/TalkBack, and the
  layout survives the largest font size.
- Performance: FlashList for long lists, stable callbacks/keys, no
  unnecessary re-renders. Profile with React DevTools at least once.
- Every screen handles errors and offline: loading, empty, error and
  offline states.

---

## 7-day plan

- [ ] **Day 1, setup:** create-expo-app (TS), `expo-dev-client` and a first
      development build on a simulator/device (no Expo Go in this project;
      `ios/` and `android/` are generated, so keep them out of git), tabs +
      scanner modal (known
      from the tutorial, so keep it quick), NativeWind, light/dark,
      ESLint + Prettier, the folder layout above.
- [ ] **Day 2, lists done the mobile way:** types and logic in `src/core`;
      list CRUD with a Zustand store, grouped by category; an add-item form
      with keyboard handling and a date picker (iOS vs Android); swipe to
      delete and drag to reorder (gestures instead of hover); Android back /
      iOS swipe-back on a form with unsaved changes.
- [ ] **Day 3, storage, native modules and CNG:** MMKV (a native module, so
      no Expo Go) behind the storage interface; what prebuild generates and
      what a config plugin does; sync JSI vs async bridge storage; load at
      startup behind the splash screen; save on background with `AppState`.
- [ ] **Day 4, network, offline and performance:** Open Food Facts client,
      TanStack Query (debounce, cache, retries) wired to NetInfo and
      `AppState`, offline states, add to list. Upskilling task: the
      1,000-image `.map()` vs FlashList comparison, then use FlashList for
      the results.
- [ ] **Day 5, scanner, pantry and push:** expo-camera barcode scanning with
      the camera permission flow, pantry with expiry dates. Upskilling task:
      push notifications, plus local expiry notifications, with a tap that
      opens the pantry item.
- [ ] **Day 6, Android device pass and accessibility:** on a real Android
      phone, check the back button, keyboard, notch/safe areas and
      manufacturer quirks; accessibility pass with the screen reader and large
      fonts. Optional: one Maestro flow (scan → add → check off).
- [ ] **Day 7, ship and explain:** EAS build on a real device, an OTA update
      with EAS Update (and what it can't change vs a store build), README with
      architecture and "decisions and trade-offs", and a list of likely
      interview questions with my answers. Stretch: sync.

---

## Commands

- `npx expo start`: dev server
- `npx expo run:ios` / `npx expo run:android`: development build (needed for MMKV)
- `npx tsc --noEmit`: typecheck
- `npx expo lint`: lint
- `npx jest`: unit tests (optional)
- `maestro test e2e/`: end-to-end (optional)
- `eas build --profile development`: device build

## Conventions

- Tests, if any, sit next to the code as `*.test.ts(x)`.
- Small commits with clear messages. Don't commit or push unless asked.
- Before calling a task done: run typecheck and lint (plus tests, if any
  exist), and report the results honestly.
- Check the current Expo docs (https://docs.expo.dev) before using an API.
  Expo SDKs change quickly, so don't rely on memory.
