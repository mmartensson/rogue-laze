/* eslint-disable import/extensions */
import {
  LitElement,
  html,
  css,
  customElement,
  property,
  state,
} from 'lit-element';

import {
  DamageTypeToVariantColumn,
  ItemInstance,
  Rarity,
} from '../types/equipment';

export const ROWS = 17;
export const COLUMNS = 55;
export const SPRITE_SIDE = 32;

@customElement('rl-item')
export class ItemElement extends LitElement {
  @property({ type: Number }) defaultRow = -1;
  @property({ type: Object, attribute: false }) item!: ItemInstance;
  @property({ type: String, attribute: 'rarity', reflect: true })
  rarity: Rarity = 'common';
  @property({ type: Boolean, attribute: 'dimmed', reflect: true }) dimmed =
    false;
  @state() row = -1;
  @state() col = 0;

  static styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      min-width: ${SPRITE_SIDE}px;
      min-height: ${SPRITE_SIDE}px;
      background-image: url(../images/sprites.png);

      border: inset 6px gray;
      background-color: rgba(128, 128, 128, 0.6);
      background-size: ${ROWS * 100}% ${COLUMNS * 100}%;
      border-radius: 50%;
    }
    :host([rarity='legendary']) {
      border-color: gold;
    }
    :host([rarity='epic']) {
      border-color: darkviolet;
    }
    :host([rarity='rare']) {
      border-color: darkblue;
    }
    :host([rarity='uncommon']) {
      border-color: green;
    }
    :host([dimmed]) {
      opacity: 0.2;
      filter: grayscale(100%);
    }
  `;

  shouldUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('item')) {
      this.col = 0;

      if (this.item) {
        const { row, secondaryDamageType, rarity } = this.item;

        this.row = row;
        this.rarity = rarity;

        if (secondaryDamageType) {
          this.col = DamageTypeToVariantColumn.get(
            secondaryDamageType
          ) as number;
        }
        this.dimmed = false;
      } else {
        this.row = this.defaultRow;
        this.dimmed = true;
      }
    } else {
      this.row = this.defaultRow;
      this.dimmed = true;
    }

    return true;
  }

  render() {
    if (this.row < 0) return undefined;

    this.updateComplete.then(() => {
      this.style.backgroundPosition = `-${this.col * 100}% -${this.row * 100}%`;
    });
    return html``;
  }
}
