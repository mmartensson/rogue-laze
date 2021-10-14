import { Direction } from "../shared/direction";
import { ConnectionType } from "../shared/connection";
import { Dungeon, inverseDirection } from "./dungeon";

export const TownDungeon = new Dungeon(null as any, 17, [
  // First room and the connection to the exit are needed to prime the dungeon
  // 0: Main road
  {
    index: 0,
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
]);

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
  })
}

const connection = (a: number, b: number, x: number, y: number, type: ConnectionType, direction: Direction) => {
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
}

room(0,0,  5,3, 'Blacksmith');  // 1
room(6,0,  4,3, 'Armorer');     // 2
room(0,6,  3,5, 'Store');       // 3
room(12,0, 5,2);                // 4: Temple; north section
room(14,3, 3,7, 'Temple');      // 5: Temple; south section

connection(0,1, 2,3,  'door', 'north');
connection(0,2, 8,3,  'door', 'north');
connection(0,3, 1,5,  'door', 'south');
connection(4,5, 15,2, 'passage', 'south');
connection(0,5, 13,4, 'door', 'east');