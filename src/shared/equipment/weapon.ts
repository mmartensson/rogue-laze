import { BaseItem, DamageType, ItemInstanceBase } from "./item";

export const WeaponBaseRow = 0;

export enum WeaponRow {
  Dagger = WeaponBaseRow + 0,
  Sword1 = WeaponBaseRow + 1,
  Flail = WeaponBaseRow + 2,
  Axe = WeaponBaseRow + 3,
  Whip = WeaponBaseRow + 4,
  Staff = WeaponBaseRow + 5,
  LongBow = WeaponBaseRow + 6,
  Crossbow = WeaponBaseRow + 7,
  Gun = WeaponBaseRow + 8,
  Claw = WeaponBaseRow + 9,
  Glove = WeaponBaseRow + 10,

  Spear = WeaponBaseRow + 11,
  Mace = WeaponBaseRow + 12,
  Rod = WeaponBaseRow + 13,
  Club = WeaponBaseRow + 14,
  Chain = WeaponBaseRow + 15,
  Sword2 = WeaponBaseRow + 16,
  IronPipe = WeaponBaseRow + 17,
  Slingshot = WeaponBaseRow + 18,
  Shotgun = WeaponBaseRow + 19,
  Rifle = WeaponBaseRow + 20,

  Chainsaw = WeaponBaseRow + 21,
  MagicBolt = WeaponBaseRow + 22,
  StunRod = WeaponBaseRow + 23,
  Sword3 = WeaponBaseRow + 24,
  Book = WeaponBaseRow + 25,
  Scythe = WeaponBaseRow + 26,
  Sword4 = WeaponBaseRow + 27,
}

// export type WeaponLocation = 'main' | 'offhand'; <-- TODO: Rename current WeaponLocation to WeaponLocationRequirements or something
export type WeaponLocation = 'main-1h' | 'main-2h' | 'offhand' | 'either';

export type Speed = 'fast' | 'medium' | 'slow';

export type Dice = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export interface BaseWeapon extends BaseItem {
  location: WeaponLocation;
  rows: WeaponRow[];
  damageType: DamageType;
  damageDice: Dice;
  speed: Speed;
}

export function isBaseWeapon(item: BaseItem): item is BaseWeapon {
  return (item as BaseWeapon).damageType !== undefined;
}

// IN PROGRESS: refId for lookup of BaseWeapon to find location ... see that it is 'either'
// (or whatever) and then assign the instance to a slot rather than declare it in the object itself.
// Three separate lists:
// 1) Weapon slot reuirements 2) Armor slot requirements 3) All available slots.
// The code that assigns items to slots needs to figure out that putting a 2h weapon in main means that offhand
// is blocked. Typically that is shown as a dimmed main weapon in offhand (instead of dimmed shield).
export interface WeaponInstance extends ItemInstanceBase {
  row: WeaponRow;
  damageMod: number;
  secondaryDamage?: number;
  speed: Speed;
}

export const WeaponDagger: BaseWeapon = {
  id: 'dagger',
  names: ['Dagger', 'Knife', 'Shiv'],
  location: 'either',
  rows: [WeaponRow.Dagger],
  damageType: 'piercing',
  damageDice: 4,
  speed: 'fast',
  price: 200,
  weight: 1,
};

export const WeaponSword1h: BaseWeapon = {
  id: 'sword1h',
  names: ['Longsword', 'Scimitar', 'Rapier'],
  location: 'main-1h',
  rows: [WeaponRow.Sword1, WeaponRow.Sword3],
  damageType: 'slashing',
  damageDice: 8,
  speed: 'medium',
  price: 1500,
  weight: 3,
};

export const WeaponSword2h: BaseWeapon = {
  id: 'sword2h',
  names: ['Greatsword', 'Claymore'],
  location: 'main-2h',
  rows: [WeaponRow.Sword2, WeaponRow.Sword4],
  damageType: 'slashing',
  damageDice: 12,
  speed: 'slow',
  price: 5000,
  weight: 6,
};

export const WeaponFlail: BaseWeapon = {
  id: 'flail',
  names: ['Flail'],
  location: 'main-1h',
  rows: [WeaponRow.Dagger],
  damageType: 'bludgeoning',
  damageDice: 8,
  speed: 'medium',
  price: 1000,
  weight: 2,
};

export const WeaponAxe1h: BaseWeapon = {
  id: 'axe1h',
  names: ['Handaxe'],
  location: 'either',
  rows: [WeaponRow.Axe],
  damageType: 'slashing',
  damageDice: 6,
  speed: 'medium',
  price: 500,
  weight: 2,
};

export const WeaponAxe2h: BaseWeapon = {
  id: 'axe2h',
  names: ['Greateaxe'],
  location: 'main-2h',
  rows: [WeaponRow.Axe],
  damageType: 'slashing',
  damageDice: 12,
  speed: 'slow',
  price: 3000,
  weight: 7,
};

export const WeaponWhip: BaseWeapon = {
  id: 'whip',
  names: ['Whip'],
  location: 'either',
  rows: [WeaponRow.Whip],
  damageType: 'slashing',
  damageDice: 4,
  speed: 'fast',
  price: 200,
  weight: 3,
};

export const WeaponStaff: BaseWeapon = {
  id: 'staff',
  names: ['Quarterstaff'],
  location: 'main-2h',
  rows: [WeaponRow.Staff],
  damageType: 'bludgeoning',
  damageDice: 8,
  speed: 'slow',
  price: 20,
  weight: 4,
};

export const WeaponLongbow: BaseWeapon = {
  id: 'longbow',
  names: ['Longbow'],
  location: 'main-2h',
  rows: [WeaponRow.LongBow],
  damageType: 'piercing',
  damageDice: 8,
  speed: 'medium',
  price: 5000,
  weight: 2,
};

export const WeaponCrossbow: BaseWeapon = {
  id: 'crossbow',
  names: ['Crossbow'],
  location: 'main-2h',
  rows: [WeaponRow.Crossbow],
  damageType: 'piercing',
  damageDice: 10,
  speed: 'slow',
  price: 5000,
  weight: 18,
};

// Skipping WeaponRow.Gun/Claw/Glove

export const WeaponSpear: BaseWeapon = {
  id: 'spear',
  names: ['Spear'],
  location: 'main-2h',
  rows: [WeaponRow.Spear],
  damageType: 'piercing',
  damageDice: 8,
  speed: 'medium',
  price: 100,
  weight: 3,
};

export const WeaponMace: BaseWeapon = {
  id: 'mace',
  names: ['Mace'],
  location: 'main-1h',
  rows: [WeaponRow.Mace],
  damageType: 'bludgeoning',
  damageDice: 6,
  speed: 'medium',
  price: 500,
  weight: 4,
};

// Skipping WeaponRow.Rod

export const WeaponClub1h: BaseWeapon = {
  id: 'club1h',
  names: ['Club'],
  location: 'main-1h',
  rows: [WeaponRow.Club],
  damageType: 'bludgeoning',
  damageDice: 4,
  speed: 'medium',
  price: 10,
  weight: 2,
};

export const WeaponClub2h: BaseWeapon = {
  id: 'club2h',
  names: ['Greatclub'],
  location: 'main-2h',
  rows: [WeaponRow.Club],
  damageType: 'bludgeoning',
  damageDice: 8,
  speed: 'slow',
  price: 20,
  weight: 10,
};

// Skipping WeaponRow.Chain/IronPipe

export const WeaponSlingshot: BaseWeapon = {
  id: 'dagger',
  names: ['Sling'],
  location: 'main-2h',
  rows: [WeaponRow.Slingshot],
  damageType: 'bludgeoning',
  damageDice: 4,
  speed: 'medium',
  price: 20,
  weight: 0,
};

// Skipping WeaponRow.Shotgun/Rifle/Chainsaw/MagicBolt/StunRod/Book

export const WeaponScythe: BaseWeapon = {
  id: 'axe2h',
  names: ['Scythe'],
  location: 'main-2h',
  rows: [WeaponRow.Scythe],
  damageType: 'slashing',
  damageDice: 10,
  speed: 'slow',
  price: 70,
  weight: 10,
};

export const BaseWeapons = [
  WeaponDagger,
  WeaponSword1h,
  WeaponSword2h,
  WeaponFlail,
  WeaponAxe1h,
  WeaponAxe2h,
  WeaponWhip,
  WeaponStaff,
  WeaponLongbow,
  WeaponCrossbow,
  WeaponSpear,
  WeaponMace,
  WeaponClub1h,
  WeaponClub2h,
  WeaponSlingshot,
  WeaponScythe,
];

export const lookupBaseWeapon = (refId: string) =>
  BaseWeapons.find((w) => w.id == refId);
