/**
 * Helper to extract a clean, user-displayable message from backend call failures.
 * Preserves backend-provided English messages when present and provides safe fallback strings.
 */

export function extractBackendErrorMessage(error: any, fallback: string = 'An error occurred'): string {
  // If error is a string, return it directly
  if (typeof error === 'string') {
    return error;
  }

  // Check for error.message (most common case)
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }

  // Check for nested error structures
  if (error?.error?.message && typeof error.error.message === 'string') {
    return error.error.message;
  }

  // Check for response data
  if (error?.response?.data?.message && typeof error.response.data.message === 'string') {
    return error.response.data.message;
  }

  // Return fallback if no message found
  return fallback;
}
