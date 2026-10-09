// Shopping list logic. Every function returns a new list and never mutates its input,
// so React/Zustand can detect changes by reference. `now` is passed in (not read from
// the clock) to keep these functions pure and predictable.
import { CATEGORIES, type Category, type ListItem, type ShoppingList } from './types';

export type NewItem = {
  id: string;
  name: string;
  quantity?: number;
  category?: Category;
};

export type ItemChanges = Partial<Pick<ListItem, 'name' | 'quantity' | 'category'>>;

export type ListSection = {
  category: Category;
  data: ListItem[];
};

export function addItem(list: ShoppingList, input: NewItem, now: string): ShoppingList {
  const item: ListItem = {
    id: input.id,
    name: input.name.trim(),
    quantity: input.quantity ?? 1,
    category: input.category ?? 'other',
    checked: false,
    updatedAt: now,
  };
  return { ...list, items: [...list.items, item] };
}

export function updateItem(
  list: ShoppingList,
  id: string,
  changes: ItemChanges,
  now: string,
): ShoppingList {
  return mapItem(list, id, (item) => ({ ...item, ...changes, updatedAt: now }));
}

export function toggleChecked(list: ShoppingList, id: string, now: string): ShoppingList {
  return mapItem(list, id, (item) => ({ ...item, checked: !item.checked, updatedAt: now }));
}

export function removeItem(list: ShoppingList, id: string): ShoppingList {
  if (!list.items.some((item) => item.id === id)) return list;
  return { ...list, items: list.items.filter((item) => item.id !== id) };
}

// Moves an item to `toIndex` in the items array (clamped to the valid range).
export function moveItem(
  list: ShoppingList,
  id: string,
  toIndex: number,
  now: string,
): ShoppingList {
  const fromIndex = list.items.findIndex((item) => item.id === id);
  if (fromIndex === -1) return list;

  const items = [...list.items];
  const [moved] = items.splice(fromIndex, 1);
  const target = Math.max(0, Math.min(toIndex, items.length));
  items.splice(target, 0, { ...moved, updatedAt: now });
  return { ...list, items };
}

// Sections in CATEGORIES order, skipping empty categories. Keeps item order.
export function groupByCategory(items: ListItem[]): ListSection[] {
  return CATEGORIES.map((category) => ({
    category,
    data: items.filter((item) => item.category === category),
  })).filter((section) => section.data.length > 0);
}

// Applies `update` to one item. Returns the same list if the id isn't found,
// so nothing re-renders for a no-op.
function mapItem(
  list: ShoppingList,
  id: string,
  update: (item: ListItem) => ListItem,
): ShoppingList {
  if (!list.items.some((item) => item.id === id)) return list;
  return { ...list, items: list.items.map((item) => (item.id === id ? update(item) : item)) };
}
