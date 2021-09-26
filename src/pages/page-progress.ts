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
import { randomItem } from '../helpers/equipment';
import { PageElement } from '../helpers/page-element';
import '../components/rl-item';
import { Game } from '../types/game';

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

@customElement('page-progress')
export class PageProgress extends PageElement {
  @state() private game!: Game;
  @state() private fastForwarding = false;

  @query('rl-mannequin') private mannequin?: MannequinElement;

  static styles = css`
    :host {
      background-color: #668;
      display: flex;
      flex-direction: row;
    }

    section {
      display: flex;
      flex-direction: column;
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

    h1 {
      align-self: center;
    }

    #inventory {
      width: 400px;
    }
  `;

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();

    const session = this.location?.params?.session as string;
    this.game = new Game(session);
  }

  get character() {
    return this.game.character;
  }

  render() {
    if (this.fastForwarding) {
      return this.renderFastForwarding();
    }

    const equipmentWeight = Object.values(this.character.equipment)
      .map((item) => item?.weight || 0)
      .reduce((p, c) => p + c, 0);
    const inventoryWeight = this.character.inventory
      .map((item) => item.weight)
      .reduce((p, c) => p + c, 0);

    return html`
      <section id="character">
        <h1>Character</h1>
        <rl-mannequin .character=${this.character}></rl-mannequin>
        <p>Weight: ${equipmentWeight}</p>
      </section>

      <section id="inventory">
        <h1>Inventory</h1>
        <p>Coin: ${renderCoin(this.character.coin)}</p>
        <ul id="inventory">
          ${this.character.inventory.map(
            (item) => html` <li>${item.name}</li> `
          )}
        </ul>
        <p>Weight: ${inventoryWeight}</p>
      </section>

      <section>
        <h1>Debug</h1>

        <button
          @click=${() => {
            this.character.addItem(randomItem(this.game.prng, 40));
            // Forced update of mannequin; going to want a prettier way of handling this. Event? Is a Redux-ish store
            // overkill?
            this.requestUpdate();
            this.mannequin?.requestUpdate();
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
          @click=${async () => {
            const tickEvent = await this.game.scheduledTick();
            console.log('Tick event', tickEvent);
            this.requestUpdate();
            this.mannequin?.requestUpdate();
          }}
        >
          Tick
        </button>
      </section>
    `;
  }

  async updated() {
    const tickEvent = await this.game.scheduledTick();
    if (tickEvent.summary === 'already-scheduled') return;

    const { max, current } = tickEvent;
    if (max !== undefined && current !== undefined) {
      const diff = max - current;
      if (diff > 100 && !this.fastForwarding) {
        this.fastForwarding = true;
      }
      if (diff < 5 && this.fastForwarding) {
        this.fastForwarding = false;
        console.log(`Fast forwarding ended. Currenly at tick ${current}`);
      }
    }

    if (this.fastForwarding) {
      // FIXME: Some fancy progress update properties, meaning not explicit requestUpdate() needed
      // If we expect the logic to actually ever take a couple of seconds to run, then we can use
      // tickEvent.summary === 'major-success' etc to do fancy flashes on the progress bar to give
      // a little hint as to where things are going.
      this.requestUpdate();
    } else {
      this.requestUpdate();
      this.mannequin?.requestUpdate();
    }
  }

  renderFastForwarding() {
    return html` <div>Fast forwarding</div> `;
  }
}
