/* eslint-disable import/extensions */
import { BaseItemLookup } from '../helpers/equipment';
import {
  BaseWeapon,
  DamageType,
  DamageTypeMitigation,
  isArmorInstance,
  isBaseArmor,
  isBaseWeapon,
  ItemInstance,
  ItemLocation,
} from './equipment';

const INITIAL_HEALTH = 100;

export class Character {
  equipment: Partial<Record<ItemLocation, ItemInstance>> = {};
  inventory: ItemInstance[] = [];
  maxHealth = INITIAL_HEALTH;
  curHealth = INITIAL_HEALTH;
  coin = 0;
  level = 1;

  // Derived
  totalMitigation: DamageTypeMitigation = {};

  addItem(item: ItemInstance) {
    const base = BaseItemLookup[item.refId];

    if (isBaseWeapon(base)) {
      if (base.location == 'main-1h') {
        const oldMain = this.equipment.main;

        if (oldMain && oldMain.price >= item.price) {
          this.inventory.push(item);
          return;
        }

        this.equipment.main = item;
        if (oldMain) {
          this.inventory.push(oldMain);
        }
      } else if (base.location == 'main-2h') {
        const oldMain = this.equipment.main;
        const oldOffhand = this.equipment.offhand;

        let oldPrice = 0;
        if (oldMain) oldPrice += oldMain.price;
        if (oldOffhand) oldPrice += oldOffhand.price;
        if (oldPrice >= item.price) {
          this.inventory.push(item);
          return;
        }

        this.equipment.main = item;
        if (oldMain) {
          this.inventory.push(oldMain);
        }
        if (oldOffhand) {
          delete this.equipment.offhand;
          this.inventory.push(oldOffhand);
        }
      } else if (base.location == 'offhand') {
        // TODO: Price check

        const oldMain = this.equipment.main;
        const oldOffhand = this.equipment.offhand;
        this.equipment.main = item;
        if (oldMain) {
          const oldMainBase = BaseItemLookup[oldMain.refId];
          const oldMainIsTwoHanded =
            (oldMainBase as BaseWeapon).location == 'main-2h';
          if (oldMainIsTwoHanded) {
            this.inventory.push(item);
            return;
          }
        }
        this.equipment.offhand = item;
        if (oldOffhand) {
          this.inventory.push(oldOffhand);
        }
      } else if (base.location == 'either') {
        // TODO: Price check

        const oldMain = this.equipment.main;
        const oldOffhand = this.equipment.offhand;

        if (oldOffhand) {
          this.equipment.offhand = item;
          this.inventory.push(oldOffhand);
        } else if (oldMain) {
          this.equipment.main = item;
          this.inventory.push(oldMain);
        } else {
          this.equipment.offhand = item;
        }
      }
    } else if (isBaseArmor(base)) {
      const oldArmor = this.equipment[base.location];

      if (oldArmor && oldArmor.price >= item.price) {
        this.inventory.push(item);
        return;
      }

      this.equipment[base.location] = item;
      if (oldArmor) {
        this.inventory.push(oldArmor);
      }

      this.recalcTotalMitigation();
    } else {
      // Other items, just having a monetary value
      this.inventory.push(item);
    }
  }

  sellInventory() {
    this.inventory.forEach((item) => (this.coin += item.price));
    this.inventory = [];
  }

  private recalcTotalMitigation() {
    this.totalMitigation = {};
    for (const item of Object.values(this.equipment)) {
      if (item && isArmorInstance(item)) {
        for (const [damageType, value] of Object.entries(item.mitigation)) {
          const before = this.totalMitigation[damageType as DamageType];
          this.totalMitigation[damageType as DamageType] =
            (before || 0) + (value || 0);
        }
      }
    }
  }
}
