/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * Fishio API
 * OpenAPI spec version: v1
 */
import type { CategoryCalculationLogic } from './categoryCalculationLogic';
import type { CategoryEntityType } from './categoryEntityType';
import type { CategoryMetric } from './categoryMetric';
import type { CategoryType } from './categoryType';

export interface CategoryDefinitionDto {
  id?: number;
  /** @nullable */
  name?: string | null;
  /** @nullable */
  description?: string | null;
  type?: CategoryType;
  metric?: CategoryMetric;
  calculationLogic?: CategoryCalculationLogic;
  entityType?: CategoryEntityType;
  requiresSpecificFishSpecies?: boolean;
  allowManualWinnerAssignment?: boolean;
}
