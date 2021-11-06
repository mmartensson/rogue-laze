import { BaseItem, DamageType, ItemInstanceBase } from "./item";

export type ArmorLocation =
  | 'accessory'
  | 'head'
  | 'neck'
  | 'chest'
  | 'arm'
  | 'leg'
  | 'finger'
  | 'offhand';

export type DamageTypeMitigation = Partial<Record<DamageType, number>>;

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

export interface BaseArmor extends BaseItem {
  location: ArmorLocation;
  rows: ArmorRow[];
  mitigation: DamageTypeMitigation;
}

export function isBaseArmor(item: BaseItem): item is BaseArmor {
  return (item as BaseArmor).mitigation !== undefined;
}

export interface ArmorInstance extends ItemInstanceBase {
  row: ArmorRow;
  mitigation: DamageTypeMitigation;
}

export function isArmorInstance(item: ItemInstanceBase): item is ArmorInstance {
  return !!lookupBaseArmor(item.refId);
}

/*
  Armor TODO:

  Coat

  Cloak
  Bracers
  Ring
  Necklace
  Brooch
  Comb

  Bow
  Headband
  Goggles
*/

export const ArmorShield: BaseArmor = {
  id: 'shield',
  names: ['Shield'],
  location: 'offhand',
  rows: [ArmorRow.Shield],
  mitigation: {
    piercing: 4,
    slashing: 4,
    bludgeoning: 4,
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
    piercing: 2,
    slashing: 2,
    bludgeoning: 2,
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
    piercing: 6,
    slashing: 6,
    bludgeoning: 6,
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
    piercing: 10,
    slashing: 10,
    bludgeoning: 10,
  },
  price: 15000,
  weight: 65,
};

export const ArmorRobe: BaseArmor = {
  id: 'robe',
  names: ['Robe'],
  location: 'chest',
  rows: [ArmorRow.Robe],
  mitigation: {
    slashing: 1,
    piercing: 1,
    fire: 6,
    cold: 6,
    lightning: 6,
  },
  price: 6000,
  weight: 3,
};

export const ArmorJacket: BaseArmor = {
  id: 'jacket',
  names: ['Jacket'],
  location: 'chest',
  rows: [ArmorRow.Jacket1, ArmorRow.Jacket2],
  mitigation: {
    slashing: 2,
    piercing: 2,
    bludgeoning: 2,
  },
  price: 400,
  weight: 2,
};

export const ArmorDress: BaseArmor = {
  id: 'dress',
  names: ['Dress'],
  location: 'chest',
  rows: [ArmorRow.Dress],
  mitigation: {
    slashing: 1,
    piercing: 1,
    bludgeoning: 1,
  },
  price: 100,
  weight: 1,
};

export const ArmorHat: BaseArmor = {
  id: 'hat',
  names: ['Hat'],
  location: 'head',
  rows: [ArmorRow.Hat],
  mitigation: {
    slashing: 1,
  },
  price: 20,
  weight: 0,
};

export const ArmorWizardHat: BaseArmor = {
  id: 'wizardHat',
  names: ['Wizard Hat'],
  location: 'head',
  rows: [ArmorRow.WizardHat],
  mitigation: {
    slashing: 1,
    fire: 1,
    cold: 1,
  },
  price: 100,
  weight: 0,
};

export const ArmorCirclet: BaseArmor = {
  id: 'circlet',
  names: ['Circlet'],
  location: 'head',
  rows: [ArmorRow.Circlet],
  mitigation: {
    radiant: 1,
    necrotic: 1,
    force: 1,
  },
  price: 500,
  weight: 1,
};

export const ArmorHelm: BaseArmor = {
  id: 'helm',
  names: ['Helm'],
  location: 'head',
  rows: [ArmorRow.Helm1, ArmorRow.Helm2],
  mitigation: {
    piercing: 2,
    slashing: 2,
    bludgeoning: 2,
  },
  price: 500,
  weight: 1,
};

export const ArmorGloves: BaseArmor = {
  id: 'gloves',
  names: ['gloves'],
  location: 'arm',
  rows: [ArmorRow.Gloves],
  mitigation: {
    piercing: 1,
    slashing: 1,
  },
  price: 30,
  weight: 0,
};

export const ArmorGauntlets: BaseArmor = {
  id: 'gauntlets',
  names: ['Gauntlets'],
  location: 'arm',
  rows: [ArmorRow.Gauntlets],
  mitigation: {
    piercing: 2,
    slashing: 2,
    bludgeoning: 2,
  },
  price: 400,
  weight: 1,
};

export const ArmorBoots: BaseArmor = {
  id: 'boots',
  names: ['Boots'],
  location: 'leg',
  rows: [ArmorRow.Boots1],
  mitigation: {
    piercing: 1,
    slashing: 1,
  },
  price: 50,
  weight: 0,
};

export const ArmorSabatons: BaseArmor = {
  id: 'sabatons',
  names: ['Sabatons'],
  location: 'leg',
  rows: [ArmorRow.Boots2],
  mitigation: {
    piercing: 2,
    slashing: 2,
    bludgeoning: 2,
  },
  price: 500,
  weight: 0,
};

export const BaseArmors = [
  ArmorShield,
  ArmorBuckler,
  ArmorDress,
  ArmorBreastplate,
  ArmorPlate,
  ArmorRobe,
  ArmorJacket,
  ArmorHat,
  ArmorWizardHat,
  ArmorCirclet,
  ArmorHelm,
  ArmorGloves,
  ArmorGauntlets,
  ArmorBoots,
  ArmorSabatons,
];

export const lookupBaseArmor = (refId: string) =>
  BaseArmors.find((w) => w.id == refId);