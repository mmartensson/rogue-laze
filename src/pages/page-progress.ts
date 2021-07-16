/* eslint-disable import/extensions */
import { html, css, customElement, state } from 'lit-element';

import config from '../config.js';
import { PageElement } from '../helpers/page-element.js';
import '../components/app-sprite';

export type ActionType = 'battle';

export interface Action {
  type: ActionType;
}

@customElement('page-progress')
export class PageProgress extends PageElement {
  @state() session = null;
  @state() actions: Action[] = [];

  static styles = css`
    section {
      padding: 1rem;
    }
  `;

  render() {
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
            <td><app-sprite dimmed x="0" y="1"></app-sprite></td>
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
