import { INITIAL_HEALTH } from './constants';

import type {
  DamageTypeMitigation,
  ItemInstance,
  ItemLocation,
} from './equipment';

export interface Character {
  equipment: Partial<Record<ItemLocation, ItemInstance>>;
  inventory: ItemInstance[];
  maxHealth: number;
  curHealth: number;
  coin: number;
  level: number;
  totalMitigation: DamageTypeMitigation;
}

export const createCharacter = (): Character => {
  return {
    equipment: {},
    inventory: [],
    maxHealth: INITIAL_HEALTH,
    curHealth: INITIAL_HEALTH,
    coin: 0,
    level: 1,
    totalMitigation: {}
  }
}