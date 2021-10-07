/* eslint-disable import/extensions */
import { fromBase62 } from '../helpers/base62';
import { randomItem } from '../helpers/equipment';
import { PRNG } from '../helpers/prng';
import { Character } from './character';
import { Dungeon } from './dungeon';
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

  constructor(session: string) {
    this.session = session;
    this.character = new Character();
    this.prng = new PRNG(session);
    this.t0 = fromBase62(session);
    this.t1 = Math.ceil(this.t0 / TICK_MS) * TICK_MS;
    this.lastHandled = 0;

    this.dungeon = new Dungeon(this.prng, 48); // Apparently 48 is some kind of minimum, because it hangs on lower
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

    const current = ++this.lastHandled;
    return {
      summary,
      current,
      max,
    };
  }
}
