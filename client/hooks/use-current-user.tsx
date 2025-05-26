import { useUser } from '@clerk/nextjs';

import { useGetCurrentUser } from '@/lib/api/endpoints/users';

interface CurrentUser {
  id: number | null; // Domain user ID from the backend
  clerkId: string | null; // Clerk user ID as a stable identifier
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  isLoading: boolean;
  error: unknown;
}

/**
 * Custom hook to get the current user's information.
 * Uses the dedicated /api/users/me endpoint for clean separation of concerns.
 *
 * This hook provides both Clerk user information (for client-side operations)
 * and domain user information (from the backend API).
 *
 * The backend automatically resolves the domain user ID from the JWT token
 * through the UserProvisioningMiddleware and ICurrentUserService.
 */
export function useCurrentUser(): CurrentUser {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  const {
    data: currentUserData,
    isLoading: apiLoading,
    error
  } = useGetCurrentUser({
    query: {
      enabled: clerkLoaded && !!clerkUser, // Only fetch if user is authenticated
      staleTime: 5 * 60 * 1000, // 5 minutes - user info doesn't change often
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1 // Only retry once for user info
    }
  });

  const isLoading = !clerkLoaded || apiLoading;

  return {
    id: currentUserData?.id || null, // Domain user ID from backend
    clerkId: clerkUser?.id || null, // Clerk user ID
    name: currentUserData?.name || clerkUser?.fullName || null,
    email: currentUserData?.email || clerkUser?.primaryEmailAddress?.emailAddress || null,
    imageUrl: currentUserData?.imageUrl || clerkUser?.imageUrl || null,
    isLoading,
    error
  };
}
