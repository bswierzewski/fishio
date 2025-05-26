'use client';

import { useUser } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface AuthLoadingWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component that handles Clerk authentication loading state.
 *
 * This component ensures that children only render when Clerk has finished
 * loading the user state, eliminating the need to check `isLoaded` in every
 * component that uses authentication.
 *
 * Usage:
 * ```tsx
 * <AuthLoadingWrapper>
 *   <YourAuthenticatedComponent />
 * </AuthLoadingWrapper>
 * ```
 */
export function AuthLoadingWrapper({ children, fallback }: AuthLoadingWrapperProps) {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      fallback || (
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Ładowanie...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
