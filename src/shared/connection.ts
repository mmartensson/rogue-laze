import type { Direction } from "./direction";
import type { Point } from "./geometry";

export const CONNECTION_TYPES_BASE = [
  'passage',
  'door',
  'locked-door',
] as const;
export type ConnectionType = typeof CONNECTION_TYPES_BASE[number];
export const CONNECTION_TYPES =
  CONNECTION_TYPES_BASE as never as ConnectionType[];

export type RoomRef = number | 'exit';

export interface Connection extends Point {
  roomRef: RoomRef;
  type: ConnectionType;
  direction: Direction;
}