/* eslint-disable import/extensions */
import { html, css, customElement, state } from 'lit-element';

import config from '../config';
import { fromBase62 } from '../helpers/base62';
import { randomItem } from '../helpers/equipment';
import { PageElement } from '../helpers/page-element';
import '../components/app-sprite';
import '../components/item-mannequin';
import { PRNG } from '../helpers/prng';
import { Character } from '../types/character';

export type ActionType = 'battle';

export interface Action {
  type: ActionType;
}

// FIXME: Move session (with its prng) out of here.

@customElement('page-progress')
export class PageProgress extends PageElement {
  @state() session = '';
  @state() actions: Action[] = [];
  @state() prng?: PRNG;
  @state() character = new Character();

  static styles = css`
    section {
      padding: 1rem;
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

      for (let i = 0; i < 30; i++) {
        this.character.addItem(randomItem(this.prng, 40));
      }

      console.log('CHARACTER', this.character);
    }

    const example = (level: number) => {
      if (!this.prng) return;
      (this.shadowRoot?.querySelector('#example') as HTMLPreElement).innerHTML =
        JSON.stringify(randomItem(this.prng, level), null, 2);
    };

    return html`
      <section>
        <h1>Progress</h1>

        <button @click=${() => example(1)}>1</button>
        <button @click=${() => example(10)}>10</button>
        <button @click=${() => example(20)}>20</button>
        <button @click=${() => example(30)}>30</button>
        <button @click=${() => example(50)}>50</button>
        <button @click=${() => example(70)}>70</button>
        <button @click=${() => example(90)}>90</button>
        <button @click=${() => example(100)}>100</button>
        <pre id="example"></pre>

        <div style="padding-bottom: 100px"></div>

        <item-mannequin .character=${this.character}></item-mannequin>
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
