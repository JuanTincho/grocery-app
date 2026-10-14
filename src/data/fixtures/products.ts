import type { Product } from '@/core/types';

import products from './products-1000.json';

// 1,000 real products fetched once by scripts/fetch-fixture.mjs, for the list benchmark.
export const BENCHMARK_PRODUCTS: Product[] = products;
