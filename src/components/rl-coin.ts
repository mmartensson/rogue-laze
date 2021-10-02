/* eslint-disable import/extensions */
import { LitElement, html, css, customElement, property } from 'lit-element';
import { TemplateResult } from 'lit-html';

@customElement('rl-coin')
export class CoinElement extends LitElement {
  @property({ type: Number }) coin = 0;

  static styles = css`
    .coin-copper::after,
    .coin-silver::after,
    .coin-gold::after {
      content: '⬤';
      padding-left: 0.2em;
      margin-right: 0.5em;
      filter: drop-shadow(2px 2px 1px #333);
    }

    .coin-copper::after {
      color: #b87333;
    }
    .coin-silver::after {
      color: #c0c0c0;
    }
    .coin-gold::after {
      color: #ffd700;
    }
  `;

  render() {
    let coin = this.coin;
    const c = coin % 100;
    coin = (coin - c) / 100;
    const s = coin % 100;
    coin = (coin - s) / 100;
    const g = coin;

    const t: TemplateResult[] = [];
    if (g) {
      t.push(html`<span class="coin-gold">${g}</span>`);
    }
    if (s) {
      t.push(html`<span class="coin-silver">${s}</span>`);
    }
    if (c || (!g && !s)) {
      t.push(html`<span class="coin-copper">${c}</span>`);
    }

    return t;
  }
}
