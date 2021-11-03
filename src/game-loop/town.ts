import { Direction } from "../shared/direction";
import { ConnectionType } from "../shared/connection";
import { Dungeon, inverseDirection } from "./dungeon";
import { Point } from "../shared/geometry";

const MainRoad = 0;
export const TownDungeon = new Dungeon(null as any, 17, [
  // First room and the connection to the exit are needed to prime the dungeon
  // 0: Main road
  {
    index: MainRoad,
    connections: [{
      x: 0,
      y: 4,
      roomRef: 'exit',
      type: 'passage',
      direction: 'west'
    }],
    visited: true,
    entities: [],
    x: 1,
    y: 4,
    w: 12,
    h: 1,
  }
], 'town');

// NOTE: May want to move these out for reuse, should we have other manually generated dungeons

const room = (x: number, y: number, w: number, h: number, name?: string) => {
  const index = TownDungeon.rooms.length;
  TownDungeon.rooms.push({
    index,
    x, y, w, h,
    connections: [],
    entities: [],
    visited: true,
    name
  });
  return index;
}

const connection = (a: number, b: number, x: number, y: number, type: ConnectionType, direction: Direction): Point => {
  const ra = TownDungeon.rooms[a];
  const rb = TownDungeon.rooms[b];

  const base = {
    x, y, type
  }

  ra.connections.push({
    ...base,
    roomRef: b,
    direction
  });
  rb.connections.push({
    ...base,
    roomRef: a,
    direction: inverseDirection(direction)
  });

  return { x, y };
}

const Blacksmith    = room(0,0,  5,3, 'Blacksmith');
const Armorer       = room(6,0,  4,3, 'Armorer');
const Store         = room(0,6,  3,5, 'Store');
const TempleNorth   = room(12,0, 5,2);
const TempleSouth   = room(14,3, 3,7, 'Temple');

export const BlacksmithLocation = connection(MainRoad,Blacksmith,     2,3,  'door',     'north');
export const ArmorerLocation    = connection(MainRoad,Armorer,        8,3,  'door',     'north');
export const StoreLocation      = connection(MainRoad,Store,          1,5,  'door',     'south');
                                  connection(TempleNorth,TempleSouth, 15,2, 'passage',  'south');
export const TempleLocation     = connection(MainRoad,TempleSouth,    13,4, 'door',     'east');