# List comparison: 1,000 products

Three screens render the same 1,000 products (`src/data/fixtures/products-1000.json`)
with the same row component (`src/components/product-row.tsx`, a 56pt image plus two
lines of text). Only the list component changes.

| Screen | File | How it renders |
| --- | --- | --- |
| A. `ScrollView` + `.map()` | `src/app/dev/list-map.tsx` | Mounts all 1,000 rows at once |
| B. FlashList v2 | `src/app/dev/list-flashlist.tsx` | Keeps a small pool of row views and reuses them |
| C. FlatList | `src/app/dev/list-flatlist.tsx` | Mounts a window of rows around the screen, unmounts the rest |

## How to measure

Measure in a release build. A development build runs slower JavaScript and extra
checks, so its numbers say little about the real app.

1. Build with the benchmark screens included:
   - iOS: `EXPO_PUBLIC_BENCHMARK=1 npx expo run:ios --configuration Release`
   - Android: `EXPO_PUBLIC_BENCHMARK=1 npx expo run:android --variant release`
2. Open the Lists tab, tap **Dev**, then open one screen at a time.
3. Before each run, force-quit and reopen the app, so one screen's cached images and
   memory don't help the next. Run each screen three times and note the middle value.

| Measurement | Where to read it |
| --- | --- |
| JS render time | The bar at the top of each screen (first render call to React's commit) |
| Time until rows are visible | Screen recording, counted from the tap; or by eye with a stopwatch |
| Memory after load, and after scrolling to the end | Xcode: Debug navigator > Memory. Android Studio: Profiler > Memory |
| JS and UI frames per second while scrolling fast | Dev menu > Perf Monitor (development build only), or the profilers above |
| Blank areas while scrolling fast | By eye: fling to the bottom and watch for empty rows |

## Results

Device and OS:

Date:

| Measurement | A. ScrollView + map | B. FlashList | C. FlatList |
| --- | --- | --- | --- |
| JS render time (ms) | | | |
| Time until rows are visible (s) | | | |
| Memory after load (MB) | | | |
| Memory after scrolling to the end (MB) | | | |
| JS FPS while scrolling fast | | | |
| UI FPS while scrolling fast | | | |
| Blank areas while scrolling fast | | | |

## Conclusions

_To write after measuring, in my own words: which screen was fastest to open, which
used the least memory, which scrolled best, and why (mount everything vs virtualize
vs recycle)._
