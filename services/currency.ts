// services/currency.ts

import { CurrencyCode } from '../types';

const FRANKFURTER_API_URL = 'https://api.frankfurter.app';

// Fallback rates matching the old hardcoded values
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 1.07,
  JPY: 0.0063,
  GBP: 1.27,
  AUD: 0.66,
  CAD: 0.73,
  CHF: 1.11,
  CNY: 0.14,
  IDR: 0.000062,
};

/**
 * Fetches the latest exchange rates for a given base currency.
 * Caches the results in sessionStorage for 1 hour to reduce API calls.
 *
 * @param base - The base currency to fetch rates for.
 * @returns A record of currency codes to their exchange rates.
 */
export const getLatestRates = async (base: CurrencyCode): Promise<Record<string, number>> => {
  const cacheKey = `exchange_rates_${base}`;
  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    const { rates, timestamp } = JSON.parse(cachedData);
    // Cache is valid for 1 hour
    if (Date.now() - timestamp < 60 * 60 * 1000) {
      console.log('Using cached exchange rates');
      return rates;
    }
  }

  try {
    console.log(`Fetching latest exchange rates for base: ${base}`);
    const response = await fetch(`${FRANKFURTER_API_URL}/latest?from=${base}`);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    const data = await response.json();

    // The API returns the base in the rates object, which we don't need
    delete data.rates[base];

    const ratesWithBase = { ...data.rates, [base]: 1 };

    // Cache the new rates
    sessionStorage.setItem(cacheKey, JSON.stringify({ rates: ratesWithBase, timestamp: Date.now() }));

    return ratesWithBase;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    console.warn('Using fallback exchange rates');
    // On failure, return the hardcoded fallback rates relative to the base
    const baseRate = FALLBACK_RATES[base] || 1;
    const relativeFallbackRates: Record<string, number> = {} as Record<string, number>;
    for (const currency in FALLBACK_RATES) {
      relativeFallbackRates[currency] = FALLBACK_RATES[currency as CurrencyCode] / baseRate;
    }
    return relativeFallbackRates;
  }
};
