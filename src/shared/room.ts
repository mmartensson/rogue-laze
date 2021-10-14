import type { Connection } from "./connection";
import type { Entity } from "./entity";
import type { Rectangle } from "./geometry";

export interface Room extends Rectangle {
  index: number;
  connections: Connection[];
  entities: Entity[];
  visited: boolean;
  name?: string;
}