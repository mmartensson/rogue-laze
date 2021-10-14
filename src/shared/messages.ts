import type { Snapshot } from "./snapshot";

export interface InitMessage {
  type: 'init',
  session: string
}

export interface ShutdownMessage {
  type: 'shutdown'
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

export type UiOriginMessage = InitMessage | ShutdownMessage;
export type GameLoopOriginMessage = FastForwardProgressMessage | TickProgressMessage;