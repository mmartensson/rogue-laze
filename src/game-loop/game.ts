import { fromBase62 } from '../helpers/base62';
import { BaseItemLookup, randomItem } from '../helpers/equipment';
import { PRNG } from '../helpers/prng';
import { Character, createCharacter } from '../shared/character';
import {
  Dungeon,
  facingConnection,
} from './dungeon';

import { MAX_LEVEL, TEMPLE_HEALING_PRICE } from '../shared/constants';
import { ArmorInstance, BaseArmor, BaseWeapon, DamageType, isArmorInstance, isBaseArmor, isBaseWeapon, isWeaponInstance, ItemInstance, ItemLocation, lookupBaseWeapon, WeaponInstance } from '../shared/equipment';
import type { Entity } from '../shared/entity';
import type { Point } from '../shared/geometry';
import type { Connection } from '../shared/connection';
import { Room } from '../shared/room';
import { ArmorerLocation, BlacksmithLocation, StoreLocation, TempleLocation, TownDungeon } from './town';

export const TICK_MS = 5000;

export type EpochMs = number;
export type Ticks = number;

export type TickSummary =
  | 'too-early'
  | 'already-scheduled'
  | 'uneventful'
  | 'minor-success'
  | 'major-success'
  | 'minor-failure'
  | 'major-failure'
  | 'game-ended';

export interface TickEvent {
  summary: TickSummary;
  current?: Ticks;
  max?: Ticks;
}

export type Action =
  | 'approach-connection'
  | 'approach-entity'
  | 'traverse-connection'
  | 'return-to-town';

export class Game {
  session: string;
  character: Character;
  dungeon: Dungeon = TownDungeon;
  prng: PRNG;
  t0: EpochMs; // Exact session start time
  t1: EpochMs; // Time of first tick; after t0 and divisible by TICK_MS
  lastHandled: Ticks;
  timeOfDeath?: Ticks;
  scheduled?: NodeJS.Timeout | 'microtask';

  lastAction: Action = 'return-to-town';
  lastConnection?: Connection;
  lastEntity?: Entity;
  currentRoom?: Room;

  constructor(session: string) {
    this.session = session;
    this.character = createCharacter();
    this.prng = new PRNG(session);
    this.t0 = fromBase62(session);
    this.t1 = Math.ceil(this.t0 / TICK_MS) * TICK_MS;
    this.lastHandled = 0;
  }

  scheduledTick(): Promise<TickEvent> {
    if (this.scheduled) {
      return Promise.resolve({
        summary: 'already-scheduled',
      });
    }

    const tc = +Date.now();

    return new Promise((resolve) => {
      const ts = (this.lastHandled + 1) * TICK_MS + this.t1;

      const timeout = Math.max(ts - tc, 0);
      if (timeout === 0) {
        // Running as a microtask or even immediately is decently fast whereas
        // a setTimeout(, 0) or requestAnimationFrame slows the fast forwarding
        // down to a crawl. Might be a good place for a worker.
        this.scheduled = 'microtask';
        queueMicrotask(() => {
          this.scheduled = undefined;
          resolve(this.tick());
        });
        return;
      }

      this.scheduled = setTimeout(() => {
        this.scheduled = undefined;
        resolve(this.tick());
      }, timeout);
    });
  }

  tick(): TickEvent {
    const tc = +Date.now();
    const max = Math.floor((tc - this.t1) / TICK_MS);

    // Caller should stop ticking
    if (this.timeOfDeath) {
      return {
        summary: 'game-ended',
      };
    }

    // Caller should hold ticking
    if (max === this.lastHandled) {
      return {
        summary: 'too-early',
      };
    }

    // FIXME: Either figure out how to create/forward a summary from the this.have*() functions,
    // or get rid of the minor-success style summaries. Needs to be passed to UI via 
    // the FastForwardProgressMessage.
    const summary: TickSummary = 'uneventful';

    switch (this.lastAction) {
      case 'approach-connection':
        this.haveApproachedConnection();
        break;
      case 'traverse-connection':
        this.haveTraversedConnection();
        break;
      case 'approach-entity':
        this.haveApproachedEntity();
        break;
      case 'return-to-town':
        this.haveReturnedToTown();
        break;
    }

    const current = ++this.lastHandled;
    return {
      summary,
      current,
      max,
    };
  }

  // We are currently at one side of lastConnection, intending to move to the other side
  haveApproachedConnection() {
    // NOTE: At this point we could fail to pick a locked door or something similar
    this.traverseConnection();
  }

  // We have just passed through a connection and are looking for something new to do
  haveTraversedConnection() {
    this.approachRemainingEntity() || this.approachConnection();
  }

  // We have approached an entity, which will likely have some effect depending on its type
  haveApproachedEntity() {
    // FIXME: Implement this properly; this could trigger a mulit-tick fight or similar
    if (this.currentRoom && this.lastEntity) {
      // Simple instant nom nom
      this.currentRoom.entities = this.currentRoom.entities.filter(
        (ent) => ent !== this.lastEntity
      );

      // For now, we always give one item reglardless of type
      this.addItem(randomItem(this.prng, this.character.level));
    }

    this.maybeTeleportToTown() || this.approachRemainingEntity() || this.approachConnection();
  }

  maybeTeleportToTown() {
    const remainingEnemies = this.dungeon.rooms
      .flatMap(room => room.entities)
      .filter(entity => entity.type === 'enemy');
    
    if (remainingEnemies.length === 0) {
      // TODO: Figure out a way to tell the UI to show a fancy teleport animation
      // Maybe just forward the `lastAction` and add a `teleport-to-town` which is
      // followed by `return-to-town`.
      this.returnToTown();
      return true;
    }

    return false;
  }

  haveReturnedToTown() {
    this.dungeon = TownDungeon;
    this.sellInventory() || this.visitTemple() || this.visitNewDungeon();
  }

  moveTo(point: Point) {
    if (this.dungeon) {
      this.dungeon.location = point;
    } else {
      console.warn('Movement requested without an active dungeon');
    }
  }

  visitNewDungeon() {
    // XXX: Just some progress debugging for fast forwarding
    const tc = +Date.now();
    const max = Math.floor((tc - this.t1) / TICK_MS);
    const pct = Math.floor((100 * this.lastHandled) / max);
    console.log(
      `Time for a new dungeon; level: ${this.character.level}; progress: ${pct}%`
    );

    this.dungeon = new Dungeon(this.prng);
    this.lastConnection = this.dungeon.startingConnection;
    this.currentRoom = this.dungeon.startingRoom;
    this.currentRoom.visited = true;
    this.lastAction = 'traverse-connection';
  }

  traverseConnection() {
    if (!this.lastConnection || this.lastConnection.roomRef === 'exit') {
      this.returnToTown();
      return;
    }

    const nextRoom = this.dungeon.rooms[this.lastConnection.roomRef];
    const matchingConnection = nextRoom.connections.find(
      (c) => c.roomRef === this.currentRoom?.index
    );
    if (matchingConnection) {
      this.moveTo(facingConnection(matchingConnection));
      this.currentRoom = nextRoom;
      this.currentRoom.visited = true;
      this.lastConnection = matchingConnection;
      this.lastAction = 'traverse-connection';
      return true;
    } else {
      console.warn(
        'Unexpectedly did not find a matching connection for',
        this.lastConnection
      );
      return false;
    }
  }

  returnToTown() {
    this.dungeon = TownDungeon;
    this.currentRoom = undefined;
    this.lastConnection = undefined;
    this.lastAction = 'return-to-town';

    if (this.character.level < MAX_LEVEL) {
      this.character.level++;
    }
  }

  sellInventory() {
    // NOTE: Intentionally keeping lastAction
    if (this.character.inventory.length == 0) return false;

    if (this.character.inventory.find(item => isWeaponInstance(item))) {
      this.sellWeapons();
    } else if (this.character.inventory.find(item => isArmorInstance(item))) {
      this.sellArmors();
    } else {
      this.sellGeneral();
    }

    this.character.inventory.forEach((item) => (this.character.coin += item.price));
    this.character.inventory = [];

    return true;
  }

  sellWeapons() {
    this.dungeon.location = BlacksmithLocation;
    this.character.inventory = this.character.inventory.filter(item => {
      if (isWeaponInstance(item)) {
        this.character.coin += item.price;
        return false;
      }
      return true;
    });
  }

  sellArmors() {
    this.dungeon.location = ArmorerLocation;
    this.character.inventory = this.character.inventory.filter(item => {
      if (isArmorInstance(item)) {
        this.character.coin += item.price;
        return false;
      }
      return true;
    });
  }

  sellGeneral() {
    this.dungeon.location = StoreLocation;
    this.character.inventory.forEach((item) => (this.character.coin += item.price));
    this.character.inventory = [];
  }

  visitTemple() {
    // NOTE: Intentionally keeping lastAction

    if (this.character.curHealth < this.character.maxHealth) {
      if (this.character.coin >= TEMPLE_HEALING_PRICE) {
        this.character.curHealth = this.character.maxHealth;
        this.character.coin -= TEMPLE_HEALING_PRICE;

        this.dungeon.location = TempleLocation;
        return true;
      }
    }

    return false;
  }

  approachRemainingEntity() {
    if (!this.currentRoom) {
      throw new Error('Unexpectedly had no current room');
    }

    const entity = this.currentRoom.entities[0];
    if (entity) {
      this.moveTo({ x: entity.x, y: entity.y });
      this.lastEntity = entity;
      this.lastAction = 'approach-entity';
      // console.log('HEADING FOR NON NOM!', entity);
      return true;
    }

    return false;
  }

  approachConnection() {
    const connection = this.pickConnection();

    this.moveTo(facingConnection(connection));
    this.lastConnection = connection;
    this.lastAction = 'approach-connection';

    return true;
  }

  pickConnection() {
    if (!this.currentRoom) {
      throw new Error('Unexpectedly had no current room');
    }

    const all = this.currentRoom.connections;

    // Only one choice; let's go back
    if (all.length === 1) {
      // console.log('ONLY ONE WAY TO GO!');
      return all[0];
    }

    // Trying to find something new and exciting
    const unvisited = all.filter((c) => c.roomRef != 'exit' && !this.dungeon.rooms[c.roomRef].visited);
    if (unvisited.length > 0) {
      // console.log('PICKING A FRESH ROOM!', unvisited);
      return this.prng.pick(unvisited);
    }

    const notBack = all.filter((c) => c !== this.lastConnection);
    if (notBack.length === 0) {
      throw new Error('No way to go but back; should have been handled above');
    }

    // console.log('REVISITING AN OLD ROOM!', notBack);

    return this.prng.pick(notBack);
  }

  // Typically called with one location, but if a second is passed along (main/offhand) then
  // that is also considered for pricing and cleared as needed.
  offerReplacement(item: ItemInstance, ...locations: ItemLocation[]): boolean {
    const { equipment, inventory } = this.character;

    let origPrice = 0;
    locations.forEach(loc => {
      const origItem = equipment[loc];
      if (origItem) {
        origPrice += origItem.price;
      }
    });

    console.log('offerReplacement', item.price, origPrice, ...locations, item);

    if (item.price <= origPrice) {
      return false;
    }

    locations.forEach(loc => {
      const origItem = equipment[loc];
      if (origItem) {
        delete equipment[loc];
        inventory.unshift(origItem);
      }
    });

    equipment[locations[0]] = item;

    return true;
  }

  currentlyHoldingTwoHanded(): boolean {
    return lookupBaseWeapon(this.character.equipment.main?.refId || '-')?.location === 'main-2h';
  }

  // NOTE: As soon as we've picked up a good two handed weapon, it is near impossible to go back to 
  // 1h+offhand since we only get one piece at a time.

  addWeapon(base: BaseWeapon, item: WeaponInstance) {
    const { inventory } = this.character;

    if (base.location === 'main-1h') {
      this.offerReplacement(item, 'main') || inventory.unshift(item);
    } else if (base.location === 'main-2h') {
      this.offerReplacement(item, 'main', 'offhand') || inventory.unshift(item);
    } else if (base.location === 'offhand') {
      if (this.currentlyHoldingTwoHanded()) {
        this.offerReplacement(item, 'offhand', 'main') || inventory.unshift(item);
      } else {
        this.offerReplacement(item, 'offhand') || inventory.unshift(item);
      }
    } else if (base.location === 'either') {
      if (!this.offerReplacement(item, 'main')) {
        if (this.currentlyHoldingTwoHanded()) {
          this.offerReplacement(item, 'offhand', 'main') || inventory.unshift(item);
        } else {
          this.offerReplacement(item, 'offhand') || inventory.unshift(item);
        }
      }
    }
  }

  addArmor(base: BaseArmor, item: ArmorInstance) {
    const { inventory } = this.character;

    if (base.location === 'offhand') {
      if (this.currentlyHoldingTwoHanded()) {
        this.offerReplacement(item, 'offhand', 'main') || inventory.unshift(item);
      } else {
        this.offerReplacement(item, 'offhand') || inventory.unshift(item);
      }
    } else {
      this.offerReplacement(item, base.location) || inventory.unshift(item);
    }

    this.recalcTotalMitigation();
  }

  addItem(item: ItemInstance) {
    const base = BaseItemLookup[item.refId];

    if (isBaseWeapon(base)) {
      this.addWeapon(base, item as WeaponInstance);
    } else if (isBaseArmor(base)) {
      this.addArmor(base, item as ArmorInstance);
    } else {
      // Other items, just having a monetary value
      this.character.inventory.unshift(item);
    }
  }

  private recalcTotalMitigation() {
    this.character.totalMitigation = {};
    for (const item of Object.values(this.character.equipment)) {
      if (item && isArmorInstance(item)) {
        for (const [damageType, value] of Object.entries(item.mitigation)) {
          const before = this.character.totalMitigation[damageType as DamageType];
          this.character.totalMitigation[damageType as DamageType] =
            (before || 0) + (value || 0);
        }
      }
    }
  }
}
