/**
 * Utility for computing user-facing pending-withdrawal timing labels
 * based on a 5–20 minute processing window.
 */

export interface WithdrawalTimingPhase {
  phase: 'queued' | 'processing' | 'overdue';
  label: string;
}

const MIN_PROCESSING_TIME_MS = 5 * 60 * 1000; // 5 minutes
const MAX_PROCESSING_TIME_MS = 20 * 60 * 1000; // 20 minutes

/**
 * Computes the current phase and user-facing label for a pending withdrawal
 * based on elapsed time since creation.
 * 
 * @param createdAt - Withdrawal creation timestamp (bigint nanoseconds)
 * @returns Object with phase and label
 */
export function getWithdrawalTimingStatus(createdAt: bigint): WithdrawalTimingPhase {
  const now = Date.now();
  const created = Number(createdAt) / 1_000_000; // Convert nanoseconds to milliseconds
  const elapsed = now - created;

  if (elapsed < MIN_PROCESSING_TIME_MS) {
    // Before 5 minutes: show queued/estimated
    const remainingToMin = MIN_PROCESSING_TIME_MS - elapsed;
    const minutes = Math.floor(remainingToMin / 60000);
    const seconds = Math.floor((remainingToMin % 60000) / 1000);
    return {
      phase: 'queued',
      label: `Queued • Estimated ${minutes}m ${seconds}s`,
    };
  } else if (elapsed <= MAX_PROCESSING_TIME_MS) {
    // Between 5-20 minutes: show time remaining until 20 minutes
    const remainingToMax = MAX_PROCESSING_TIME_MS - elapsed;
    const minutes = Math.floor(remainingToMax / 60000);
    const seconds = Math.floor((remainingToMax % 60000) / 1000);
    return {
      phase: 'processing',
      label: `Processing • ~${minutes}m ${seconds}s remaining`,
    };
  } else {
    // After 20 minutes: show processing without countdown
    return {
      phase: 'overdue',
      label: 'Processing...',
    };
  }
}
