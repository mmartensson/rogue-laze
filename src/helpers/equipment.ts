import { AleaPRNG } from '@spissvinkel/alea';

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

export const ArmorBaseRow = 28;

export enum ArmorRow {
  Shield = ArmorBaseRow + 0,
  Buckler = ArmorBaseRow + 1,
  Hat = ArmorBaseRow + 2,
  Helm1 = ArmorBaseRow + 3,
  Helm2 = ArmorBaseRow + 4,
  WizardHat = ArmorBaseRow + 5,
  Circlet = ArmorBaseRow + 6,
  Robe = ArmorBaseRow + 7,
  Breastplate = ArmorBaseRow + 8,
  Plate = ArmorBaseRow + 9,
  Coat = ArmorBaseRow + 10,

  Cloak = ArmorBaseRow + 11,
  Boots1 = ArmorBaseRow + 12,
  Boots2 = ArmorBaseRow + 13,
  Gloves = ArmorBaseRow + 14,
  Gauntlets = ArmorBaseRow + 15,
  Bracers = ArmorBaseRow + 16,
  Ring = ArmorBaseRow + 17,
  Necklace = ArmorBaseRow + 18,
  Brooch = ArmorBaseRow + 19,
  Comb = ArmorBaseRow + 20,

  Bow = ArmorBaseRow + 21,
  Headband = ArmorBaseRow + 22,
  Goggles = ArmorBaseRow + 23,
  Jacket1 = ArmorBaseRow + 24,
  Jacket2 = ArmorBaseRow + 25,
  Dress = ArmorBaseRow + 26,
}

export type EquipmentRow = WeaponRow | ArmorRow;

export enum VariantColumn {
  Regular = 0,
  FancyRed = 1,
  FancyOrange = 2,
  FancyYellow = 3,
  FancyGreen = 4,
  FancyBlue = 5,
  FancyPurple = 6,
  FancyPink = 7,
  FancyBrown = 8,
  Fire = 9,
  Cold = 10,

  Lightning = 11,
  Force = 12,
  Poison = 13,
  Acid = 14,
  Radiant = 15,
  Necrotic = 16,
}

export type WeaponLocation = 'main-1h' | 'main-2h' | 'offhand' | 'either';
export type DamageType =
  | 'acid'
  | 'bludgeoning'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'piercing'
  | 'poison'
  | 'radiant'
  | 'slashing';

export const DamageTypeToVariantColumn = new Map<DamageType, VariantColumn>([
  ['acid', VariantColumn.Acid],
  ['cold', VariantColumn.Cold],
  ['fire', VariantColumn.Fire],
  ['force', VariantColumn.Force],
  ['lightning', VariantColumn.Lightning],
  ['necrotic', VariantColumn.Necrotic],
  ['poison', VariantColumn.Poison],
  ['radiant', VariantColumn.Radiant],
]);

export type Speed = 'fast' | 'medium' | 'slow';

export type Dice = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export interface BaseWeapon {
  id: string;
  names: string[];
  location: WeaponLocation;
  rows: WeaponRow[];
  damageType: DamageType;
  damageDice: Dice;
  speed: Speed;
  price: number;
  weight: number;
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

export const randomBaseWeapon = (alea: AleaPRNG): BaseWeapon => {
  const { uint32 } = alea;
  return BaseWeapons[uint32() % BaseWeapons.length];
};

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface WeaponInstance extends BaseWeapon {
  rarity: Rarity;
  secondaryDamageType?: DamageType;
}

// FIXME: Move somewhere relevant
const MAX_LEVEL = 100;

export const randomRarity = (alea: AleaPRNG, playerLevel: number): Rarity => {
  const { random } = alea;
  const raw = random();
  const adjusted = raw / Math.log10(MAX_LEVEL - playerLevel + 1);

  if (adjusted > 0.9) return 'legendary';

  if (adjusted > 0.7) return 'epic';

  if (adjusted > 0.25) return 'rare';

  if (adjusted > 0.15) return 'uncommon';

  return 'common';
};

export const randomSecondaryDamageType = (
  alea: AleaPRNG,
  playerLevel: number
): DamageType | undefined => {
  const { random } = alea;
  const raw = random();
  const adjusted = raw / Math.log10(MAX_LEVEL - playerLevel + 1);

  if (adjusted < 0.8) return undefined;

  const value = random();

  if (value > 0.9) return 'acid';

  if (value > 0.8) return 'cold';

  if (value > 0.7) return 'fire';

  if (value > 0.6) return 'lightning';

  if (value > 0.5) return 'force';

  if (value > 0.4) return 'necrotic';

  if (value > 0.3) return 'radiant';

  return 'poison';
};

export const randomWeapon = (
  alea: AleaPRNG,
  playerLevel: number
): WeaponInstance => {
  const rarity = randomRarity(alea, playerLevel);
  const secondaryDamageType = randomSecondaryDamageType(alea, playerLevel);

  return {
    ...randomBaseWeapon(alea),
    rarity,
    secondaryDamageType,
  };
};
