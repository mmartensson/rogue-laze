import { PRNG } from '../helpers/prng.js';

/*
 * Algoithm to try out:
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

const ROOM_DIMENSIONS = [
  [1, 1, 3, 10], // North/South corridor
  [3, 10, 1, 1], // East/West corridor
  [2, 4, 2, 4], // Small room
  [4, 6, 4, 6], // Medium room
  [6, 10, 6, 10], // Large room
];

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle extends Point {
  w: number;
  h: number;
}

type Quad = number[];

export type Direction = 'north' | 'south' | 'west' | 'east';
export type Directions = Set<Direction>;

// FIXME: Should be a typescript-y way of creating Direction based on the strings in the DIRECTIONS array
export const DIRECTIONS: Direction[] = ['north', 'south', 'west', 'east'];

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

export interface Corridor {
  coordinates: Point[];
}

export type ConnectionType = 'passage' | 'door' | 'locked-door';

export const CONNECTION_TYPES: ConnectionType[] = [
  'passage',
  'door',
  'locked-door',
];

export interface Connection {
  point: Point;
  room: Room | 'exit';
  type: ConnectionType;
  direction: Direction;
}

// NOTE: A room should really be a collection of rectangles, allowing for irregular shapes; maybe a future consideration
export interface Room extends Rectangle {
  index: number;
  connections: Connection[];

  // Relative or absolute coordinates?
  traps: Point[];
  items: Point[];
  enemies: Point[];
}

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

export class Dungeon {
  mapSize = 32;
  prng: PRNG;

  map: number[][];
  rooms: Room[];
  corridors: Corridor[];
  startingRoom: Room;

  constructor(prng: PRNG) {
    this.prng = prng;
    this.map = [];
    this.rooms = [];
    this.corridors = [];

    for (let x = 0; x < this.mapSize; x++) {
      this.map[x] = [];
      for (let y = 0; y < this.mapSize; y++) {
        this.map[x][y] = 0;
      }
    }

    this.placeStartingRoom();

    // The maxRooms now also includes corridors, we should break this code out and handle separately
    const maxRooms = prng.between(20, 30);
    const maxPlacementFailures = prng.between(20, 100);

    let placementFailures = 0;

    while (
      this.rooms.length <= maxRooms &&
      placementFailures < maxPlacementFailures
    ) {
      const room = {} as Room;

      room.connections = [];

      const [minWidth, maxWidth, minHeight, maxHeight] =
        prng.pick(ROOM_DIMENSIONS);

      // Creating a randomly sized room anywhere on the map
      room.w = prng.between(minWidth, maxWidth);
      room.h = prng.between(minHeight, maxHeight);
      room.x = prng.between(1, this.mapSize - room.w - 1);
      room.y = prng.between(1, this.mapSize - room.h - 1);

      // Does it collide with an existing room? If so, discard the attempt.
      if (this.collidingRooms(room).length > 0) {
        placementFailures++;
        continue;
      }

      placementFailures = 0;
      room.index = this.rooms.length;
      this.rooms.push(room);
    }

    // Fill out the rooms themselves on the map; allowing easy check if a given coordinate is inside a room
    // ... but mostly helps with the canvas rendering; we might get rid of the map when that is gone.
    this.rooms.forEach((room) => {
      for (let x = room.x; x < room.x + room.w; x++) {
        for (let y = room.y; y < room.y + room.h; y++) {
          this.map[x][y] = 1;
        }
      }
    });

    // Find corridors/doors between rooms, marking them on the map
    this.rooms.forEach((roomA) => {
      const roomB = this.closestRoom(roomA);
      if (roomB == null) return;

      // FIXME: Could use a better algorithm for this. Often get two corridors going in parallel.
      // Wide corridors/hallways are fine, as long as they count as one. We are going to want to
      // be able to describe rooms and corridors using text.

      const pointA: Point = {
        x: prng.between(roomA.x, roomA.x + roomA.w),
        y: prng.between(roomA.y, roomA.y + roomA.h),
      };
      const pointB: Point = {
        x: prng.between(roomB.x, roomB.x + roomB.w),
        y: prng.between(roomB.y, roomB.y + roomB.h),
      };

      const corridor: Corridor = { coordinates: [] };
      while (pointB.x != pointA.x || pointB.y != pointA.y) {
        if (pointB.x != pointA.x) {
          if (pointB.x > pointA.x) pointB.x--;
          else pointB.x++;
        } else if (pointB.y != pointA.y) {
          if (pointB.y > pointA.y) pointB.y--;
          else pointB.y++;
        }

        const current = this.map[pointB.x][pointB.y];
        if (current == 0) {
          this.map[pointB.x][pointB.y] = 2;
          corridor.coordinates.push({ ...pointB });
        }
      }
      this.corridors.push(corridor);
    });
  }

  closestRoom(rect: Rectangle): Room {
    let closest: Room | null = null;
    let closestDistance = 1000;

    this.rooms.forEach((room) => {
      // If the rectangle is itself a registered room then we should not measure the distance to itself
      if (room === rect) return;

      const d = rectangleDistance(rect, room);
      if (d < closestDistance) {
        closestDistance = d;
        closest = room;
      }
    });

    if (!closest) throw new Error('Failed to find the closest room');

    return closest;
  }

  collidingRooms(rect: Rectangle) {
    return this.rooms.filter((room) => {
      // If the rectangle is itself a registered room then it does not collide with itself
      if (room === rect) return false;

      return relativeDirections(rect, room).size == 0;
    });
  }

  placeStartingRoom() {
    const { prng } = this;
    const startingDirection = prng.pick(DIRECTIONS);
    let startingPoint: Point;
    switch (startingDirection) {
      case 'north':
        startingPoint = { y: 0, x: prng.between(0, this.mapSize) };
        break;
      case 'south':
        startingPoint = { y: this.mapSize, x: prng.between(0, this.mapSize) };
        break;
      case 'west':
        startingPoint = { x: 0, y: prng.between(0, this.mapSize) };
        break;
      case 'east':
        startingPoint = { x: this.mapSize, y: prng.between(0, this.mapSize) };
        break;
    }

    const type = prng.pick(CONNECTION_TYPES);
    const startingRoom = this.attemptRoom({
      type,
      direction: inverseDirection(startingDirection),
      room: 'exit',
      point: startingPoint,
    });

    console.log('FIRST ROOM', startingRoom);
    if (!startingRoom) throw new Error('Failed to create first room');

    this.startingRoom = startingRoom;
    this.rooms.push(startingRoom);
  }

  attemptRoom(connection: Connection) {
    const { prng } = this;

    const room = { connections: [connection] } as Room;

    for (let attempt = 0; attempt < 10; attempt++) {
      const [minWidth, maxWidth, minHeight, maxHeight] =
        prng.pick(ROOM_DIMENSIONS);

      room.w = prng.between(minWidth, maxWidth);
      room.h = prng.between(minHeight, maxHeight);

      const [cpx, cpy] = [connection.point.x, connection.point.y];

      switch (connection.direction) {
        case 'north':
          room.x = prng.between(cpx - room.w + 1, cpx + room.w - 1);
          room.y = connection.point.y - room.h - 1;
          break;
        case 'south':
          room.x = prng.between(cpx - room.w + 1, cpx + room.w - 1);
          room.y = connection.point.y + 1;
          break;
        case 'west':
          room.y = prng.between(cpy - room.h + 1, cpy + room.h - 1);
          room.x = connection.point.x - room.w - 1;
          break;
        case 'east':
          room.y = prng.between(cpy - room.h + 1, cpy + room.h - 1);
          room.x = connection.point.x + 1;
          break;
      }

      if (this.collidingRooms(room).length == 0) {
        return room;
      }
    }

    return null;
  }
}
