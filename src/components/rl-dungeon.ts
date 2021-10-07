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
      border: solid 1px black;
      background-color: #f0f0f0;
    }
  `;

  render() {
    if (!this.dungeon) return nothing;

    return svg`
    <svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 384 384">
      <defs>
        <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#cfcfcf" stroke-width="1"/>
        </pattern>
      </defs>

      <rect x="0" y="0" width="512" height="512" fill="url(#grid)" />

      ${this.dungeon.rooms.map((room) => this.renderRoom(room))}
    </svg>
    `;
  }

  private renderRoom(room: Room) {
    return svg`
      <rect x=${room.x * 8} y=${room.y * 8} width=${room.w * 8} height=${
      room.h * 8
    } fill="rgba(255, 255, 255, 0.7)" stroke="#a9a9a9" shape-rendering="crispEdges" stroke-width="2"></rect>
    `;
  }
}
