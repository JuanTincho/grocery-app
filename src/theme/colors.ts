// Colour tokens, stored as "R G B" so Tailwind can add opacity (e.g. `bg-primary/20`).
// Token names must match the `colors` in tailwind.config.js.
// Text/background pairs are chosen for at least 4.5:1 contrast (WCAG AA).
export const palette = {
  light: {
    background: '240 253 244', // green-50
    surface: '255 255 255', // white
    foreground: '5 46 22', // green-950
    muted: '77 99 87', // grey-green
    border: '209 231 216', // pale green
    primary: '21 128 61', // green-700
    'primary-foreground': '255 255 255', // white
    danger: '220 38 38', // red-600
    warning: '180 83 9', // amber-700
  },
  dark: {
    background: '4 16 10', // near-black green
    surface: '10 32 20', // dark green
    foreground: '240 253 244', // green-50
    muted: '154 184 165', // grey-green
    border: '22 56 36', // deep green
    primary: '34 197 94', // green-500
    'primary-foreground': '5 46 22', // green-950
    danger: '248 113 113', // red-400
    warning: '251 191 36', // amber-400
  },
} as const;

export type ColorScheme = keyof typeof palette;
export type ColorToken = keyof (typeof palette)['light'];

// For APIs that take a colour string instead of a className
// (navigation theme, NativeTabs, icons, ActivityIndicator).
export function color(scheme: ColorScheme, token: ColorToken): string {
  return `rgb(${palette[scheme][token]})`;
}
