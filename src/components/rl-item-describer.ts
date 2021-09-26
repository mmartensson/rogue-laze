/* eslint-disable import/extensions */
import { LitElement, html, css, customElement, property } from 'lit-element';
import { nothing } from 'lit-html';

import { ItemInstance, Rarity } from '../types/equipment';

export const ROWS = 17;
export const COLUMNS = 55;
export const SPRITE_SIDE = 32;

let instance: ItemDescriberElement;
let mouseEnter: (e: MouseEvent) => void;
let mouseLeave: (e: MouseEvent) => void;

const initializeInstance = (el: ItemDescriberElement) => {
  instance = el;

  mouseEnter = function (e: MouseEvent) {
    let item;
    if (e.target instanceof HTMLElement) {
      item = (e.target as HTMLElement & { item: ItemInstance })['item'];
    }
    if (item === undefined) return;

    instance.item = item;
    instance.style.top = e.pageY + 'px';
    instance.style.left = e.pageX + 'px';
    instance.setAttribute('visible', '');
  };

  mouseLeave = function () {
    instance.removeAttribute('visible');
  };
};

export const registerHoverTarget = (target: HTMLElement) => {
  target.addEventListener('mouseenter', mouseEnter);
  target.addEventListener('mouseleave', mouseLeave);
};

export const unregisterHoverTarget = (target: HTMLElement) => {
  target.removeEventListener('mouseenter', mouseEnter);
  target.removeEventListener('mouseleave', mouseLeave);
};

@customElement('rl-item-describer')
export class ItemDescriberElement extends LitElement {
  @property({ type: Boolean, attribute: 'show-image' }) showImage = false;
  @property({ attribute: false }) item!: ItemInstance;
  @property({ type: String, attribute: 'rarity', reflect: true })
  rarity: Rarity = 'common';

  static styles = css`
    :host {
      position: absolute;
      display: none;
      box-sizing: border-box;
      flex-direction: column;

      top: 0;
      left: 0;
      width: 300px;
      height: 200px;

      border: inset 3px gray;
      background-color: rgba(128, 128, 128, 0.9);

      border-radius: 16px;
      padding: 16px;
    }
    :host([visible]) {
      display: flex;
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

    .name {
      align-self: center;
      font-weight: bold;
    }
  `;

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    initializeInstance(this);
  }

  shouldUpdate(changedProperties: Map<string, unknown>) {
    console.log('Should update?', changedProperties.keys);
    if (changedProperties.has('item')) {
      this.rarity = this.item.rarity;
    }
    return true;
  }

  render() {
    if (!this.item) return nothing;

    // TODO: showImage would add an <rl-item>... clearly we should not add show-image to <rl-item> itself and cause infinite recursion
    // TODO: Maybe we let rl-item render the text-only representation too

    // TODO: Difference rendering for different item types

    return html`
      <div class="name">${this.item.name}</div>
      <div class="weight">${this.item.weight}</div>
    `;
  }
}