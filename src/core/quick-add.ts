// Parses quick-add text like "2 milk", "2x milk" or "milk x2" into a name and quantity.
export type QuickAddResult = {
  name: string;
  quantity: number;
};

const LEADING_QUANTITY = /^(\d+)\s*[x×]?\s+(.+)$/i; // "2 milk", "2x milk", "2 x milk"
const TRAILING_QUANTITY = /^(.+?)\s+[x×]\s*(\d+)$/i; // "milk x2", "milk x 2", "milk ×2"

export function parseQuickAdd(text: string): QuickAddResult | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const leading = trimmed.match(LEADING_QUANTITY);
  if (leading) return result(leading[2], leading[1]);

  const trailing = trimmed.match(TRAILING_QUANTITY);
  if (trailing) return result(trailing[1], trailing[2]);

  return { name: capitalise(trimmed), quantity: 1 };
}

function result(name: string, quantity: string): QuickAddResult {
  return { name: capitalise(name.trim()), quantity: Math.max(1, Number(quantity)) };
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
