// Dev tools (the list benchmark) show in development builds. A release build hides them
// unless it is built with EXPO_PUBLIC_BENCHMARK=1, which the benchmark needs: performance
// must be measured in a release build, where __DEV__ is false.
export const SHOW_DEV_TOOLS = __DEV__ || process.env.EXPO_PUBLIC_BENCHMARK === '1';
