// Open Food Facts client. Free, no API key.
// - Text search uses their search service (search.openfoodfacts.org). The main API's
//   search is limited to 10 requests/min per user and isn't meant for search-as-you-type.
// - Barcode lookup uses the main API: 15 product reads/min; over the limit returns 503.
import type { Product } from '@/core/types';

import type { OffProduct, OffProductResponse, OffSearchResponse } from './off-types';

const API_URL = 'https://world.openfoodfacts.org';
const SEARCH_URL = 'https://search.openfoodfacts.org';
const FIELDS = 'code,product_name,brands,quantity,image_front_small_url';

// Their API asks for "AppName/Version (ContactEmail)". Add a contact before real use.
export const USER_AGENT = 'GroceryAppLearning/1.0 (learning project)';

export class OffError extends Error {
  constructor(public readonly status: number) {
    super(`Open Food Facts request failed with status ${status}`);
    this.name = 'OffError';
  }
}

// Full-text search. `signal` lets TanStack Query cancel a request that is no longer needed.
export async function searchProducts(term: string, signal?: AbortSignal): Promise<Product[]> {
  const params = new URLSearchParams({ q: term, page_size: '20', fields: FIELDS });
  const data = await getJson<OffSearchResponse>(`${SEARCH_URL}/search?${params}`, signal);
  return data.hits.flatMap((hit) => toProduct({ ...hit, brands: hit.brands?.[0] }));
}

// Returns null when the barcode isn't in the database.
export async function getProductByBarcode(
  barcode: string,
  signal?: AbortSignal,
): Promise<Product | null> {
  const url = `${API_URL}/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`;
  try {
    const data = await getJson<OffProductResponse>(url, signal);
    return data.status === 1 && data.product ? (toProduct(data.product)[0] ?? null) : null;
  } catch (error) {
    if (error instanceof OffError && error.status === 404) return null;
    throw error;
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    signal,
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!response.ok) throw new OffError(response.status);
  return (await response.json()) as T;
}

// Drops entries that can't be shown or added (no barcode or no name).
function toProduct(raw: OffProduct): Product[] {
  const name = raw.product_name?.trim();
  if (!raw.code || !name) return [];
  return [
    {
      barcode: raw.code,
      name,
      brand: raw.brands?.split(',')[0]?.trim() || undefined,
      quantity: raw.quantity?.trim() || undefined,
      imageUrl: raw.image_front_small_url || undefined,
    },
  ];
}
