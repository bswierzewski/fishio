/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * Fishio API
 * OpenAPI spec version: v1
 */
import type { CategoryResultDto } from './categoryResultDto';
import type { SectorParticipantDto } from './sectorParticipantDto';

export interface SectorResultDto {
  /** @nullable */
  sectorName?: string | null;
  participantsCount?: number;
  catchesCount?: number;
  /** @nullable */
  categoryResults?: CategoryResultDto[] | null;
  /** @nullable */
  participants?: SectorParticipantDto[] | null;
}
