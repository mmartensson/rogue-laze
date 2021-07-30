export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

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

export type ItemRow = WeaponRow | ArmorRow;

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

export type ArmorLocation =
  | 'accessory'
  | 'head'
  | 'neck'
  | 'chest'
  | 'arm'
  | 'leg'
  | 'finger'
  | 'offhand';

export type ItemLocation = ArmorLocation | 'main' | 'offhand';

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

export type DamageTypeMitigation = Partial<Record<DamageType, number>>;

export type Speed = 'fast' | 'medium' | 'slow';

export type Dice = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export interface BaseItem {
  id: string;
  names: string[];
  rows: ItemRow[];
  price: number;
  weight: number;
}

export interface ItemInstanceBase {
  refId: string;
  name: string;
  rarity: Rarity;
  secondaryDamageType?: DamageType;
  price: number;
  weight: number;
}

export interface BaseWeapon extends BaseItem {
  location: WeaponLocation;
  rows: WeaponRow[];
  damageType: DamageType;
  damageDice: Dice;
  speed: Speed;
}

// IN PROGRESS: refId for lookup of BaseWeapon to find location ... see that it is 'either'
// (or whatever) and then assign the instance to a slot rather than declare it in the object itself.
// Three separate lists:
// 1) Weapon slot reuirements 2) Armor slot requirements 3) All available slots.
// The code that assigns items to slots needs to figure out that putting a 2h weapon in main means that offhand
// is blocked. Typically that is shown as a dimmed main weapon in offhand (instead of dimmed shield).
export interface WeaponInstance extends ItemInstanceBase {
  row: WeaponRow;
  damageDice: Dice;
  speed: Speed;
}

export interface BaseArmor extends BaseItem {
  location: ArmorLocation;
  rows: ArmorRow[];
  mitigation: DamageTypeMitigation;
}

export interface ArmorInstance extends ItemInstanceBase {
  row: ArmorRow;
  mitigation: DamageTypeMitigation;
}

export type ItemInstance = WeaponInstance | ArmorInstance;

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

/*
  Armor TODO:

  Hat
  Helm1
  Helm2
  WizardHat
  Circlet
  Robe
  Coat

  Cloak
  Boots1
  Boots2
  Gloves
  Gauntlets
  Bracers
  Ring
  Necklace
  Brooch
  Comb

  Bow
  Headband
  Goggles
  Jacket1
  Jacket2
  Dress
*/

export const ArmorShield: BaseArmor = {
  id: 'shield',
  names: ['Shield'],
  location: 'offhand',
  rows: [ArmorRow.Shield],
  mitigation: {
    piercing: 2,
    slashing: 2,
    bludgeoning: 2,
  },
  price: 1000,
  weight: 6,
};

export const ArmorBuckler: BaseArmor = {
  id: 'shield',
  names: ['Buckler'],
  location: 'offhand',
  rows: [ArmorRow.Shield],
  mitigation: {
    piercing: 1,
    slashing: 1,
    bludgeoning: 1,
  },
  price: 200,
  weight: 3,
};

export const ArmorBreastplate: BaseArmor = {
  id: 'breastplate',
  names: ['Breastplate'],
  location: 'chest',
  rows: [ArmorRow.Breastplate],
  mitigation: {
    piercing: 4,
    slashing: 4,
    bludgeoning: 4,
  },
  price: 4000,
  weight: 20,
};

export const ArmorPlate: BaseArmor = {
  id: 'plate',
  names: ['Plate'],
  location: 'chest',
  rows: [ArmorRow.Plate],
  mitigation: {
    piercing: 8,
    slashing: 8,
    bludgeoning: 8,
  },
  price: 15000,
  weight: 65,
};

export const BaseArmors = [
  ArmorShield,
  ArmorBuckler,
  ArmorBreastplate,
  ArmorPlate,
];

export const DamageTypePrefixes: Record<DamageType, string[]> = {
  acid: ['Gooey', 'Corroding', 'Erosive', 'Biting'],
  bludgeoning: ['Blunt'],
  cold: ['Stinging', 'Boreal', 'Arctic', 'Icy', 'Numbing'],
  fire: ['Blazing', 'Infernal', 'Devouring', 'Charring', 'Flaming'],
  force: ['Forceful', 'Furious'],
  lightning: ['Voltaic', 'Striking'],
  necrotic: ['Necrotic', 'Pestilent', 'Malignant'],
  piercing: ['Pointy'],
  poison: ['Noxious', 'Toxic', 'Viperous'],
  radiant: ['Angelic', 'Lustrous', 'Brilliant', 'Glittering'],
  slashing: ['Sharp'],
};

export const RarityPrefixes: Record<Rarity, string[]> = {
  common: [
    'Dirty',
    'Misshapen',
    'Smelly',
    'Poor',
    'Blemished',
    'Distorted',
    'Marred',
  ],
  uncommon: [
    'Adequate',
    'Passable',
    'Moderate',
    'Unexceptional',
    'Unremarkable',
    'Average',
    'Proper',
  ],
  rare: [
    'Mastercraft',
    'Pristine',
    'Extravagant',
    'Remarkable',
    'Ornate',
    'Garish',
    'Fancy',
    'Premium',
  ],
  epic: [
    'Incredible',
    'Amazing',
    'Impressive',
    'Fabulous',
    'Marvelous',
    'Phenomenal',
    'Spectacular',
    'Superb',
    'Breathtaking',
  ],
  legendary: [
    'Legendary',
    'Godlike',
    'Mythical',
    'Unbelievable',
    'Inconceivable',
  ],
};
