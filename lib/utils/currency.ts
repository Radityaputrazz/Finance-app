import { prisma } from "@/lib/db/prisma";
import { parseDecimal } from "@/lib/utils";

export const SUPPORTED_CURRENCIES = [
  { code: "IDR", symbol: "Rp", name: "Rupiah Indonesia", locale: "id-ID" },
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", locale: "ms-MY" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
  { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU" },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]["code"];

// Format amount in specific currency
export function formatInCurrency(amount: number, currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return new Intl.NumberFormat(currency?.locale ?? "id-ID", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currencyCode === "JPY" ? 0 : 0,
    maximumFractionDigits: currencyCode === "JPY" ? 0 : 0,
  }).format(amount);
}

// Fetch fresh rates from free API and cache in DB
export async function fetchAndCacheRates(baseCurrency = "IDR") {
  try {
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${baseCurrency}`,
      { next: { revalidate: 3600 } } // cache 1 hour
    );
    if (!res.ok) throw new Error("Failed to fetch rates");
    const data = await res.json();
    const rates: Record<string, number> = data.rates;

    // Store in DB
    const upserts = Object.entries(rates)
      .filter(([code]) => SUPPORTED_CURRENCIES.some((c) => c.code === code))
      .map(([to, rate]) =>
        prisma.exchangeRate.upsert({
          where: { from_to: { from: baseCurrency, to } },
          create: { from: baseCurrency, to, rate },
          update: { rate },
        })
      );

    await Promise.all(upserts);
    return rates;
  } catch (error) {
    console.error("[Currency] Failed to fetch rates:", error);
    return null;
  }
}

// Get cached rate from DB
export async function getExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;

  try {
    const rate = await prisma.exchangeRate.findUnique({
      where: { from_to: { from, to } },
    });
    return rate ? parseDecimal(rate.rate) : 1;
  } catch {
    return 1;
  }
}

// Convert amount from one currency to another
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  const rate = await getExchangeRate(from, to);
  return amount * rate;
}