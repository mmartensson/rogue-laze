/* eslint-disable import/no-duplicates */
/* eslint-disable import/extensions */
import { html, css, customElement, state, query } from 'lit-element';

import '../components/rl-mannequin';
import { MannequinElement } from '../components/rl-mannequin';
import { PageElement } from '../helpers/page-element';
import '../components/rl-item';
import '../components/rl-coin';
import { Game } from '../types/game';

// TODO: Add a nifty mouseover for items, for use on mannequin and in inventory and also in prose with associated items
// (the goblin dropped a [Smelly Spear]).

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

    h1 {
      align-self: center;
    }

    #inventory {
      padding: 0;
      width: 400px;
      overflow-y: auto;
      overflow-x: hidden;
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

    const inventoryWeight = this.character.inventory
      .map((item) => item.weight)
      .reduce((p, c) => p + c, 0);

    return html`
      <section id="character">
        <h1>Character</h1>
        <rl-mannequin .character=${this.character}></rl-mannequin>
      </section>

      <section id="inventory">
        <h1>Inventory</h1>
        <p>Coin: <rl-coin coin=${this.character.coin}></rl-coin></p>
        <ul id="inventory">
          ${this.character.inventory.map(
            (item) => html` <rl-item .item=${item as any}></rl-item></li> `
          )}
        </ul>
        <p>Weight: ${inventoryWeight}</p>
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
