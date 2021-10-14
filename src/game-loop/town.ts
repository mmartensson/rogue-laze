import { Dungeon } from "./dungeon";

export const TownDungeon = new Dungeon(null as any, 20, [
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
    w: 12,
    h: 2,
    x: 1,
    y: 4,
  }
]);