import { PRNG } from '../helpers/prng.js';
import { Connection, CONNECTION_TYPES } from '../shared/connection.js';
import { Direction, DIRECTIONS, Directions } from '../shared/direction.js';
import { DungeonType } from '../shared/dungeon.js';
import { ENTITY_TYPES } from '../shared/entity.js';
import type { Point, Rectangle } from '../shared/geometry.js';
import type { Room } from '../shared/room.js';

// TODO: Should pass along 'dungeon'|'town'|'encounter' -ish to the Snapshot; if the type is changed, the UI will know that
// the whole map was in fact replaced. A simple heading can also be rendered. Alternatively, we can randomize
// something like 'Mansion of the Dastardly Barnacle' | 'Tiny Hamlet' | '4 Angry Wasps'.

/*
 * Current algorithm:
 *
 * 1. Pick a starting point at the edge of the map, add an entry (may allow different types; eg. passageway/open/closed/locked/blocked)
 * 2. Add a random rectangular room (which includes hallway/corridor) that connects with the first door.
 * 3. Pick a point at the edge of the last successful room and move one step outwards.
 * 4. Attempt to place a door and a random room connecting to it.
 * 5. After repeated failed attempts att placing down a new door and room, go back to room N and try again from there; N starts off
 *    as the first room and for each time we fail to place a room, N increases increases to allow for a better spread.
 * 6. When every room has had a chance to get additional rooms created from it, we move on to adding additional entries between
 *    existing rooms.
 * 7. For each room, determine if there is a direct neighbouring room (meaning one squares worth of separation) that currently
 *    has no connection to it. Pick a valid spot and add an entry.
 */

// min/max width, min/max height
const ROOM_DIMENSIONS = [
  [1, 1, 3, 10], // North/South corridor
  [3, 10, 1, 1], // East/West corridor
  [2, 3, 2, 3], // Tiny room
  [3, 5, 3, 5], // Small room
  [4, 6, 4, 6], // Medium room
  [6, 10, 6, 10], // Large room
  [8, 16, 8, 16], // Huge room
];

type Quad = number[];

export const inverseDirection = (direction: Direction): Direction => {
  switch (direction) {
    case 'north':
      return 'south';
    case 'south':
      return 'north';
    case 'west':
      return 'east';
    case 'east':
      return 'west';
  }
};

export const relativeDirections = (
  from: Rectangle,
  to: Rectangle
): Directions => {
  const directions = new Set<Direction>();
  if (to.x + to.w <= from.x) directions.add('west');
  if (from.x + from.w <= to.x) directions.add('east');
  if (to.y + to.h <= from.y) directions.add('north');
  if (from.y + from.h <= to.y) directions.add('south');

  return directions;
};

export const distance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const a = x2 - x1;
  const b = y2 - y1;
  return Math.abs(Math.sqrt(a * a + b * b));
};

export const rectangleToQuad = (rect: Rectangle): Quad => {
  return [rect.x, rect.y, rect.x + rect.w, rect.y + rect.h];
};

export const rectangleDistance = (from: Rectangle, to: Rectangle): number => {
  const dirs = relativeDirections(from, to);

  const [x1, y1, x1b, y1b] = rectangleToQuad(from);
  const [x2, y2, x2b, y2b] = rectangleToQuad(to);

  if (dirs.has('north') && dirs.has('west')) return distance(x1, y1b, x2b, y2);
  else if (dirs.has('west') && dirs.has('south'))
    return distance(x1, y1, x2b, y2b);
  else if (dirs.has('south') && dirs.has('east'))
    return distance(x1b, y1, x2, y2b);
  else if (dirs.has('east') && dirs.has('north'))
    return distance(x1b, y1b, x2, y2);
  else if (dirs.has('west')) return x1 - x2b;
  else if (dirs.has('east')) return x2 - x1b;
  else if (dirs.has('south')) return y1 - y2b;
  else if (dirs.has('north')) return y2 - y1b;
  else return 0;
};

export const facingConnection = (connection: Connection): Point => {
  const { x, y } = connection;
  switch (connection.direction) {
    case 'north':
      return { x, y: y + 1 };
    case 'south':
      return { x, y: y - 1 };
    case 'west':
      return { x: x + 1, y };
    case 'east':
      return { x: x - 1, y };
  }
  throw new Error('Unexpected direction in connection: ' + connection.direction);
};

export class Dungeon {
  // NOTE: Keeping mapSize as a property rather than a constant to allow us small, medium, and large dungeons in the future
  // (ROOM_DIMENSIONS will need to be updated to match).
  mapSize: number;
  prng: PRNG;
  rooms: Room[];
  location: Point;
  type: DungeonType;

  constructor(prng: PRNG, mapSize=20, rooms: null|Room[] = null, type: DungeonType = 'dungeon') {
    this.prng = prng;
    this.mapSize = mapSize;
    this.type = type;

    if (rooms === null) {
      this.rooms = [];
      this.startGeneration();
    } else {
      this.rooms = rooms;
    }

    this.location = facingConnection(this.startingConnection);
  }

  get startingRoom() {
    return this.rooms[0];
  }

  get startingConnection() {
    return this.startingRoom.connections[0];
  }

  collidingRooms(rect: Rectangle) {
    return this.rooms.filter((room) => {
      // If the rectangle is itself a registered room then it does not collide with itself
      if (room === rect) return false;

      return relativeDirections(rect, room).size == 0;
    });
  }

  collidingConnections(rect: Rectangle) {
    return this.rooms
      .flatMap((room) => room.connections)
      .filter((conn) => {
        const { x, y } = conn;
        return (
          x >= rect.x &&
          x <= rect.x + rect.w &&
          y >= rect.y &&
          y <= rect.y + rect.h
        );
      });
  }

  startGeneration() {
    const { prng } = this;

    for (let attempt = 0; attempt < 10; attempt++) {
      const startingDirection = prng.pick(DIRECTIONS);
      let startingPoint: Point;
      switch (startingDirection) {
        case 'north':
          startingPoint = { y: 0, x: prng.between(0, this.mapSize - 1) };
          break;
        case 'south':
          startingPoint = {
            y: this.mapSize - 1,
            x: prng.between(0, this.mapSize - 1),
          };
          break;
        case 'west':
          startingPoint = { x: 0, y: prng.between(0, this.mapSize) };
          break;
        case 'east':
          startingPoint = {
            x: this.mapSize - 1,
            y: prng.between(0, this.mapSize - 1),
          };
          break;
      }

      const type = prng.pick(CONNECTION_TYPES);
      const startingRoom = this.attemptRoom({
        type,
        direction: startingDirection,
        roomRef: 'exit',
        ...startingPoint,
      });

      if (startingRoom) {
        this.rooms = [startingRoom];
        break;
      }
    }

    if (!this.startingRoom) throw new Error('Failed to create starting room');

    this.generateRooms(0);
  }

  generateRooms(startIndex: number) {
    const { prng } = this;

    let room = this.rooms[startIndex];

    let failures = 0;
    while (failures < 5) {
      const direction = prng.pick(DIRECTIONS);
      let point: Point;

      switch (direction) {
        case 'north':
          point = { y: room.y - 1, x: prng.between(room.x, room.x + room.w) };
          break;
        case 'south':
          point = {
            y: room.y + room.h,
            x: prng.between(room.x, room.x + room.w),
          };
          break;
        case 'west':
          point = { x: room.x - 1, y: prng.between(room.y, room.y + room.h) };
          break;
        case 'east':
          point = {
            x: room.x + room.w,
            y: prng.between(room.y, room.y + room.h),
          };
          break;
      }

      if (this.collidingRooms({ ...point, w: 1, h: 1 }).length > 0) {
        // Point is inside an existing room. Should also maybe check if there is an existing connection at the point
        failures++;
        continue;
      }

      const type = prng.pick(CONNECTION_TYPES);
      const next = this.attemptRoom({
        type,
        direction: inverseDirection(direction),
        roomRef: room.index,
        ...point,
      });

      if (next) {
        this.rooms.push(next);
        room.connections.push({
          type,
          direction,
          roomRef: next.index,
          ...point,
        });
        room = next;
        failures = 0;
      } else {
        failures++;
      }
    }

    if (startIndex < this.rooms.length - 1) {
      this.generateRooms(startIndex + 1);
    }
  }

  attemptRoom(connection: Connection) {
    const { prng } = this;

    const room = { connections: [connection], index: this.rooms.length } as Room;

    for (let attempt = 0; attempt < 5; attempt++) {
      const [minWidth, maxWidth, minHeight, maxHeight] =
        prng.pick(ROOM_DIMENSIONS);

      room.w = prng.between(minWidth, maxWidth);
      room.h = prng.between(minHeight, maxHeight);

      const [cpx, cpy] = [connection.x, connection.y];

      switch (connection.direction) {
        case 'north':
          room.x = prng.between(cpx - room.w + 1, cpx);
          room.y = cpy + 1;
          break;
        case 'south':
          room.x = prng.between(cpx - room.w + 1, cpx);
          room.y = cpy - room.h;
          break;
        case 'west':
          room.y = prng.between(cpy - room.h + 1, cpy);
          room.x = cpx + 1;
          break;
        case 'east':
          room.y = prng.between(cpy - room.h + 1, cpy);
          room.x = cpx - room.w;
          break;
      }

      if (
        room.x < 0 ||
        room.y < 0 ||
        room.x + room.w > this.mapSize ||
        room.y + room.h > this.mapSize
      ) {
        // Outside the map
        continue;
      }

      if (this.collidingConnections(room).length > 0) {
        // Was a connection inside it
        continue;
      }

      if (this.collidingRooms(room).length > 0) {
        // Intersects with another room
        continue;
      }

      // Add some entities to the room
      room.entities = [];
      const maxEntities = Math.min(6, room.w * room.h);
      [...Array(prng.between(0, maxEntities))].forEach(() => {
        const type = prng.pick(ENTITY_TYPES);
        const x = prng.between(room.x, room.x + room.w);
        const y = prng.between(room.y, room.y + room.h);
        if (room.entities.find((e) => e.x === x && e.y === y)) return;
        room.entities.push({
          x,
          y,
          type,
        });
      });

      return room;
    }

    return null;
  }
}
