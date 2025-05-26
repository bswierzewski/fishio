'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Unified authentication component that handles both protected and public routes.
 *
 * This component:
 * 1. Waits for Clerk to fully load
 * 2. Optionally ensures user is authenticated (if requireAuth=true)
 * 3. Handles redirects for unauthenticated users on protected routes
 * 4. Provides consistent loading states
 * 5. Prevents flash of unauthenticated content
 */

export function AuthGuard({ children, fallback, redirectTo = '/sign-in', requireAuth = true }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoaded && requireAuth && !isSignedIn && !isRedirecting) {
      setIsRedirecting(true);
      router.push(redirectTo);
    }
  }, [isLoaded, isSignedIn, requireAuth, router, redirectTo, isRedirecting]);

  // Reset redirecting state when user becomes authenticated
  useEffect(() => {
    if (isSignedIn && isRedirecting) {
      setIsRedirecting(false);
    }
  }, [isSignedIn, isRedirecting]);

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      fallback || (
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Inicjalizacja...</p>
          </div>
        </div>
      )
    );
  }

  // For protected routes only: ensure user is authenticated
  if (requireAuth) {
    // Show loading while redirecting unauthenticated users
    if (isRedirecting) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Przekierowywanie...</p>
          </div>
        </div>
      );
    }

    // If user is not signed in, redirect (this should trigger the useEffect above)
    if (!isSignedIn) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Sprawdzanie uwierzytelnienia...</p>
          </div>
        </div>
      );
    }

    // Show loading while user data is being fetched
    if (!user) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Ładowanie danych użytkownika...</p>
          </div>
        </div>
      );
    }
  }

  // Render content (either authenticated user for protected routes, or anyone for public routes)
  return <>{children}</>;
}
