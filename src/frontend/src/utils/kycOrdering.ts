import type { KycRecord } from '../types/app-types';

/**
 * Deterministically sorts KYC records by submittedAt (descending) and then by id (descending) as a stable tiebreaker.
 * Returns a new sorted array without mutating the input.
 */
export function sortKycRecordsByNewest(records: KycRecord[]): KycRecord[] {
  return [...records].sort((a, b) => {
    // First compare by submittedAt (newest first)
    const timeA = typeof a.submittedAt === 'bigint' ? Number(a.submittedAt) : a.submittedAt;
    const timeB = typeof b.submittedAt === 'bigint' ? Number(b.submittedAt) : b.submittedAt;
    
    if (timeA > timeB) return -1;
    if (timeA < timeB) return 1;
    
    // If submittedAt is equal, use id as tiebreaker (newest/highest id first)
    const idA = typeof a.id === 'string' ? parseInt(a.id, 10) : Number(a.id);
    const idB = typeof b.id === 'string' ? parseInt(b.id, 10) : Number(b.id);
    
    return idB - idA;
  });
}

/**
 * Returns the latest (most recent) KYC record from an array, or null if empty.
 * Uses deterministic ordering by submittedAt and id.
 */
export function getLatestKycRecord(records: KycRecord[]): KycRecord | null {
  if (records.length === 0) return null;
  const sorted = sortKycRecordsByNewest(records);
  return sorted[0];
}
