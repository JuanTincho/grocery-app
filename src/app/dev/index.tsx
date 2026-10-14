import { Link, type Href } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';

const BENCHMARKS: { href: Href; title: string; detail: string }[] = [
  {
    href: '/dev/list-map',
    title: 'ScrollView + map',
    detail: 'Mounts all 1,000 rows at once.',
  },
  {
    href: '/dev/list-flatlist',
    title: 'FlatList',
    detail: 'Virtualized: mounts rows near the screen, unmounts the rest.',
  },
  {
    href: '/dev/list-flashlist',
    title: 'FlashList',
    detail: 'Recycles row views instead of creating new ones.',
  },
];

export default function DevToolsScreen() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-3 p-4">
      <Text accessibilityRole="header" className="text-lg font-semibold text-foreground">
        List benchmark (1,000 products)
      </Text>
      <Text className="text-sm text-muted">
        Same data and same row in each screen. Measure in a release build.
      </Text>
      {BENCHMARKS.map((benchmark) => (
        <Link key={benchmark.title} href={benchmark.href} asChild>
          <Pressable
            accessibilityRole="button"
            className="min-h-11 rounded-lg border border-border bg-surface p-4 active:opacity-80"
          >
            <Text className="text-base font-semibold text-foreground">{benchmark.title}</Text>
            <Text className="text-sm text-muted">{benchmark.detail}</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}
