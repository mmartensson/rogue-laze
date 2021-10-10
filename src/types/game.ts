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
  | 'traverse-connection';

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

  lastAction: Action = 'traverse-connection';
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

    this.dungeon = new Dungeon(this.prng);
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
        const tt = +Date.now();
        // console.log(`Waited ${timeout} ms at ${tc} with the goal of reaching ${ts}, ended up at ${tt}`);
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

    let summary: TickSummary = 'uneventful';

    // XXX: Example game logic... need to figure out the real ones later

    if (this.character.level < MAX_LEVEL) {
      if (this.prng.fraction() > 0.999) {
        this.character.level++;
      }
    }

    if (this.character.inventory.length > 20) {
      this.character.sellInventory();
    } else if (this.prng.fraction() > 0.5) {
      this.character.addItem(randomItem(this.prng, this.character.level));
      summary = 'minor-success';
    }

    // FIXME: Currently getting stuck if two connections shae the same facingConnection() Point;
    // so rather than blocking this.lastAction == 'traverse-connection' we should try to make
    // it really unlikely that the character goes back through that same connection.

    if (this.dungeon) {
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
      }
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
    if (!this.dungeon) {
      throw new Error('Unexpectedly had no dungeon');
    }

    if (!this.lastConnection || !this.currentRoom) {
      // Initializing state for a brand new dungeon
      this.lastConnection = this.dungeon.startingConnection;
      this.currentRoom = this.dungeon.startingRoom;
      this.currentRoom.visited = true;
    }

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
    }

    this.approachRemainingEntity() || this.approachConnection();
  }

  moveTo(point: Point) {
    if (this.dungeon) {
      this.dungeon.location = point;
    } else {
      console.warn('Movement requested without an active dungeon');
    }
  }

  traverseConnection() {
    if (!this.lastConnection || this.lastConnection.room === 'exit') {
      console.warn('Approached the exit; currently not handled');
      return false;
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
