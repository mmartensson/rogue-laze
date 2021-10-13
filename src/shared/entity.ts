import type { Point } from "./geometry";

export const ENTITY_TYPES_BASE = ['trap', 'loot', 'enemy'] as const;
export type EntityType = typeof ENTITY_TYPES_BASE[number];
export const ENTITY_TYPES = ENTITY_TYPES_BASE as never as EntityType[];

export interface Entity extends Point {
  type: EntityType;
}