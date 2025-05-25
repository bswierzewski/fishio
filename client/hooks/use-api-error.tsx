import { getErrorMessage, handleApiError } from '@/lib/error-utils';
import { type AxiosError } from 'axios';
import { useCallback } from 'react';

/**
 * Hook for handling API errors in components
 * Provides utilities for displaying user-friendly error messages
 */
export function useApiError() {
  /**
   * Handles an API error by showing appropriate toast notifications
   * Use this in mutation onError callbacks for automatic error handling
   */
  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error && 'response' in error) {
      handleApiError(error as AxiosError);
    } else {
      console.error('Nieoczekiwany błąd:', error);
    }
  }, []);

  /**
   * Gets a user-friendly error message from an API error
   * Use this when you need to display error messages in forms or components
   */
  const getErrorMsg = useCallback((error: unknown): string => {
    if (error instanceof Error && 'response' in error) {
      return getErrorMessage(error as AxiosError);
    }
    return 'Wystąpił nieoczekiwany błąd';
  }, []);

  /**
   * Creates an error handler for React Query mutations
   * Returns a function that can be used directly in mutation onError callbacks
   */
  const createErrorHandler = useCallback(
    (customHandler?: (error: unknown) => void) => {
      return (error: unknown) => {
        handleError(error);
        customHandler?.(error);
      };
    },
    [handleError]
  );

  return {
    handleError,
    getErrorMessage: getErrorMsg,
    createErrorHandler
  };
}
