// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    // src/core is pure TypeScript: no React, React Native or Expo, and no app code.
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-*', 'react-native', 'react-native-*', 'expo', 'expo-*', '@expo/*'],
              message: 'src/core must stay framework-agnostic.',
            },
            {
              regex: '^@/(?!core/)',
              message: 'src/core must not import from the rest of the app.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/*', 'android/*', 'ios/*'],
  },
]);
