import { html, css, customElement } from 'lit-element';

import config from '../config.js';
import { PageElement } from '../helpers/page-element.js';

@customElement('page-home')
export class PageHome extends PageElement {
  static styles = css`
    section {
      padding: 1rem;
    }
  `;

  render() {
    return html`
      <section>
        <h1>Start game</h1>

        <form action="progress">
          <input name="session" placeholder="Existing session" />
          <input type="submit" value="Continue" />
        </form>

        <hr />

        <button>Start new</button>
      </section>
    `;
  }

  meta() {
    return {
      title: config.appName,
      titleTemplate: null,
      description: `${config.appName} start page`,
    };
  }
}
