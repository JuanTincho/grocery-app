// Response shapes from Open Food Facts, limited to the fields this app requests.
// Every product field is optional: the database is crowd-sourced and often incomplete.
export type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  quantity?: string;
  image_front_small_url?: string;
};

// GET https://search.openfoodfacts.org/search?q=...
// The search service returns `brands` as a list; the product API returns one string.
export type OffSearchHit = Omit<OffProduct, 'brands'> & {
  brands?: string[];
};

export type OffSearchResponse = {
  hits: OffSearchHit[];
  page: number;
  page_size: number;
  page_count: number;
  count: number;
};

// GET /api/v2/product/{barcode}.json
export type OffProductResponse = {
  code: string;
  status: 0 | 1; // 0 = product not found
  status_verbose?: string;
  product?: OffProduct;
};
