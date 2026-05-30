import { NextRequest } from "next/server";
import { fetchAndCacheRates, getExchangeRate } from "@/lib/utils/currency";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/utils/api";
import { getSearchParams, parseOptionalString } from "@/lib/api/helpers";
import { withRateLimit } from "@/lib/api/withRateLimit";

// GET /api/currency?from=USD&to=IDR
async function getHandler(req: NextRequest) {
  try {
    const params = getSearchParams(req);
    const from = parseOptionalString(params, "from") ?? "IDR";
    const to = parseOptionalString(params, "to");
    const refresh = params.get("refresh") === "true";

    // Refresh rates if requested
    if (refresh) {
      const rates = await fetchAndCacheRates(from);
      if (!rates) return errorResponse("Gagal mengambil kurs terbaru");
      return successResponse({ base: from, rates });
    }

    // Get specific conversion
    if (to) {
      const rate = await getExchangeRate(from, to);
      return successResponse({ from, to, rate });
    }

    // Return all rates for base currency
    const rates = await fetchAndCacheRates(from);
    return successResponse({ base: from, rates });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export const GET = withRateLimit(getHandler, "api");