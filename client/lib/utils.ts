import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a Date object to a string format suitable for datetime-local inputs.
 * This ensures the datetime is displayed in the user's local timezone.
 *
 * @param date - The Date object to convert. If not provided, uses current date/time.
 * @returns A string in YYYY-MM-DDTHH:mm format in local timezone
 */
export function formatDateTimeLocal(date?: Date): string {
  const targetDate = date || new Date();
  return format(targetDate, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Converts a datetime-local input value back to an ISO string for API submission.
 * This ensures the datetime is properly converted from local time to UTC.
 *
 * @param dateTimeLocalValue - The value from a datetime-local input
 * @returns An ISO string representation of the datetime
 */
export function parseLocalDateTime(dateTimeLocalValue: string): string {
  return new Date(dateTimeLocalValue).toISOString();
}
