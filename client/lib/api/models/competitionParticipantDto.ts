/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * Fishio API
 * OpenAPI spec version: v1
 */
import type { ParticipantRole } from './participantRole';

export interface CompetitionParticipantDto {
  id?: number;
  /** @nullable */
  userId?: number | null;
  /** @nullable */
  name?: string | null;
  role?: ParticipantRole;
  addedByOrganizer?: boolean;
}
