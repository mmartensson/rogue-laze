/* eslint-disable import/no-duplicates */
/* eslint-disable import/extensions */
import {
  html,
  css,
  customElement,
  state,
  query,
  TemplateResult,
} from 'lit-element';

import '../components/rl-mannequin';
import { MannequinElement } from '../components/rl-mannequin';
import { fromBase62 } from '../helpers/base62';
import { randomItem } from '../helpers/equipment';
import { PageElement } from '../helpers/page-element';
import '../components/rl-item';
import { PRNG } from '../helpers/prng';
import { Character } from '../types/character';
import { Game } from '../types/game';

export type ActionType = 'battle';

export interface Action {
  type: ActionType;
}

// FIXME: Move to some utility module. A bit tricky with classes, unless we have globals.
// The idea was to have a ::before with color, but may need something fancier that works
// in any context.

const renderCoin = (coin: number) => {
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
};

// FIXME: Move session (with its prng) out of here.

@customElement('page-progress')
export class PageProgress extends PageElement {
  @state() private game: Game;

  @state() private session = '';
  @state() private actions: Action[] = [];
  @state() private prng?: PRNG;
  @state() private character = new Character();

  @query('rl-mannequin') private mannequin?: MannequinElement;

  static styles = css`
    section {
      padding: 1rem;
    }

    rl-mannequin {
      width: 300px;
    }

    .coin-copper::after,
    .coin-silver::after,
    .coin-gold::after {
      content: '⬤';
      padding-left: 2px;
      margin-right: 4px;
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

  constructor() {
    super();

    // Really. The page-progress is created before the parameters are available? Need to get rid of the router.
    const session = this.location?.params?.session as string;
    console.log('session', session);
    this.game = new Game('sK7po7S'); // hardcoded session because of silly router thingy
  }

  render() {
    const session = this.location?.params?.session as string;
    if (session == null) {
      // FIXME: Properly complain and direct user to the home page
      return html`No session`;
    }

    if (session != this.session) {
      this.session = session;
      // TODO: Implement an async recreation of all events leading up to now
      // using timestamp and seed. Show some kind of progress indicator.
      // Some nifty promise will trigger the regular content to be shown.

      const t0 = fromBase62(this.session);
      console.log('t0', t0);

      this.prng = new PRNG(this.session);

      for (let i = 0; i < 5; i++) {
        this.character.addItem(randomItem(this.prng, 40));
      }

      console.log('CHARACTER', this.character);
    }

    const equipmentWeight = Object.values(this.character.equipment)
      .map((item) => item?.weight || 0)
      .reduce((p, c) => p + c, 0);
    const inventoryWeight = this.character.inventory
      .map((item) => item.weight)
      .reduce((p, c) => p + c, 0);

    return html`
      <section>
        <h1>Character</h1>
        <rl-mannequin .character=${this.character}></rl-mannequin>
        <p>Weight: ${equipmentWeight}</p>
        <p>Coin: ${renderCoin(this.character.coin)}</p>
      </section>

      <button
        @click=${() => {
          if (this.prng) {
            this.character.addItem(randomItem(this.prng, 40));
            // Forced update of mannequin; going to want a prettier way of handling this. Event? Is a Redux-ish store
            // overkill?
            this.requestUpdate();
            this.mannequin?.requestUpdate();
          }
        }}
      >
        Add
      </button>

      <button
        @click=${() => {
          this.character.sellInventory();
          this.requestUpdate();
          this.mannequin?.requestUpdate();
        }}
      >
        Sell
      </button>

      <button
        @click=${() => {
          console.log('Tick?', this.game.tick());
        }}
      >
        Tick
      </button>

      <section>
        <h1>Inventory</h1>
        <ul id="inventory">
          ${this.character.inventory.map(
            (item) => html` <li>${item.name}</li> `
          )}
        </ul>
        <p>Weight: ${inventoryWeight}</p>
      </section>
    `;
  }
}
