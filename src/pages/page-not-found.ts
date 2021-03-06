import { html, css, customElement, LitElement } from 'lit-element';

import { urlForName } from '../router/index.js';

@customElement('page-not-found')
export class PageNotFound extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    section {
      padding: 1rem;
      text-align: center;
    }
  `;

  render() {
    return html`
      <section>
        <h1>Page not found</h1>

        <p>
          <a href="${urlForName('home')}">Back to home</a>
        </p>
      </section>
    `;
  }
}
