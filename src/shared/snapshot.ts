import type { Character } from "./character";
import type { Point } from "./geometry";
import type { Room } from "./room";

export interface Snapshot {
  character: Character;
  mapSize?: number;
  location?: Point;
  rooms?: Room[];
}