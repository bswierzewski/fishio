'use client';

import { useAuth, useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';

import { axiosInstance, setupClerkInterceptors } from '@/lib/api/axios';

export function AxiosClientConfigurator() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const tokenTemplate = process.env.NEXT_PUBLIC_CLERK_TOKEN_TEMPLATE ?? 'default';

  useEffect(() => {
    // Set up interceptors - AuthLoadingWrapper ensures this only runs when Clerk is loaded
    setupClerkInterceptors(axiosInstance, tokenTemplate, getToken, signOut);
  }, [getToken, signOut]);

  return null; // Ten komponent nie renderuje niczego w DOM
}
