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
  Thunder = 12,
  Force = 13,
  Poison = 14,
  Radiant = 15,
  Necrotic = 16,
}
