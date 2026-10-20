// Pantry logic and expiry rules. Like src/core/lists.ts, every function is pure and
// returns new data; the current time is passed in rather than read from the clock.
import type { IsoDate, PantryItem } from './types';

export type NewPantryItem = {
  id: string;
  name: string;
  quantity?: number;
  barcode?: string;
  expiresOn?: IsoDate; // left out for things that don't expire, like salt
};

export type PantryChanges = Partial<Pick<PantryItem, 'name' | 'quantity' | 'expiresOn'>>;

export type ExpiryStatus = 'expired' | 'today' | 'soon' | 'ok' | 'none'; // none: no expiry date

// Items expiring within this many days count as "soon".
export const SOON_DAYS = 3;
// Local time of day for the "expires tomorrow" reminder.
export const REMINDER_HOUR = 9;

const DAY_MS = 24 * 60 * 60 * 1000;

export function addPantryItem(
  items: PantryItem[],
  input: NewPantryItem,
  now: string,
): PantryItem[] {
  const item: PantryItem = {
    id: input.id,
    name: input.name.trim(),
    quantity: input.quantity ?? 1,
    updatedAt: now,
  };
  if (input.barcode) item.barcode = input.barcode;
  if (input.expiresOn) item.expiresOn = input.expiresOn;
  return [...items, item];
}

export function updatePantryItem(
  items: PantryItem[],
  id: string,
  changes: PantryChanges,
  now: string,
): PantryItem[] {
  if (!items.some((item) => item.id === id)) return items;
  return items.map((item) => (item.id === id ? { ...item, ...changes, updatedAt: now } : item));
}

export function removePantryItem(items: PantryItem[], id: string): PantryItem[] {
  if (!items.some((item) => item.id === id)) return items;
  return items.filter((item) => item.id !== id);
}

// Soonest expiry first, items without a date last; ties sorted by name.
// "YYYY-MM-DD" strings sort like dates.
export function sortByExpiry(items: PantryItem[]): PantryItem[] {
  return [...items].sort((a, b) => {
    if (a.expiresOn !== b.expiresOn) {
      if (!a.expiresOn) return 1;
      if (!b.expiresOn) return -1;
      return a.expiresOn.localeCompare(b.expiresOn);
    }
    return a.name.localeCompare(b.name);
  });
}

// Whole days from `today` to `expiresOn`: 0 is today, 1 tomorrow, negative already expired.
// Both days are compared as UTC midnights, so a daylight-saving change can't add or lose an hour.
export function daysUntil(expiresOn: IsoDate, today: IsoDate): number {
  return Math.round((utcMidnight(expiresOn) - utcMidnight(today)) / DAY_MS);
}

export function expiryStatus(expiresOn: IsoDate | undefined, today: IsoDate): ExpiryStatus {
  if (!expiresOn) return 'none';
  const days = daysUntil(expiresOn, today);
  if (days < 0) return 'expired';
  if (days === 0) return 'today';
  if (days <= SOON_DAYS) return 'soon';
  return 'ok';
}

// When to send the reminder: the day before expiry at REMINDER_HOUR, in the device's time zone.
// Null when there is no expiry date or that moment has already passed: nothing to schedule.
export function reminderDate(expiresOn: IsoDate | undefined, now: Date): Date | null {
  if (!expiresOn) return null;
  const [year, month, day] = parts(expiresOn);
  const reminder = new Date(year, month - 1, day - 1, REMINDER_HOUR); // day 0 rolls back a month
  return reminder.getTime() > now.getTime() ? reminder : null;
}

// The local calendar day of `date`, e.g. for "today" or a value from a date picker.
export function toIsoDate(date: Date): IsoDate {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Local midnight of `day`, e.g. as the value of a date picker.
export function fromIsoDate(day: IsoDate): Date {
  const [year, month, date] = parts(day);
  return new Date(year, month - 1, date);
}

function utcMidnight(day: IsoDate): number {
  const [year, month, date] = parts(day);
  return Date.UTC(year, month - 1, date);
}

function parts(day: IsoDate): [number, number, number] {
  const [year, month, date] = day.split('-').map(Number);
  return [year, month, date];
}
