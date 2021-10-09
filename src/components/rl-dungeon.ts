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
      background-color: #999;
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
          font: 6px sans-serif;
          fill: white;
        }
        .room {
          fill: hsl(200,100%,60%);
          stroke: hsl(200,100%,80%);
          stroke-width: 1;
        }
        .connection {
          fill: hsl(200,100%,60%);
        }
        .connection-wall {
          stroke: hsl(200,100%,80%);
          stroke-width: 1;
        }
        .connection-symbol {
          stroke: hsl(200,100%,30%);
          stroke-width: 1;
        }
        .entity-loot {
          fill: hsl(100,100%,60%);
        }
        .entity-trap {
          fill: hsl(400,100%,60%);
        }
        .entity-enemy {
          fill: hsl(370,100%,30%);
        }
      </style>
      <defs>
        <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#000" stroke-width="0.5"/>
        </pattern>
      </defs>

      ${this.dungeon.rooms.map((room, index) => this.renderRoom(room, index))}

      <rect x="0" y="0" width="512" height="512" fill="url(#grid)" />
    </svg>
    `;
  }

  private renderRoom(room: Room, index: number) {
    const connections = room.connections.map((conn) => {
      if (conn.direction == 'east' || conn.direction == 'west') {
        return svg`
          <g>
            <rect class="connection" x=${conn.x * 8 - 1} y=${
          conn.y * 8 + 1
        } width=10 height=6></rect>

            <line class="connection-wall" x1=${conn.x * 8} y1=${
          conn.y * 8 + 0.5
        }
            x2=${conn.x * 8 + 8} y2=${conn.y * 8 + 0.5}></line>

            <line class="connection-wall" x1=${conn.x * 8} y1=${
          conn.y * 8 + 7.5
        }
            x2=${conn.x * 8 + 8} y2=${conn.y * 8 + 7.5}></line>

            <line class="connection-symbol" x1=${conn.x * 8 + 4} y1=${
          conn.y * 8
        }
            x2=${conn.x * 8 + 4} y2=${conn.y * 8 + 8}></line>
          </g>
      `;
      } else {
        return svg`
          <g>
            <rect class="connection" x=${conn.x * 8 + 1} y=${
          conn.y * 8 - 1
        } width=6 height=10></rect>

            <line class="connection-wall" x1=${conn.x * 8 + 0.5} y1=${
          conn.y * 8
        }
            x2=${conn.x * 8 + 0.5} y2=${conn.y * 8 + 8}></line>

            <line class="connection-wall" x1=${conn.x * 8 + 7.5} y1=${
          conn.y * 8
        }
            x2=${conn.x * 8 + 7.5} y2=${conn.y * 8 + 8}></line>

            <line class="connection-symbol" x1=${conn.x * 8} y1=${
          conn.y * 8 + 4
        }
            x2=${conn.x * 8 + 8} y2=${conn.y * 8 + 4}></line>
          </g>
      `;
      }
    });

    const entities = room.entities.map((ent) => {
      return svg`
        <circle class="entity-${ent.type}" cx=${ent.x * 8 + 4} cy=${
        ent.y * 8 + 4
      } r=1></circle>
      `;
    });

    return svg`
      <g>
        <rect data-index=${index} class="room" x=${room.x * 8 + 0.5} y=${
      room.y * 8 + 0.5
    } width=${room.w * 8 - 1} height=${room.h * 8 - 1}></rect>
        <text x=${room.x * 8 + 1} y=${
      room.y * 8 + 6
    } class="room-no">${index}</text>
        ${connections}
        ${entities}
      </g>
    `;
  }
  // <text ... alignment-baseline="middle" ... text-anchor="middle"></text>
}
