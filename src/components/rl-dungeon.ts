/* eslint-disable import/extensions */
import { LitElement, customElement, property, css } from 'lit-element';
import { nothing, svg } from 'lit-html';

import { Corridor, Dungeon, Room } from '../types/dungeon';

@customElement('rl-dungeon')
export class DungeonElement extends LitElement {
  @property({ attribute: false }) dungeon?: Dungeon;

  static styles = css`
    :host {
      display: inline-block;
      background-color: #f0f0f0;
    }
  `;

  render() {
    if (!this.dungeon) return nothing;

    const size = this.dungeon.mapSize;

    return svg`
    <svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 ${
      size * 8
    } ${size * 8}">
      <defs>
        <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#cfcfcf" stroke-width="0.5"/>
        </pattern>
      </defs>

      <rect x="0" y="0" width="512" height="512" fill="url(#grid)" />

      ${this.dungeon.rooms.map((room) => this.renderRoom(room))}
      ${this.dungeon.corridors.map((corridor) => this.renderCorridor(corridor))}
    </svg>
    `;
  }

  private renderRoom(room: Room) {
    const isStart = this.dungeon?.startRoom === room;
    // FIXME: Define colors in svg and reference them

    // NOTE: Currently marking the starting room; going forward we should be marking the current room; possibly doing a trivial fog-of-war
    const fill = isStart
      ? 'rgba(128, 255, 0, 0.3)'
      : 'rgba(255, 255, 255, 0.7)';

    return svg`
      <rect x=${room.x * 8} y=${room.y * 8} width=${room.w * 8} height=${
      room.h * 8
    } fill=${fill} stroke="#a9a9a9" stroke-width="1"></rect>
    `;
  }

  private renderCorridor(corridor: Corridor) {
    return corridor.coordinates.map(
      (coord) => svg`
      <rect x=${coord.x * 8} y=${
        coord.y * 8
      } width="8" height="8" fill="rgba(0, 255, 255, 0.05)" stroke="#a9a9a9" stroke-width="1"></rect>
    `
    );
  }
}
