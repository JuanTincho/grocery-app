import { useLayoutEffect, useState } from 'react';
import { Text, View } from 'react-native';

// Time from this component's first render call to React committing the screen: the
// JavaScript cost of rendering the list. It does not include native drawing or image
// loading; measure those with the profilers (see docs/list-comparison.md).
export function useMountTime(): number | null {
  const [start] = useState(() => performance.now());
  const [elapsed, setElapsed] = useState<number | null>(null);

  useLayoutEffect(() => {
    // Measuring after the commit is the point here, so setting state in the effect is intended.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setElapsed(Math.round(performance.now() - start));
  }, [start]);

  return elapsed;
}

type Props = {
  label: string;
  count: number;
  mountMs: number | null;
};

export function BenchmarkBar({ label, count, mountMs }: Props) {
  return (
    <View className="border-b border-border bg-background px-4 py-2">
      <Text className="text-sm font-semibold text-foreground">{label}</Text>
      <Text className="text-sm text-muted">
        {count} items · JS render: {mountMs === null ? '…' : `${mountMs} ms`}
      </Text>
    </View>
  );
}
