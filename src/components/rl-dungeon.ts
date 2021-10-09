/* eslint-disable import/extensions */
import { LitElement, customElement, property, css } from 'lit-element';
import { nothing, svg } from 'lit-html';

import { Dungeon, Room } from '../types/dungeon';

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
      <style>
        .room-no {
          font: 8px sans-serif; fill: red;
        }
      </style>
      <defs>
        <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#cfcfcf" stroke-width="0.5"/>
        </pattern>
      </defs>

      <rect x="0" y="0" width="512" height="512" fill="url(#grid)" />

      ${this.dungeon.rooms.map((room, index) => this.renderRoom(room, index))}
    </svg>
    `;
  }

  private renderRoom(room: Room, index: number) {
    const isStart = this.dungeon?.startingRoom === room;
    // FIXME: Define colors in svg and reference them

    // NOTE: Currently marking the starting room; going forward we should be marking the current room; possibly doing a trivial fog-of-war
    const fill = isStart
      ? 'rgba(128, 255, 0, 0.3)'
      : 'rgba(255, 255, 255, 0.7)';

    const connections = room.connections.map((conn) => {
      return svg`
        <rect x=${conn.point.x * 8} y=${
        conn.point.y * 8
      } width=8 height=8></rect>
      `;
    });

    return svg`
      <g>
        <rect data-index=${index} x=${room.x * 8} y=${room.y * 8} width=${
      room.w * 8
    } height=${
      room.h * 8
    } fill=${fill} stroke="#a9a9a9" stroke-width="1"></rect>
        <text x=${room.x * 8 + 1} y=${
      room.y * 8 + 7
    } class="room-no">${index}</text>
        ${connections}
      </g>
    `;
  }
  // <text ... alignment-baseline="middle" ... text-anchor="middle"></text>
}
