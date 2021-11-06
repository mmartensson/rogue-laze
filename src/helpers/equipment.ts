// FIXME: Move this file (or its contents), making it clear that it is only for use within the game-loop worker

// @ts-ignore -- needs to be configured properly; ts assumes the cjs is used (and broken) whereas snowpack now knows it is the esm version
import structuredClone from '@ungap/structured-clone';

import {
  ArmorInstance,
  BaseArmors,
  BaseItem,
  BaseWeapons,
  DamageType,
  DamageTypeMitigation,
  DamageTypePrefixes,
  ItemInstance,
  ItemInstanceBase,
  Rarity,
  RarityPrefixes,
  WeaponInstance,
} from '../shared/equipment';

import { MAX_LEVEL } from '../shared/constants';

import { PRNG } from './prng';

export const randomDamageTypePrefix = (
  prng: PRNG,
  damageType: DamageType
): string => {
  return prng.pick(DamageTypePrefixes[damageType]);
};

export const BaseItemLookup: Record<string, BaseItem> = {};
[...BaseArmors, ...BaseWeapons].forEach(
  (item) => (BaseItemLookup[item.id] = item)
);

export const randomRarityPrefix = (prng: PRNG, rarity: Rarity): string => {
  return prng.pick(RarityPrefixes[rarity]);
};

export const randomRarity = (prng: PRNG, playerLevel: number): Rarity => {
  const raw = prng.fraction();
  const adjusted = raw / Math.log10(MAX_LEVEL - playerLevel + 1);

  // console.log('Rarity', raw, adjusted);

  if (adjusted > 0.9) return 'legendary';

  if (adjusted > 0.6) return 'epic';

  if (adjusted > 0.4) return 'rare';

  if (adjusted > 0.35) return 'uncommon';

  return 'common';
};

export const randomSecondaryDamageType = (
  prng: PRNG,
  playerLevel: number
): DamageType | undefined => {
  const raw = prng.fraction();
  const adjusted = raw / Math.log10(MAX_LEVEL - playerLevel + 1);

  if (adjusted < 0.8) return undefined;

  const value = prng.fraction();

  if (value > 0.9) return 'acid';

  if (value > 0.8) return 'cold';

  if (value > 0.7) return 'fire';

  if (value > 0.6) return 'lightning';

  if (value > 0.5) return 'force';

  if (value > 0.4) return 'necrotic';

  if (value > 0.3) return 'radiant';

  return 'poison';
};

export const randomItemInstanceCommons = (
  prng: PRNG,
  playerLevel: number,
  baseItem: BaseItem
): ItemInstanceBase => {
  const rarity = randomRarity(prng, playerLevel);
  const secondaryDamageType =
    rarity === 'common'
      ? undefined
      : randomSecondaryDamageType(prng, playerLevel);
  let name = prng.pick(baseItem.names);

  const refId = baseItem.id;

  let price = baseItem.price;
  let weight = baseItem.weight;

  const weightCheck = prng.fraction();
  if (weightCheck > 0.9) {
    weight = Math.floor(weight * 0.8);
    name = 'Light ' + name;
  } else if (weightCheck > 0.8) {
    weight = Math.floor(weight * 0.8);
    name = 'Heavy ' + name;
  }

  switch (rarity) {
    case 'uncommon':
      price *= 10;
      break;
    case 'rare':
      price *= 100;
      break;
    case 'epic':
      price *= 1000;
      break;
    case 'legendary':
      price *= 10000;
      break;
  }

  name = randomRarityPrefix(prng, rarity) + ' ' + name;

  return {
    refId,
    name,
    rarity,
    secondaryDamageType,
    price,
    weight,
  };
};

export const randomWeapon = (
  prng: PRNG,
  playerLevel: number
): WeaponInstance => {
  const baseWeapon = prng.pick(BaseWeapons);
  const { rows, speed } = baseWeapon;
  const commons = randomItemInstanceCommons(prng, playerLevel, baseWeapon);
  const { rarity, secondaryDamageType } = commons;
  let { name } = commons;

  // TODO: Randomly adjust adjust speed (and price to match); adding an additional prefix (sluggish, speedy ...)

  const row = prng.pick(rows);

  if (secondaryDamageType) {
    name = randomDamageTypePrefix(prng, secondaryDamageType) + ' ' + name;
  }

  let damageMod = 0;
  let secondaryDamage: number | undefined = 1;

  switch (rarity) {
    case 'uncommon':
      damageMod = 1;
      break;
    case 'rare':
      damageMod = 2;
      secondaryDamage = 2;
      break;
    case 'epic':
      damageMod = 3;
      break;
    case 'legendary':
      damageMod = 5;
      secondaryDamage = 3;
      break;
  }

  if (commons.price > 1000) {
    console.log('Expensive weapon', commons);
  }

  if (!secondaryDamageType) secondaryDamage = undefined;

  return {
    ...commons,
    name,
    row,
    speed,
    damageMod,
    secondaryDamage,
  };
};

export const randomArmor = (prng: PRNG, playerLevel: number): ArmorInstance => {
  const baseArmor = prng.pick(BaseArmors);
  const { rows } = baseArmor;
  const mitigation = structuredClone(baseArmor.mitigation) as DamageTypeMitigation;
  const commons = randomItemInstanceCommons(prng, playerLevel, baseArmor);
  const { secondaryDamageType, rarity } = commons;

  const row = prng.pick(rows);

  if (secondaryDamageType) {
    mitigation[secondaryDamageType] = 2;
  }

  let extraMitigation = 0;
  switch (rarity) {
    case 'uncommon':
      extraMitigation += 1;
      break;
    case 'rare':
      extraMitigation += 2;
      break;
    case 'epic':
      extraMitigation += 3;
      break;
    case 'legendary':
      extraMitigation += 5;
      break;
  }

  for (const [key, value] of Object.entries(mitigation)) {
    mitigation[key as DamageType] = (value || 0) + extraMitigation;
  }

  return {
    ...commons,
    row,
    mitigation,
  };
};

export const randomItem = (prng: PRNG, playerLevel: number): ItemInstance => {
  if (prng.fraction() > 0.5) return randomWeapon(prng, playerLevel);
  else return randomArmor(prng, playerLevel);
};
