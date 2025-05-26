'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

import { axiosInstance, setupClerkInterceptors } from '@/lib/api/axios';

export function AxiosClientConfigurator() {
  const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded } = useUser();
  const interceptorsSetup = useRef(false);
  const tokenTemplate = process.env.NEXT_PUBLIC_CLERK_TOKEN_TEMPLATE ?? 'default';

  useEffect(() => {
    // Only set up interceptors once when both auth and user are fully loaded
    if (authLoaded && userLoaded && !interceptorsSetup.current) {
      setupClerkInterceptors(axiosInstance, tokenTemplate, getToken);
      interceptorsSetup.current = true;
    }
  }, [getToken, authLoaded, userLoaded, tokenTemplate]);

  // Reset interceptors setup flag when user signs out
  useEffect(() => {
    if (authLoaded && !isSignedIn && interceptorsSetup.current) {
      interceptorsSetup.current = false;
    }
  }, [authLoaded, isSignedIn]);

  return null; // This component renders nothing in the DOM
}
