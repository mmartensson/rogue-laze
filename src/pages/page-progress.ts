/* eslint-disable import/extensions */
import { AleaPRNG, mkAlea } from '@spissvinkel/alea';
import { html, css, customElement, state } from 'lit-element';

import config from '../config.js';
import { fromBase62 } from '../helpers/base62';
import { randomBaseWeapon } from '../helpers/equipment';
import { PageElement } from '../helpers/page-element';
import '../components/app-sprite';

export type ActionType = 'battle';

export interface Action {
  type: ActionType;
}

@customElement('page-progress')
export class PageProgress extends PageElement {
  @state() session = '';
  @state() actions: Action[] = [];
  @state() alea?: AleaPRNG;

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

    let wy = 1;

    if (session != this.session) {
      this.session = session;
      // TODO: Implement an async recreation of all events leading up to now
      // using timestamp and seed. Show some kind of progress indicator.
      // Some nifty promise will trigger the regular content to be shown.

      const t0 = fromBase62(this.session);
      console.log('t0', t0);

      this.alea = mkAlea(this.session);
      const { uint32 } = this.alea;
      console.log('Session seeded first random: ', uint32());

      const weapon = randomBaseWeapon(this.alea);
      wy = weapon.rows[0];
    }

    return html`
      <section>
        <h1>Progress</h1>

        <table>
          <tr>
            <td><app-sprite dimmed x="2" y="49"></app-sprite></td>
            <td><app-sprite dimmed x="0" y="32"></app-sprite></td>
            <td><app-sprite dimmed x="0" y="46"></app-sprite></td>
          </tr>

          <tr>
            <td><app-sprite dimmed x="0" y=${wy}></app-sprite></td>
            <td><app-sprite legendary x="0" y="37"></app-sprite></td>
            <td><app-sprite dimmed x="0" y="29"></app-sprite></td>
          </tr>

          <tr>
            <td><app-sprite dimmed x="0" y="43"></app-sprite></td>
            <td><app-sprite dimmed x="0" y="40"></app-sprite></td>
            <td><app-sprite legendary x="0" y="45"></app-sprite></td>
          </tr>
        </table>
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
