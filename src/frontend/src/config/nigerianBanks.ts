/**
 * Nigerian Banks Configuration
 * 
 * Comprehensive list of Nigerian banks and digital financial institutions for payout method selection.
 * This list is maintained as a single source of truth for all bank selection UIs.
 */

export const NIGERIAN_BANKS = [
  'Access Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank (FCMB)',
  'Globus Bank',
  'Guaranty Trust Bank (GTBank)',
  'Heritage Bank',
  'Keystone Bank',
  'Kuda Bank',
  'Moniepoint',
  'OPay',
  'Paga',
  'PalmPay',
  'Parallex Bank',
  'Polaris Bank',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered Bank',
  'Sterling Bank',
  'SunTrust Bank',
  'Titan Trust Bank',
  'Union Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Unity Bank',
  'VFD Microfinance Bank',
  'Wema Bank',
  'Zenith Bank',
] as const;

/**
 * Normalize text for search by removing punctuation, extra whitespace, and converting to lowercase
 */
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

/**
 * Filter banks by search query with forgiving match logic
 * Handles case-insensitive search and normalized punctuation/whitespace
 * 
 * Examples:
 * - filterBanksByQuery('kuda') returns ['Kuda Bank']
 * - filterBanksByQuery('opay') returns ['OPay']
 * - filterBanksByQuery('monie') returns ['Moniepoint']
 * - filterBanksByQuery('palm') returns ['PalmPay']
 * - filterBanksByQuery('paga') returns ['Paga']
 */
export function filterBanksByQuery(query: string): string[] {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return [...NIGERIAN_BANKS];
  
  return NIGERIAN_BANKS.filter(bank => {
    const normalizedBank = normalizeForSearch(bank);
    return normalizedBank.includes(normalizedQuery);
  });
}
