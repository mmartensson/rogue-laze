import { html, css, customElement } from 'lit-element';

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
    // const day = 1000 * 24 * 60 * 60; // XXX: Useful to pretend the session is old by subtracting from Date.now()
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
}
