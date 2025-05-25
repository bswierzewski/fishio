import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';

import type { HttpValidationProblemDetails } from './api/models';

/**
 * Checks if an error is a validation error (400 status with validation details)
 */
export function isValidationError(error: AxiosError): error is AxiosError<HttpValidationProblemDetails> {
  return Boolean(
    error.response?.status === 400 &&
      error.response?.data &&
      typeof error.response.data === 'object' &&
      error.response.data !== null &&
      'errors' in error.response.data
  );
}

/**
 * Extracts validation error messages from a ValidationProblemDetails response
 */
export function extractValidationErrors(validationData: HttpValidationProblemDetails): string[] {
  const errors: string[] = [];

  if (validationData.errors) {
    Object.entries(validationData.errors).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach((message) => {
          // Just add the message without the field name
          errors.push(message);
        });
      }
    });
  }

  return errors;
}

/**
 * Displays validation errors as toast notifications
 */
export function showValidationErrors(errors: string[]): void {
  if (errors.length === 1) {
    toast.error(errors[0]);
  } else if (errors.length > 1) {
    // For multiple errors, show each error individually
    console.warn('Validation errors:', errors);

    errors.forEach((error, index) => {
      setTimeout(() => {
        toast.error(error, { duration: 4000 });
      }, index * 300);
    });
  }
}

/**
 * Handles API errors in a user-friendly way
 */
export function handleApiError(error: AxiosError): void {
  if (isValidationError(error)) {
    const validationErrors = extractValidationErrors(error.response!.data);
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }
  }

  // Handle other error types
  const status = error.response?.status;
  const data = error.response?.data as any;

  switch (status) {
    case 400:
      // Generic bad request
      toast.error(data?.detail || data?.title || 'Nieprawidłowe żądanie. Sprawdź wprowadzone dane.');
      break;
    case 401:
      // Handled by interceptor (sign out)
      break;
    case 403:
      toast.error('Nie masz uprawnień do wykonania tej akcji.');
      break;
    case 404:
      toast.error(data?.detail || 'Nie znaleziono żądanego zasobu.');
      break;
    case 409:
      toast.error(data?.detail || 'Ta akcja jest w konflikcie z istniejącymi danymi.');
      break;
    case 422:
      toast.error(data?.detail || 'Żądanie nie mogło zostać przetworzone.');
      break;
    case 429:
      toast.error('Zbyt wiele żądań. Spróbuj ponownie później.');
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      toast.error('Błąd serwera. Spróbuj ponownie później.');
      break;
    default:
      if (!error.response) {
        toast.error('Błąd połączenia. Sprawdź swoje połączenie internetowe.');
      } else {
        toast.error('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
      }
      break;
  }
}

/**
 * Creates a user-friendly error message from an AxiosError
 * Useful for displaying errors in forms or components
 */
export function getErrorMessage(error: AxiosError): string {
  if (isValidationError(error)) {
    const validationErrors = extractValidationErrors(error.response!.data);
    if (validationErrors.length > 0) {
      return validationErrors.join(', ');
    }
  }

  const status = error.response?.status;
  const data = error.response?.data as any;

  switch (status) {
    case 400:
      return data?.detail || data?.title || 'Nieprawidłowe żądanie. Sprawdź wprowadzone dane.';
    case 403:
      return 'Nie masz uprawnień do wykonania tej akcji.';
    case 404:
      return data?.detail || 'Nie znaleziono żądanego zasobu.';
    case 409:
      return data?.detail || 'Ta akcja jest w konflikcie z istniejącymi danymi.';
    case 422:
      return data?.detail || 'Żądanie nie mogło zostać przetworzone.';
    case 429:
      return 'Zbyt wiele żądań. Spróbuj ponownie później.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Błąd serwera. Spróbuj ponownie później.';
    default:
      if (!error.response) {
        return 'Błąd połączenia. Sprawdź swoje połączenie internetowe.';
      }
      return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
  }
}
