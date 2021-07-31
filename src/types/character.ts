/* eslint-disable import/extensions */
import { ItemInstance, ItemLocation } from './equipment';

export const MAX_LEVEL = 100;

export interface Character {
  equipment: Partial<Record<ItemLocation, ItemInstance>>;
  inventory: ItemInstance[];
  maxHealth: number;
  curHealth: number;
  level: number;
}
