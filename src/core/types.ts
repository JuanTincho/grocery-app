// Domain types. Plain JSON-safe data: dates are ISO 8601 strings, not Date objects,
// so they survive JSON.stringify/parse when persisted.

// Also the order categories are shown in on the list screen.
export const CATEGORIES = [
  'produce',
  'bakery',
  'dairy',
  'meat',
  'pantry',
  'frozen',
  'drinks',
  'household',
  'other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ListItem = {
  id: string;
  name: string;
  quantity: number;
  category: Category;
  checked: boolean;
  updatedAt: string; // last change, so a future sync can merge by the later timestamp
};

export type ShoppingList = {
  id: string;
  name: string;
  items: ListItem[]; // array order is the display order within each category
};

// A calendar day as "YYYY-MM-DD", with no time or time zone. An expiry date is a day on
// the label, not an instant: storing midnight as a full ISO timestamp would shift it to
// the previous day for anyone west of UTC.
export type IsoDate = string;

export type PantryItem = {
  id: string;
  name: string;
  barcode?: string; // set when the item came from the scanner
  quantity: number;
  expiresOn?: IsoDate;
  updatedAt: string; // last change, so a future sync can merge by the later timestamp
};

// A product from the catalogue (search, barcode lookup, fixtures).
export type Product = {
  barcode: string;
  name: string;
  brand?: string;
  quantity?: string; // pack size as printed, e.g. "1 l"
  imageUrl?: string;
};
