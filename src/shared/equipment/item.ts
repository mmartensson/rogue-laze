export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

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

export interface BaseItem {
    id: string;
    names: string[];
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