import { ArmorInstance, ArmorLocation } from "./armor";
import { WeaponInstance } from "./weapon";

export {
  DamageTypePrefixes,
  DamageTypeToVariantColumn,
  RarityPrefixes,
} from './item';

export type {
  BaseItem,
  ItemInstanceBase,
  DamageType,
  Rarity,
} from './item';

export {
  BaseWeapons,
  isBaseWeapon,
  lookupBaseWeapon,
} from './weapon';

export type {
  BaseWeapon,
  WeaponInstance,
} from './weapon';

export {
  BaseArmors,
  isBaseArmor,
  lookupBaseArmor,
} from './armor';

export type {
  BaseArmor,
  ArmorInstance,
  DamageTypeMitigation,
} from './armor';

export type ItemLocation = ArmorLocation | 'main' | 'offhand';

export function isWeaponInstance(item: ItemInstance): item is WeaponInstance {
  return (item as WeaponInstance).speed !== undefined;
}

export function isArmorInstance(item: ItemInstance): item is ArmorInstance {
  return (item as ArmorInstance).mitigation !== undefined;
}

export type ItemInstance = WeaponInstance | ArmorInstance;
