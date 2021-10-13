import type { Snapshot } from "./snapshot";

export interface InitMessage {
  type: 'init',
  session: string
}

export interface FastForwardProgressMessage {
  type: 'fast-forward-progress';
  currentTick: number;
  maximumTick: number;
  snapshot: Snapshot;
}

export interface TickProgressMessage {
  type: 'tick-progress';
  currentTick: number;
  snapshot: Snapshot;
}

export type UiOriginMessage = InitMessage;
export type GameLoopOriginMessage = FastForwardProgressMessage | TickProgressMessage;