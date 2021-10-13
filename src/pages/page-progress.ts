/* eslint-disable import/no-duplicates */
/* eslint-disable import/extensions */
import { html, css, customElement, state, query } from 'lit-element';

import type { DungeonElement } from '../components/rl-dungeon';
import type { MannequinElement } from '../components/rl-mannequin';
import { PageElement } from '../helpers/page-element';
import '../components/rl-mannequin';
import '../components/rl-dungeon';
import '../components/rl-item';
import '../components/rl-coin';
import { Game } from '../types/game';
import { Character } from '../types/character';

// TODO: Add a nifty mouseover for items, for use on mannequin and in inventory and also in prose with associated items
// (the goblin dropped a [Smelly Spear]).

@customElement('page-progress')
export class PageProgress extends PageElement {
  @state() private game!: Game;
  @state() private fastForwarding = false;

  @query('rl-mannequin') private mannequin?: MannequinElement;
  @query('rl-dungeon') private dungeon?: DungeonElement;

  static styles = css`
    :host {
      background-color: #668;
      display: flex;
      flex-direction: row;
      box-sizing: border-box;

      width: 100%;
      height: 100%;
    }

    section {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      position: relative;
    }

    h1 {
      align-self: center;
    }

    #inventory {
      flex: 1;
    }

    #inventory-content {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    #inventory-fader {
      position: absolute;
      inset: 80% 0 0 0;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0) 0%,
        rgba(102, 102, 136, 1) 100%
      );
    }

    #inventory ul {
      padding: 0;
      overflow: hidden;
      font-weight: 200;
      line-height: 22px;
    }

    #inventory ul li rl-item {
      display: inline-block;
    }
  `;

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();

    const session = this.location?.params?.session as string;
    this.game = new Game(session);

    const worker = new Worker(new URL('../game-loop/index.js', import.meta.url), {
      type: 'module'
    });
    worker.postMessage(['hi']);
    worker.onmessage = (ev: MessageEvent) => {
      console.log('Main got data', ev.data);

      if (ev.data.character) {
        // Just plain JSON transfer
        console.log('Did type survive?', ev.data.character instanceof Character);
      }
    }
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
      <section>
        <rl-dungeon
          .dungeon=${this.game.dungeon}
          .location=${{
            x: this.game.dungeon?.startingRoom.x,
            y: this.game.dungeon?.startingRoom.y,
          }}
        ></rl-dungeon>
      </section>

      <section>
        <rl-mannequin .character=${this.character}></rl-mannequin>
      </section>

      <section id="inventory">
        <div id="inventory-content">
          <p>Coin: <rl-coin coin=${this.character.coin}></rl-coin></p>
          <p>Weight: ${inventoryWeight}</p>
          <p>Tick: ${this.game.lastHandled}</p>
          <p>Level: ${this.character.level}</p>

          <ul>
            ${this.character.inventory.map(
              (item) => html`<li><rl-item .item=${item as any}></rl-item></li>`
            )}
          </ul>
        </div>
        <div id="inventory-fader"></div>
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
      this.dungeon?.requestUpdate();
    }
  }

  renderFastForwarding() {
    return html` <div>Fast forwarding</div> `;
  }
}
