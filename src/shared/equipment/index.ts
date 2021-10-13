import { ArmorInstance, ArmorLocation } from "./armor";
import { WeaponInstance } from "./weapon";

export type ItemLocation = ArmorLocation | 'main' | 'offhand';

export function isWeaponInstance(item: ItemInstance): item is WeaponInstance {
  return (item as WeaponInstance).speed !== undefined;
}

export function isArmorInstance(item: ItemInstance): item is ArmorInstance {
  return (item as ArmorInstance).mitigation !== undefined;
}

export type ItemInstance = WeaponInstance | ArmorInstance;
