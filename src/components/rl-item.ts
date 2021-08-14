import { LitElement, html, css, customElement, property } from 'lit-element';

export const ROWS = 17;
export const COLUMNS = 55;
export const SPRITE_SIDE = 32;

@customElement('rl-item')
export class ItemElement extends LitElement {
  @property({ type: Number }) x!: number;
  @property({ type: Number }) y!: number;

  static styles = css`
    :host {
      display: block;
      min-width: ${SPRITE_SIDE}px;
      min-height: ${SPRITE_SIDE}px;
      background-image: url(../images/sprites.png);

      border: inset 1px gray;
      background-color: lightgray;
      background-size: ${ROWS * 100}% ${COLUMNS * 100}%;
      opacity: 0.8;
    }
    :host([rarity='legendary']) {
      border: inset 1px gold;
      background-color: goldenrod;
    }
    :host([rarity='epic']) {
      border: inset 1px darkviolet;
      background-color: purple;
    }
    :host([rarity='rare']) {
      border: inset 1px darkblue;
      background-color: blue;
    }
    :host([rarity='uncommon']) {
      border: inset 1px darkgreen;
      background-color: green;
    }
    :host([dimmed]) {
      opacity: 0.2;
      filter: grayscale(100%);
    }
  `;

  render() {
    this.updateComplete.then(() => {
      this.style.backgroundPosition = `-${this.x * 100}% -${this.y * 100}%`;
    });
    return html``;
  }
}
