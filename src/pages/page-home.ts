/* eslint-disable import/extensions */
import { html, css, customElement } from 'lit-element';

import config from '../config.js';
import { toBase62 } from '../helpers/base62';
import { PageElement } from '../helpers/page-element.js';
import { urlForName } from '../router';

@customElement('page-home')
export class PageHome extends PageElement {
  static styles = css`
    section {
      padding: 1rem;
    }
  `;

  render() {
    const startNew = () => {
      const session = toBase62(+Date.now());
      const url = urlForName('progress', { session });
      window.location.href = url;
    };

    return html`
      <section>
        <h1>Start game</h1>

        <form action="progress">
          <input name="session" placeholder="Existing session" />
          <input type="submit" value="Continue" />
        </form>

        <hr />

        <button @click=${startNew}>Start new</button>
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
