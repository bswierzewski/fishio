import { useUser } from '@clerk/nextjs';

import { useGetCurrentUser } from '@/lib/api/endpoints/users';

interface CurrentUser {
  id: number | null; // Domain user ID from the backend
  clerkId: string | null; // Clerk user ID as a stable identifier
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  error: unknown;
}

/**
 * Custom hook to get the current user's information.
 *
 * This hook assumes the user authentication state is already loaded
 * since the AuthGuard handles the loading state globally.
 *
 * This hook provides both Clerk user information (for client-side operations)
 * and domain user information (from the backend API).
 *
 * The backend automatically resolves the domain user ID from the JWT token
 * through the UserProvisioningMiddleware and ICurrentUserService.
 */
export function useCurrentUser(): CurrentUser {
  const { user: clerkUser } = useUser();

  const { data: currentUserData, error } = useGetCurrentUser();

  return {
    id: currentUserData?.id || null, // Domain user ID from backend
    clerkId: clerkUser?.id || null, // Clerk user ID
    name: currentUserData?.name || clerkUser?.fullName || null,
    email: currentUserData?.email || clerkUser?.primaryEmailAddress?.emailAddress || null,
    imageUrl: currentUserData?.imageUrl || clerkUser?.imageUrl || null,
    error
  };
}
