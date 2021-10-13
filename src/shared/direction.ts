const DIRECTIONS_BASE = ['north', 'south', 'west', 'east'] as const;
export type Direction = typeof DIRECTIONS_BASE[number];
export type Directions = Set<Direction>;
export const DIRECTIONS = DIRECTIONS_BASE as never as Direction[];