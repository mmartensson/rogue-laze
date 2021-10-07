/**
 * Based on logic found on
 * https://jsfiddle.net/bigbadwaffle/YeazH/
 */

import { PRNG } from '../helpers/prng.js';

interface Coordinate {
  x: number;
  y: number;
}

export interface Room extends Coordinate {
  w: number;
  h: number;
}

export class Dungeon {
  map: number[][];
  map_size: number;
  rooms: Room[];

  constructor(prng: PRNG, map_size = 64) {
    this.map_size = map_size;
    this.map = [];
    this.rooms = [];

    for (let x = 0; x < this.map_size; x++) {
      this.map[x] = [];
      for (let y = 0; y < this.map_size; y++) {
        this.map[x][y] = 0;
      }
    }

    // A few limits
    const room_count = prng.between(10, 20);
    const min_size = 5;
    const max_size = 15;

    for (let i = 0; i < room_count; i++) {
      const room = {} as Room;

      // Creating a randomly sized room anywhere on the map
      room.x = prng.between(1, this.map_size - max_size - 1);
      room.y = prng.between(1, this.map_size - max_size - 1);
      room.w = prng.between(min_size, max_size);
      room.h = prng.between(min_size, max_size);

      // Does it collide with an existing room? If so, discard the attempt.
      if (this.doesCollide(room)) {
        // FIXME: Cleanup this retry logic
        i--;
        continue;
      }
      // Make the room slighly smaller; a bit unclear why
      room.w--;
      room.h--;

      this.rooms.push(room);
    }

    // Clumps all of the rooms up in the north-west corner; does not actually make it look
    // better, but does seem to avoid "islands".
    this.squashRooms();

    // Find corridors/doors between rooms, marking them on the map
    for (let i = 0; i < room_count; i++) {
      const roomA = this.rooms[i];
      const roomB = this.findClosestRoom(roomA);
      if (roomB == null) continue;

      const pointA = {
        x: prng.between(roomA.x, roomA.x + roomA.w),
        y: prng.between(roomA.y, roomA.y + roomA.h),
      };
      const pointB = {
        x: prng.between(roomB.x, roomB.x + roomB.w),
        y: prng.between(roomB.y, roomB.y + roomB.h),
      };

      while (pointB.x != pointA.x || pointB.y != pointA.y) {
        if (pointB.x != pointA.x) {
          if (pointB.x > pointA.x) pointB.x--;
          else pointB.x++;
        } else if (pointB.y != pointA.y) {
          if (pointB.y > pointA.y) pointB.y--;
          else pointB.y++;
        }

        this.map[pointB.x][pointB.y] = 1;
      }
    }

    // Fill out the rooms themselves on the map
    for (let i = 0; i < room_count; i++) {
      const room = this.rooms[i];
      for (let x = room.x; x < room.x + room.w; x++) {
        for (let y = room.y; y < room.y + room.h; y++) {
          this.map[x][y] = 1;
        }
      }
    }

    // Marking walls around the rooms (probably not something we will need)
    for (let x = 0; x < this.map_size; x++) {
      for (let y = 0; y < this.map_size; y++) {
        if (this.map[x][y] == 1) {
          for (let xx = x - 1; xx <= x + 1; xx++) {
            for (let yy = y - 1; yy <= y + 1; yy++) {
              if (this.map[xx][yy] == 0) this.map[xx][yy] = 2;
            }
          }
        }
      }
    }
  }

  findClosestRoom(room: Room) {
    const mid: Coordinate = {
      x: room.x + room.w / 2,
      y: room.y + room.h / 2,
    };
    let closest = null;
    let closest_distance = 1000;
    for (let i = 0; i < this.rooms.length; i++) {
      const check = this.rooms[i];
      if (check == room) continue;
      const check_mid = {
        x: check.x + check.w / 2,
        y: check.y + check.h / 2,
      };
      const distance = Math.min(
        Math.abs(mid.x - check_mid.x) - room.w / 2 - check.w / 2,
        Math.abs(mid.y - check_mid.y) - room.h / 2 - check.h / 2
      );
      if (distance < closest_distance) {
        closest_distance = distance;
        closest = check;
      }
    }
    return closest;
  }

  // Make a few attempts at moving each room north-west as far as it goes without a collision
  squashRooms() {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < this.rooms.length; j++) {
        const room = this.rooms[j];
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const old_position: Coordinate = {
            x: room.x,
            y: room.y,
          };
          if (room.x > 1) room.x--;
          if (room.y > 1) room.y--;
          if (room.x == 1 && room.y == 1) break;
          if (this.doesCollide(room, j)) {
            room.x = old_position.x;
            room.y = old_position.y;
            break;
          }
        }
      }
    }
  }

  // Check if the provided room collides with any of the active rooms (optionally ignoring one of them, referenced by index)
  doesCollide(room: Room, ignore?: number) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (i == ignore) continue;
      const check = this.rooms[i];
      if (
        !(
          room.x + room.w < check.x ||
          room.x > check.x + check.w ||
          room.y + room.h < check.y ||
          room.y > check.y + check.h
        )
      )
        return true;
    }

    return false;
  }
}
