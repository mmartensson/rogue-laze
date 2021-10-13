/* eslint-disable import/extensions */
import { LitElement, customElement, property, css } from 'lit-element';
import { svg } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import type { Point } from '../shared/geometry';
import type { Room } from '../shared/room';

@customElement('rl-dungeon')
export class DungeonElement extends LitElement {
  @property({ attribute: false }) mapSize!: number;
  @property({ attribute: false }) location!: Point;
  @property({ attribute: false }) rooms!: Room[];

  static styles = css`
    :host {
      --room-hue: 240;
      --room-sat: 30%;

      --loot-hue: 100;
      --trap-hue: 400;
      --enemy-hue: 370;

      height: 100%;

      display: flex;
      background-color: rgb(36, 41, 46);
    }

    svg {
      height: 100%;
    }

    svg .room {
      fill: hsl(var(--room-hue), var(--room-sat), 40%);
      stroke: hsl(var(--room-hue), var(--room-sat), 80%);
      stroke-width: 1;
    }

    svg .room.visited {
      fill: hsl(var(--room-hue), var(--room-sat), 60%);
    }

    svg .room-no {
      font: 6px sans-serif;
      fill: white;
    }
    svg .connection {
      fill: hsl(var(--room-hue), var(--room-sat), 60%);
    }
    svg .connection-wall {
      stroke: hsl(var(--room-hue), var(--room-sat), 80%);
      stroke-width: 1;
    }
    svg .connection-symbol {
      stroke: hsl(var(--room-hue), var(--room-sat), 30%);
      stroke-width: 1;
    }
    svg .entity-loot,
    svg .entity-trap,
    svg .entity-enemy {
      stroke: black;
      stroke-width: 0.1;
    }
    svg .entity-loot {
      fill: hsl(var(--loot-hue), 100%, 60%);
    }
    svg .entity-trap {
      fill: hsl(var(--trap-hue), 100%, 60%);
    }
    svg .entity-enemy {
      fill: hsl(var(--enemy-hue), 100%, 30%);
    }
    svg #grid {
      stroke: rgba(0, 0, 0, 0.1);
      stroke-width: 0.5;
      fill: none;
    }

    @keyframes wakawaka {
      from {
        stroke-dasharray: 6.28, 4;
        stroke-dashoffset: 0;
      }
      to {
        stroke-dasharray: 5, 4;
        stroke-dashoffset: -0.6;
      }
    }

    svg #character {
      stroke: yellow;
      stroke-width: 2;
      fill: none;
      animation: wakawaka 0.15s linear infinite alternate;
      transition: cx 1s linear, cy 1s linear 2s;
    }
  `;

  render() {
    const { mapSize, location, rooms } = this;

    return svg`
    <svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 ${mapSize * 8} ${mapSize * 8}">
      <defs>
        <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" />
        </pattern>
      </defs>

      ${rooms.map((room, index) => this.renderRoom(room, index))}

      <rect x="0" y="0" width=${mapSize * 8} height=${mapSize * 8} fill="url(#grid)" />

      <circle id="character" cx=${location.x * 8 + 4} cy=${location.y * 8 + 4} r=1></circle>
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

    const classes = { room: true, visited: room.visited };
    return svg`
      <g>
        <rect data-index=${index} class=${classMap(classes)} x=${
      room.x * 8 + 0.5
    } y=${room.y * 8 + 0.5} width=${room.w * 8 - 1} height=${
      room.h * 8 - 1
    }></rect>
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
