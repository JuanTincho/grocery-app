import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { useColorScheme, vars } from 'nativewind';
import { type ReactNode } from 'react';
import { View } from 'react-native';

import { color, palette, type ColorScheme, type ColorToken } from './colors';

// CSS variables (`--color-background`, ...) for each scheme, read by tailwind.config.js.
const cssVariables = {
  light: vars(toVariables('light')),
  dark: vars(toVariables('dark')),
};

function toVariables(scheme: ColorScheme) {
  return Object.fromEntries(
    Object.entries(palette[scheme]).map(([token, value]) => [`--color-${token}`, value]),
  );
}

// React Navigation draws headers and screen backgrounds natively, outside NativeWind,
// so it gets the same tokens through its own theme.
function navigationTheme(scheme: ColorScheme) {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const token = (name: ColorToken) => color(scheme, name);
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: token('primary'),
      background: token('background'),
      card: token('surface'),
      text: token('foreground'),
      border: token('border'),
      notification: token('danger'),
    },
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme } = useColorScheme();
  const scheme: ColorScheme = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <NavigationThemeProvider value={navigationTheme(scheme)}>
      <View style={[{ flex: 1 }, cssVariables[scheme]]}>{children}</View>
    </NavigationThemeProvider>
  );
}
