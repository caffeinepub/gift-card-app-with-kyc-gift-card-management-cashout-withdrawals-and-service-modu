import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { UserRole } from '../backend';

/**
 * Hook that ensures the authenticated user is registered in the backend
 * access control system by checking their role and calling assignCallerUserRole
 * for self-registration if needed. Handles authorization errors gracefully and
 * provides retry capability for transient failures.
 */
export function useEnsureUserRegistered() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;

  const query = useQuery({
    queryKey: ['userRegistration', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) {
        throw new Error('Actor or identity not available');
      }

      try {
        // First, check the caller's current role
        const currentRole = await actor.getCallerUserRole();
        
        // If the user already has a non-guest role, they're registered
        if (currentRole !== UserRole.guest) {
          return { registered: true, role: currentRole };
        }

        // User is a guest, attempt self-registration
        await actor.assignCallerUserRole(identity.getPrincipal(), UserRole.user);
        
        return { registered: true, role: UserRole.user };
      } catch (error: any) {
        // Parse the error message to determine if it's a permission issue
        const errorMessage = error?.message || String(error);
        
        // If the error indicates the user is already registered or has permissions,
        // treat it as success (idempotent behavior)
        if (
          errorMessage.includes('already has role') ||
          errorMessage.includes('already registered') ||
          errorMessage.includes('User already exists')
        ) {
          return { registered: true };
        }
        
        // Treat the legacy authorization error as a retryable transient condition
        // This handles the rollout period where the backend fix is being deployed
        if (errorMessage.includes('Unauthorized: Only admins can assign user roles')) {
          // This is a known transient error during rollout - throw to trigger retry
          throw new Error('Registration service temporarily unavailable. Retrying...');
        }
        
        // Re-throw other errors for retry logic
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: (failureCount, error: any) => {
      const errorMessage = error?.message || String(error);
      
      // Retry the transient "service unavailable" error with bounded retries
      if (errorMessage.includes('Registration service temporarily unavailable')) {
        return failureCount < 5; // More retries for the rollout period
      }
      
      // Don't retry on clear authorization failures (but not the legacy one)
      if (
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('Insufficient permissions')
      ) {
        // But do retry if it seems like a transient auth issue
        if (errorMessage.includes('not available') || errorMessage.includes('not initialized')) {
          return failureCount < 3;
        }
        return false;
      }
      
      // Retry transient errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: Infinity, // Once registered, no need to re-check
  });

  return {
    isRegistering: query.isLoading,
    isRegistered: query.isSuccess,
    registrationError: query.error,
    retryRegistration: query.refetch,
  };
}
