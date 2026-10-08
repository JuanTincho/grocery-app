// Each colour reads a CSS variable set by src/theme/theme-provider.tsx,
// so `bg-background` switches with light/dark without a `dark:` variant.
// Token names must match src/theme/colors.ts.
const tokens = [
  'background',
  'surface',
  'foreground',
  'muted',
  'border',
  'primary',
  'primary-foreground',
  'danger',
  'warning',
];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: Object.fromEntries(
        tokens.map((token) => [token, `rgb(var(--color-${token}) / <alpha-value>)`]),
      ),
    },
  },
  plugins: [],
};
