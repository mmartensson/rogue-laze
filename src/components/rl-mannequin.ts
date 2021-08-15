/* eslint-disable import/extensions */
import { LitElement, css, customElement, property, svg } from 'lit-element';

import { Character } from '../types/character';
import { ItemLocation } from '../types/equipment';

export const SIZE = 32;

@customElement('rl-mannequin')
export class MannequinElement extends LitElement {
  @property({ attribute: false }) character = new Character();

  static styles = css`
    :host {
      display: inline-block;
    }
    rl-item {
      width: calc(100% - 2px);
      height: calc(100% - 2px);
    }
  `;

  render() {
    const { character } = this;

    const at = (x: number, y: number, def: number, loc: ItemLocation) => {
      const item = this.character?.equipment[loc];

      return svg`
        <foreignObject x=${x} y=${y} width="100" height="100">
          <rl-item .item=${item} .defaultRow=${def}></rl-item>
        </foreignobject>
      `;
    };

    const percent = Math.round(
      (100 * character.curHealth) / character.maxHealth
    );

    return svg`
      <svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 428 980">
        <defs>
          <linearGradient id="health" x1="0%" y1="0%" x2="0%" y2="100%">
            ${
              percent < 5
                ? undefined
                : svg`
              <stop offset="0%" style="stop-color:rgb(0,0,128,.3);stop-opacity:1" />
            `
            }
            ${
              percent > 95 || percent < 5
                ? undefined
                : svg`
              <stop offset="${
                percent - 5
              }%" style="stop-color:rgb(0,0,128,.3);stop-opacity:1" />
              <stop offset="${
                percent + 5
              }%" style="stop-color:rgb(128,0,0,.3);stop-opacity:1" />
            `
            }
            ${
              percent > 95
                ? undefined
                : svg`
              <stop offset="100%" style="stop-color:rgb(128,0,0,.3);stop-opacity:1" />
            `
            }
          </linearGradient>
        </defs>

        <path stroke="rgba(0,0,128,.3)" fill="url(#health)" d="M199 1c-11 2-20 10-26 20-2 5-2 6-3 22v17h-3c-3 0-4 4-2 13 1 8 3 13 9 20 5 6 7 12 8 27 1 17-1 22-9 31-7 6-16 11-38 20-16 6-20 8-26 13-13 10-15 23-13 60a214 214 0 01-16 98c-5 14-7 22-9 40-4 32-14 68-21 73l-11 5c-5 1-10 3-12 5-6 3-26 24-26 25 1 4 11 2 20-4l7-4v3c0 3-4 15-13 33l-7 18c-1 3 0 4 4 8l5 5 4-3 5-4v6c0 5 0 6 2 6 3 0 8-5 15-18 5-9 6-11 6-8-3 14-2 23 1 23a1115 1115 0 0144-102 390 390 0 0040-123l1 1 1 10c2 20-3 64-11 103-13 59-14 68-14 105 0 31 0 37 5 92 4 39 4 49 1 70-5 27-5 58-1 92l5 33 4 37c2 19 0 52-4 66l-5 10c-13 21-14 28-4 32 4 2 6 3 20 3 18 0 22-2 25-7 2-5 3-37 3-70 0-58-1-50 6-84l8-37 2-37 1-30 3-12c5-16 8-29 11-55l5-36a525 525 0 0011-83v-4h14v4l3 26a633 633 0 0013 91c3 24 6 42 11 57l3 12 1 30c1 34 1 33 10 75 7 33 7 25 6 84 0 32 1 65 3 69s8 6 20 7c26 1 36-5 30-19l-6-11c-7-10-8-10-10-25-3-18-3-51 0-73 9-70 9-71 9-101 0-21 0-28-2-39-5-32-5-24 2-97a532 532 0 00-13-185l-8-54c-2-21-1-50 1-50a384 384 0 0041 122 374 374 0 0126 64 1115 1115 0 0118 39l2-12-2-10c0-4 0-4 6 7 7 13 12 18 15 18 2 0 3-1 2-6v-6l5 4 4 3 5-5c4-4 5-5 4-8l-8-19-10-23c-2-6-3-11-1-11l7 3 10 5c4 1 9 1 9-1s-21-22-26-25l-11-5-11-4c-7-5-17-40-22-73-2-19-4-27-9-41-16-47-18-60-16-104v-31c-3-18-13-27-38-36l-22-10c-22-10-27-17-27-35 0-10 2-24 3-27l5-5c5-5 8-12 9-21s0-12-3-13c-2 0-2 0-2-16V29l-3-7c-5-11-15-19-28-21h-27z"/>
        ${at(50, 50, 49, 'accessory')}
        ${at(163, 0, 32, 'head')}
        ${at(275, 50, 46, 'neck')}
        ${at(0, 455, 0, 'main')}
        ${at(163, 215, 37, 'chest')}
        ${at(328, 455, 29, 'offhand')}
        ${at(0, 355, 43, 'arm')}
        ${at(163, 555, 40, 'leg')}
        ${at(328, 355, 45, 'finger')}

        <foreignObject x=163 y=400 width="100" height="100">
          <div style="text-align: center">${this.character.curHealth} (${
      this.character.maxHealth
    })</div>
        </foreignObject>

        <foreignObject x=63 y=700 width="300" height="300">
          <ul style="border: solid 1px red; background: white">
            ${Object.entries(this.character.totalMitigation).map(
              ([damageType, value]) => svg`
              <li>${damageType}: ${value}</li>
            `
            )}
          </ul>
        </foreignObject>
      </svg>
    `;
  }
}
