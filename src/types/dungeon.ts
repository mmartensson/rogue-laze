/**
 * Based on logic found on
 * https://jsfiddle.net/bigbadwaffle/YeazH/
 *
 * Very nearly replaced everything at this point :)
 */

import { PRNG } from '../helpers/prng.js';

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

type Direction = 'top' | 'bottom' | 'left' | 'right';
type Directions = Set<Direction>;

export interface Corridor {
  coordinates: Point[];
}

// NOTE: A room should really be a collection of rectangles, allowing for irregular shapes; maybe a future consideration
export interface Room extends Rectangle {
  index: number;

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
  if (to.x + to.w <= from.x) directions.add('left');
  if (from.x + from.w <= to.x) directions.add('right');
  if (to.y + to.h <= from.y) directions.add('top');
  if (from.y + from.h <= to.y) directions.add('bottom');

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

  if (dirs.has('top') && dirs.has('left')) return distance(x1, y1b, x2b, y2);
  else if (dirs.has('left') && dirs.has('bottom'))
    return distance(x1, y1, x2b, y2b);
  else if (dirs.has('bottom') && dirs.has('right'))
    return distance(x1b, y1, x2, y2b);
  else if (dirs.has('right') && dirs.has('top'))
    return distance(x1b, y1b, x2, y2);
  else if (dirs.has('left')) return x1 - x2b;
  else if (dirs.has('right')) return x2 - x1b;
  else if (dirs.has('bottom')) return y1 - y2b;
  else if (dirs.has('top')) return y2 - y1b;
  else return 0;
};

export class Dungeon {
  map: number[][];
  mapSize = 32;
  rooms: Room[];
  corridors: Corridor[];
  startRoom: Room;

  constructor(prng: PRNG) {
    this.map = [];
    this.rooms = [];
    this.corridors = [];

    for (let x = 0; x < this.mapSize; x++) {
      this.map[x] = [];
      for (let y = 0; y < this.mapSize; y++) {
        this.map[x][y] = 0;
      }
    }

    // The maxRooms now also includes corridors, we should break this code out and handle separately
    const maxRooms = prng.between(20, 30);
    const maxPlacementFailures = prng.between(20, 100);

    let placementFailures = 0;

    let startRoom: Room | null = null;

    while (
      this.rooms.length <= maxRooms &&
      placementFailures < maxPlacementFailures
    ) {
      const room = {} as Room;

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

      if (startRoom) {
        if (
          room.y < startRoom.y ||
          (room.y === startRoom.y && room.h < startRoom.h)
        ) {
          startRoom = room;
        }
      } else {
        startRoom = room;
      }
    }

    if (startRoom === null) throw new Error('Failed to create a starting room');

    this.startRoom = startRoom;

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

    this.generateLongCorridors();
  }

  // FIXME: Over-engineered and silly
  generateLongCorridors() {
    const maxCount = 3;
    let count = 0;
    const connected = new Set<number>();

    this.rooms.forEach((roomA, indexA) => {
      this.rooms.forEach((roomB, indexB) => {
        if (count >= maxCount) return;

        if (indexA === indexB) return;

        if (connected.has(indexA)) return;

        if (connected.has(indexB)) return;

        const [dir, unwanted] = relativeDirections(roomA, roomB);
        // Not accessible via straight line?
        if (unwanted) return;

        const dist = ~~rectangleDistance(roomA, roomB);
        // Not long enough?
        if (dist < 5) return;

        console.log(`Between ${indexA} and ${indexB}`, dir, dist);

        let rect;
        switch (dir) {
          case 'left': {
            const top = Math.max(roomA.y, roomB.y);
            // const bottom = Math.min(roomA.y + roomA.h, roomB.y + roomB.h);
            // ... make multiple attempts of y between top and bottom
            // ... can probably create a 'span' which is how much we can change,
            // and a 'coord' which is 'x' or 'y' and have the loop below.
            const y = top;
            rect = {
              x: roomA.x - dist,
              y,
              w: dist,
              h: 1,
            };
            break;
          }
          case 'right': {
            const y = Math.max(roomA.y, roomB.y);
            rect = {
              x: roomA.x + roomA.w,
              y,
              w: dist,
              h: 1,
            };
            break;
          }
          case 'top': {
            const x = Math.max(roomA.x, roomB.x);
            rect = {
              x,
              y: roomA.y - dist,
              w: 1,
              h: dist,
            };
            break;
          }
          case 'bottom': {
            const x = Math.max(roomA.x, roomB.x);
            rect = {
              x,
              y: roomA.y + roomA.h,
              w: 1,
              h: dist,
            };
            break;
          }
        }

        const collisions = this.collidingRooms(rect);
        console.log('Collisions', rect, collisions);

        for (let x = rect.x; x < rect.x + rect.w; x++) {
          for (let y = rect.y; y < rect.y + rect.h; y++) {
            this.map[x][y] = 3;
          }
        }

        connected.add(indexA);
        connected.add(indexB);

        count++;
      });
    });

    console.log('COUNT', count);
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
}
