/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * Fishio API
 * OpenAPI spec version: v1
 */

export type CompetitionStatus = (typeof CompetitionStatus)[keyof typeof CompetitionStatus];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CompetitionStatus = {
  Draft: 'Draft',
  AcceptingRegistrations: 'AcceptingRegistrations',
  Scheduled: 'Scheduled',
  Ongoing: 'Ongoing',
  Finished: 'Finished',
  Cancelled: 'Cancelled'
} as const;
