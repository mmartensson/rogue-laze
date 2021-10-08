/**
 * Based on logic found on
 * https://jsfiddle.net/bigbadwaffle/YeazH/
 *
 * Very nearly replaced everything at this point :)
 */

import { PRNG } from '../helpers/prng.js';

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle extends Point {
  w: number;
  h: number;
}

type Quad = number[];

interface Directions {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export interface Corridor {
  coordinates: Point[];
}

// NOTE: A room should really be a collection of rectangles, allowing for irregular shapes; maybe a future consideration
export interface Room extends Rectangle {
  // Relative or absolute coordinates?
  traps: Point[];
  items: Point[];
  enemies: Point[];
}

export const relativeDirections = (
  from: Rectangle,
  to: Rectangle
): Directions => {
  return {
    left: to.x + to.w < from.x,
    right: from.x + from.w < to.x,
    bottom: to.y + to.h < from.y,
    top: from.y + from.h < to.y,
  };
};

export const distance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const a = x2 - x1;
  const b = y2 - y1;
  return Math.sqrt(a * a + b * b);
};

export const rectangleToQuad = (rect: Rectangle): Quad => {
  return [rect.x, rect.y, rect.x + rect.w, rect.y + rect.h];
};

export const rectangleDistance = (from: Rectangle, to: Rectangle): number => {
  const { top, bottom, left, right } = relativeDirections(from, to);

  const [x1, y1, x1b, y1b] = rectangleToQuad(from);
  const [x2, y2, x2b, y2b] = rectangleToQuad(to);

  if (top && left) return distance(x1, y1b, x2b, y2);
  else if (left && bottom) return distance(x1, y1, x2b, y2b);
  else if (bottom && right) return distance(x1b, y1, x2, y2b);
  else if (right && top) return distance(x1b, y1b, x2, y2);
  else if (left) return x1 - x2b;
  else if (right) return x2 - x1b;
  else if (bottom) return y1 - y2b;
  else if (top) return y2 - y1b;
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

    // A few limits
    const maxRooms = prng.between(10, 20);
    const maxPlacementFailures = prng.between(20, 100);

    const min_size = 2;
    const max_size = 8;

    let placementFailures = 0;

    let startRoom: Room | null = null;

    while (
      this.rooms.length <= maxRooms &&
      placementFailures < maxPlacementFailures
    ) {
      const room = {} as Room;

      // Creating a randomly sized room anywhere on the map
      room.x = prng.between(1, this.mapSize - max_size - 1);
      room.y = prng.between(1, this.mapSize - max_size - 1);
      room.w = prng.between(min_size, max_size);
      room.h = prng.between(min_size, max_size);

      // Does it collide with an existing room? If so, discard the attempt.
      if (this.collidingRooms(room).length > 0) {
        placementFailures++;
        continue;
      }

      placementFailures = 0;
      this.rooms.push(room);

      if (startRoom) {
        if (
          room.y < startRoom.y ||
          (room.y === startRoom.y && room.h < startRoom.h)
        )
          startRoom = room;
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

      return !(
        rect.x + rect.w < room.x ||
        rect.x > room.x + room.w ||
        rect.y + rect.h < room.y ||
        rect.y > room.y + room.h
      );
    });
  }
}
