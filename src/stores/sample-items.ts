// Sample items so the list has something to show in development, until
// persistence (Day 3) loads real data. Fixed ids keep React keys stable.
import type { ListItem } from '@/core/types';

const updatedAt = '2026-10-09T09:00:00.000Z';

const item = (
  id: string,
  name: string,
  category: ListItem['category'],
  quantity = 1,
  checked = false,
): ListItem => ({ id, name, category, quantity, checked, updatedAt });

export const SAMPLE_ITEMS: ListItem[] = [
  item('sample-1', 'Bananas', 'produce', 6),
  item('sample-2', 'Spinach', 'produce'),
  item('sample-3', 'Cherry tomatoes', 'produce', 2, true),
  item('sample-4', 'Sourdough loaf', 'bakery'),
  item('sample-5', 'Milk', 'dairy', 2),
  item('sample-6', 'Greek yoghurt', 'dairy'),
  item('sample-7', 'Cheddar', 'dairy', 1, true),
  item('sample-8', 'Chicken thighs', 'meat'),
  item('sample-9', 'Pasta', 'pantry', 2),
  item('sample-10', 'Olive oil', 'pantry'),
  item('sample-11', 'Frozen peas', 'frozen'),
  item('sample-12', 'Sparkling water', 'drinks', 6),
  item('sample-13', 'Washing-up liquid', 'household'),
];
