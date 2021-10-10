/* eslint-disable import/extensions */
import { fromBase62 } from '../helpers/base62';
import { randomItem } from '../helpers/equipment';
import { PRNG } from '../helpers/prng';
import { Character } from './character';
import { Connection, Dungeon, facingConnection } from './dungeon';
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
      const { x, y } = this.dungeon.location;

      // FIXME: Clearly there are more efficient ways of keeping track of the current room
      const [room] = this.dungeon.collidingRooms({ x, y, w: 1, h: 1 });
      room.visited = true;

      // First eat all of the pills... uhm... I mean step into all of the traps and loot all of the stuff
      const entity = room.entities.shift();
      if (entity) {
        if (x == entity.x && y === entity.y) {
          // We are currently on top of the entity... maybe do something fancy
        } else {
          // Walk to the entity (keeping it to ensure it is still rendered)
          this.dungeon.location = { x: entity.x, y: entity.y };
          room.entities.unshift(entity);
          this.lastAction = 'approach-entity';
        }
      } else {
        const arrived = room.connections.find((c) => {
          const f = facingConnection(c);
          return f.x == x && f.y == y;
        });
        let destination: Connection | undefined = undefined;

        if (arrived && this.lastAction !== 'traverse-connection') {
          if (arrived.room === 'exit') {
            // I guess we are leaving? FIXME: Figure this out
          } else {
            destination = arrived.room.connections.find(
              (c) => c.x == arrived.x && c.y == arrived.y
            );
            this.lastAction = 'traverse-connection';
          }
        } else {
          const unvisited = room.connections.find(
            (c) => c.room != 'exit' && !c.room.visited
          );
          if (unvisited) {
            destination = unvisited;
          } else {
            destination = this.prng.pick(room.connections);
          }
          this.lastAction = 'approach-connection';
        }

        if (destination) {
          this.dungeon.location = facingConnection(destination);
        }
      }
    }

    const current = ++this.lastHandled;
    return {
      summary,
      current,
      max,
    };
  }
}
