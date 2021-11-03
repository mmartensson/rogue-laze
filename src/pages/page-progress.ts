import { html, css, customElement, state, nothing, TemplateResult } from 'lit-element';

import { PageElement } from '../helpers/page-element';
import '../components/rl-mannequin';
import '../components/rl-dungeon';
import '../components/rl-item';
import '../components/rl-coin';
import type { GameLoopOriginMessage, InitMessage } from '../shared/messages';
import type { Snapshot } from '../shared/snapshot';

@customElement('page-progress')
export class PageProgress extends PageElement {
  @state() private fastForwardPercent: number|null = null;
  @state() private snapshot: Snapshot|null = null;
  private snapshots: Snapshot[] = [];
  private gameLoopWorker?: Worker;

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

    #fastforward h2 {
      margin-left: 16px;
    }

    rl-dungeon.thumbnail {
      width: 128px;
      height: 128px;
      margin: 16px;
      float: left;
    }
  `;

  connectedCallback() {
    super.connectedCallback();

    const session = this.location?.params?.session as string;
    if (!session) {
      window.location.href = '/';
    }

    this.gameLoopWorker = new Worker(new URL('../game-loop/index.js', import.meta.url), {
      type: 'module',
      name: 'game-loop',
    });
    const init: InitMessage = {
      type: 'init',
      session
    }
    this.gameLoopWorker.postMessage(init);

    this.gameLoopWorker.onmessage = (ev: MessageEvent<GameLoopOriginMessage>) => {
      switch (ev.data.type) {
      case 'fast-forward-progress':
        this.snapshot = ev.data.snapshot;
        this.snapshots.push(this.snapshot);
        this.fastForwardPercent = ~~((100 * ev.data.currentTick) / ev.data.maximumTick);
        break;
      case 'tick-progress':
        this.snapshot = ev.data.snapshot;
        this.snapshots = [];
        this.fastForwardPercent = null;
        break;
      }
    }

    window.addEventListener('focus', () => {
      console.log('User is back');
      this.requestUpdate();
    });
    window.addEventListener('blur', () => {
      console.log('User lost interest');
      // Do we pause the worker?
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.gameLoopWorker) {
      this.gameLoopWorker.postMessage({type: 'shutdown'});
      this.gameLoopWorker.terminate();
      this.gameLoopWorker = undefined;
    }
  }

  render() {
    // NOTE: Adding the document.hidden check here to avoid updating the dom when nobody is watching, but mostly to try out a way
    // of avoiding the character from flying weirdly over the screen because painting was frozen. The 'focus' listener in
    // connectedCallback() makes sure we get immediate render() when we get back.
    if (this.snapshot === null || document.hidden) {
      // Expecting this to be the case a very short time (i.e. just a roundtrip to the worker)
      return nothing;
    }

    if (this.fastForwardPercent !== null) {
      return this.renderFastForwarding();
    }

    const { character, mapSize, location, rooms, dungeonType } = this.snapshot;

    const inventoryWeight = character.inventory
      .map((item) => item.weight)
      .reduce((p, c) => p + c, 0);

    let map: TemplateResult;
    if (mapSize && location && rooms) {
      map = html`
        <rl-dungeon
          .mapSize=${mapSize}
          .location=${location}
          .rooms=${rooms}
          .dungeonType=${dungeonType}
        ></rl-dungeon>
      `;
    } else {
      map = html`
        This is a placeholder for the town and possibly other locations
      `;
    }

    return html`
      <section>
        ${map}
      </section>

      <section>
        <rl-mannequin .character=${character}></rl-mannequin>
      </section>

      <section id="inventory">
        <div id="inventory-content">
          <p>Coin: <rl-coin coin=${character.coin}></rl-coin></p>
          <p>Weight: ${inventoryWeight}</p>
          <p>Level: ${character.level}</p>

          <ul>
            ${character.inventory.map(
              (item) => html`<li><rl-item .item=${item as any}></rl-item></li>`
            )}
          </ul>
        </div>
        <div id="inventory-fader"></div>
      </section>
    `;
  }

  renderFastForwarding() {
    return html`
      <div id="fastforward">
        <h2>Fast forwarding: ${this.fastForwardPercent}%</h2>
        ${this.snapshots.map(snapshot => {
          const { mapSize, location, rooms } = snapshot;
          if (mapSize && location && rooms) {
            return html`
              <rl-dungeon
                class="thumbnail"
                .mapSize=${mapSize}
                .location=${location}
                .rooms=${rooms}
              ></rl-dungeon>
            `;
          } else {
            return nothing;
          }
        })}
      </div>
    `;
  }
}
