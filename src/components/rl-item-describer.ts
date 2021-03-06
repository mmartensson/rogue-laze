/* eslint-disable import/extensions */
import { LitElement, html, css, customElement, property } from 'lit-element';
import { nothing, TemplateResult } from 'lit-html';

import {
  isArmorInstance,
  ArmorInstance,
  ItemInstance,
  Rarity,
  DamageType,
  isWeaponInstance,
  lookupBaseWeapon,
} from '../shared/equipment';

import './rl-coin';

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
  @property({ type: Boolean, attribute: 'global' }) global = false;
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
      min-height: 100px;

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
      font-weight: 400;
    }

    dl {
      display: grid;
      grid-template-columns: repeat(2, 2fr 1fr);
      font-size: 80%;
    }
    dt {
      padding: 2px 4px;
      font-weight: 400;
      text-align: right;
    }
    dt:first-letter {
      text-transform: capitalize;
    }
    dd {
      margin: 0;
      padding: 2px 4px;
      font-weight: 200;
    }
    dt.sep {
      font-size: 80%;
      text-align: center;
      grid-column: 1 / -1;
    }
  `;

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();

    if (this.global) {
      initializeInstance(this);
    }
  }

  shouldUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('item')) {
      this.rarity = this.item.rarity;
    }
    return true;
  }

  render() {
    if (!this.item) return nothing;

    // TODO: showImage would add an <rl-item>... clearly we should not add show-image to <rl-item> itself and cause infinite recursion
    // TODO: Maybe we let rl-item render the text-only representation too

    const grid: TemplateResult[] = [];

    if (isArmorInstance(this.item)) {
      const armor: ArmorInstance = this.item;
      const mits = (Object.keys(armor.mitigation) as DamageType[]).sort().map(
        (damageType) =>
          html` <dt>${damageType}</dt>
            <dd>${armor.mitigation[damageType]}</dd>`
      );
      grid.push(html`<dt class="sep">Mitigation</dt>`, ...mits);
    }

    if (isWeaponInstance(this.item)) {
      const base = lookupBaseWeapon(this.item.refId);
      const secondaryDamageTmpl = this.item.secondaryDamageType
        ? html`
            <dt>${this.item.secondaryDamageType}</dt>
            <dd>${this.item.secondaryDamage}</dd>
          `
        : nothing;

      grid.push(html`
        <dt class="sep">Power</dt>
        <dt>${base?.damageType}</dt>
        <dd>
          d${base?.damageDice}${this.item.damageMod > 0
            ? '+' + this.item.damageMod
            : nothing}
        </dd>
        ${secondaryDamageTmpl}
        <dt>Speed</dt>
        <dd>${this.item.speed}</dd>
      `);
    }

    const priceTmpl = html`
      <dt>Price</dt>
      <dd><rl-coin coin=${this.item.price}></rl-coin></dd>
    `;

    grid.push(html`
      <dt class="sep">General</dt>
      <dt>Weight</dt>
      <dd>${this.item.weight}</dd>
      ${this.item.price > 0 ? priceTmpl : nothing}
    `);

    return html`<div class="name">${this.item.name}</div>
      <dl>${grid}</dl>`;
  }
}
