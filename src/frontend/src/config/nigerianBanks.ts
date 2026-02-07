/**
 * Nigerian Banks Configuration
 * 
 * Comprehensive list of Nigerian banks for payout method selection.
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
  'Wema Bank',
  'Zenith Bank',
] as const;

/**
 * Filter banks by search query (case-insensitive)
 */
export function filterBanksByQuery(query: string): string[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [...NIGERIAN_BANKS];
  
  return NIGERIAN_BANKS.filter(bank => 
    bank.toLowerCase().includes(lowerQuery)
  );
}
