import { LitElement, html, css, customElement, property } from 'lit-element';

export const SIZE = 32;

@customElement('app-sprite')
export class AppSprite extends LitElement {
  @property({ type: Number }) x!: number;
  @property({ type: Number }) y!: number;

  static styles = css`
    :host {
      display: block;
      width: ${SIZE}px;
      height: ${SIZE}px;
      background-image: url(../images/sprites.png);
      transform: scale(2);
      margin-right: ${SIZE}px;
      margin-bottom: ${SIZE}px;

      border: inset 1px gray;
      background-color: lightgray;
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
    const [ix, iy] = [this.x * SIZE, this.y * SIZE];
    this.updateComplete.then(() => {
      this.style.backgroundPosition = `top -${iy}px left -${ix}px`;
    });
    return html``;
  }
}
