import { skipToken, useQuery } from '@tanstack/react-query';

import { getProductByBarcode } from './off-client';

// Server state for one barcode, cached by TanStack Query. Scanning the same product again
// (or another device scanning it) is answered from the cache: a barcode's product details
// almost never change, and the lookup API allows only 15 requests a minute.
export function useProductLookup(barcode: string | null) {
  return useQuery({
    queryKey: ['products', 'barcode', barcode],
    // skipToken: no request until there is a barcode, and no `barcode!` needed.
    queryFn: barcode ? ({ signal }) => getProductByBarcode(barcode, signal) : skipToken,
    staleTime: Infinity,
  });
}
