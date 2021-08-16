/* eslint-disable import/no-duplicates */
/* eslint-disable import/extensions */
import { html, css, customElement, state, query } from 'lit-element';

import '../components/rl-mannequin';
import { MannequinElement } from '../components/rl-mannequin';
import config from '../config';
import { fromBase62 } from '../helpers/base62';
import { randomItem } from '../helpers/equipment';
import { PageElement } from '../helpers/page-element';
import '../components/rl-item';
import { PRNG } from '../helpers/prng';
import { Character } from '../types/character';

export type ActionType = 'battle';

export interface Action {
  type: ActionType;
}

// FIXME: Move session (with its prng) out of here.

@customElement('page-progress')
export class PageProgress extends PageElement {
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
  `;

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

  meta() {
    return {
      title: `${config.appName} progress`,
      description: `${config.appName} progress`,
    };
  }
}
