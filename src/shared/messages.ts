import type { Character } from "./character";

export interface InitMessage {
  type: 'init',
  session: string
}

export interface FastForwardProgressMessage {
  type: 'fast-forward-progress';
  currentTick: number;
  maximumTick: number;
}

export interface TickProgressMessage {
  type: 'tick-progress';
  currentTick: number;
  character: Character;
}

export type UiOriginMessage = InitMessage;
export type GameLoopOriginMessage = FastForwardProgressMessage | TickProgressMessage;