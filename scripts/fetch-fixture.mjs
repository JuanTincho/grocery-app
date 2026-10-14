// Fetches 1,000 products (with a name and an image) from Open Food Facts and saves them
// as src/data/fixtures/products-1000.json, so the list benchmark uses stable data and
// never hits the network or the rate limit.
//
// Run once: node scripts/fetch-fixture.mjs
import { writeFile } from 'node:fs/promises';

const TARGET = 1000;
const PAGE_SIZE = 100;
const MAX_PAGES = 30;
const DELAY_MS = 5000; // be polite: one request every 5 seconds
const USER_AGENT = 'GroceryAppLearning/1.0 (learning project; fixture script)';
const OUTPUT = new URL('../src/data/fixtures/products-1000.json', import.meta.url);

const products = new Map(); // barcode -> product, to drop duplicates

// A 503 means the server is busy or rate-limiting: wait and retry.
async function fetchPage(url, page) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (response.ok) return response.json();
    console.log(`page ${page}: status ${response.status}, attempt ${attempt}/4`);
    await new Promise((resolve) => setTimeout(resolve, 20000 * attempt));
  }
  throw new Error(`Page ${page} failed after 4 attempts`);
}

for (let page = 1; page <= MAX_PAGES && products.size < TARGET; page++) {
  // Open Food Facts' search service (Search-a-licious). The main API's search endpoints
  // are limited to 10 requests/min and block quickly; this service is built for search.
  const params = new URLSearchParams({
    q: 'states_tags:"en:front-photo-selected"', // only products that have a front photo
    sort_by: '-unique_scans_n', // most scanned first: these have the best data
    page: String(page),
    page_size: String(PAGE_SIZE),
    fields: 'code,product_name,brands,image_front_small_url',
  });
  const data = await fetchPage(`https://search.openfoodfacts.org/search?${params}`, page);
  for (const raw of data.hits ?? []) {
    const name = raw.product_name?.trim();
    if (!raw.code || !name || !raw.image_front_small_url) continue;
    if (products.size >= TARGET) break;
    products.set(raw.code, {
      barcode: raw.code,
      name,
      brand: [raw.brands].flat()[0]?.split(',')[0]?.trim() || undefined, // array or string
      imageUrl: raw.image_front_small_url,
    });
  }
  console.log(`page ${page}: ${products.size}/${TARGET}`);

  if (products.size < TARGET) await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
}

if (products.size < TARGET) throw new Error(`Only found ${products.size} products`);

await writeFile(OUTPUT, JSON.stringify([...products.values()], null, 1) + '\n');
console.log(`Saved ${products.size} products to ${OUTPUT.pathname}`);
