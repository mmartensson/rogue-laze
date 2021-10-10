/* eslint-disable import/extensions */
import { fromBase62 } from '../helpers/base62';
import { randomItem } from '../helpers/equipment';
import { PRNG } from '../helpers/prng';
import { Character } from './character';
import {
  Connection,
  Dungeon,
  Entity,
  facingConnection,
  Point,
  Room,
} from './dungeon';
import { MAX_LEVEL } from './equipment';

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

// FIXME: Really really need to clean up the directory structure

export class Game {
  session: string;
  character: Character;
  dungeon?: Dungeon;
  prng: PRNG;
  t0: EpochMs; // Exact session start time
  t1: EpochMs; // Time of first tick; after t0 and divisible by TICK_MS
  lastHandled: Ticks;
  timeOfDeath?: Ticks;
  scheduled?: NodeJS.Timeout;

  lastAction: Action = 'return-to-town';
  lastConnection?: Connection;
  lastEntity?: Entity;
  currentRoom?: Room;

  constructor(session: string) {
    this.session = session;
    this.character = new Character();
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

      if (ts < tc) {
        resolve(this.tick());
        return;
      }

      const timeout = ts - tc;
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
    // or get rid of the minor-success style summaries.
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
      this.character.addItem(randomItem(this.prng, this.character.level));
    }

    this.approachRemainingEntity() || this.approachConnection();
  }

  haveReturnedToTown() {
    this.sellInventory() || this.visitNewDungeon();
  }

  moveTo(point: Point) {
    if (this.dungeon) {
      this.dungeon.location = point;
    } else {
      console.warn('Movement requested without an active dungeon');
    }
  }

  visitNewDungeon() {
    this.dungeon = new Dungeon(this.prng);
    this.lastConnection = this.dungeon.startingConnection;
    this.currentRoom = this.dungeon.startingRoom;
    this.currentRoom.visited = true;
    this.lastAction = 'traverse-connection';
  }

  traverseConnection() {
    if (!this.lastConnection || this.lastConnection.room === 'exit') {
      this.returnToTown();
      return;
    }

    const nextRoom = this.lastConnection.room;
    const matchingConnection = nextRoom.connections.find(
      (c) => c.room === this.currentRoom
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
    this.dungeon = undefined;
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

    this.character.sellInventory();
    return true;
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
      console.log('HEADING FOR NON NOM!', entity);
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
      console.log('ONLY ONE WAY TO GO!');
      return all[0];
    }

    // Trying to find something new and exciting
    const unvisited = all.filter((c) => c.room != 'exit' && !c.room.visited);
    if (unvisited.length > 0) {
      console.log('PICKING A FRESH ROOM!', unvisited);
      return this.prng.pick(unvisited);
    }

    const notBack = all.filter((c) => c !== this.lastConnection);
    if (notBack.length === 0) {
      throw new Error('No way to go but back; should have been handled above');
    }

    console.log('REVISITING AN OLD ROOM!', notBack);

    return this.prng.pick(notBack);
  }
}
