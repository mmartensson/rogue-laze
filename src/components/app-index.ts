import { LitElement, html, css, customElement, query } from 'lit-element';

import { attachRouter, urlForName } from '../router/index.js';

import 'pwa-helper-components/pwa-install-button.js';
import 'pwa-helper-components/pwa-update-available.js';

@customElement('app-index')
export class AppIndex extends LitElement {
  @query('main')
  private main!: HTMLElement;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }

    header {
      display: flex;
      align-items: center;
      height: 53px;
      padding: 0 1rem;
      background-color: #24292e;
    }

    header nav {
      display: flex;
      flex: 1;
      align-self: stretch;
    }

    header nav a {
      display: flex;
      align-items: center;
      color: #fff;
      font-weight: 600;
      text-decoration: none;
    }

    header nav a:not(:last-child) {
      margin-right: 1rem;
    }

    header nav a:hover {
      color: #bbb;
    }

    main {
      display: flex;
      flex: 1;
      flex-direction: column;
    }

    footer {
      padding: 1rem;
      text-align: center;
      background-color: #eee;
    }

    main:empty ~ footer {
      display: none;
    }
  `;

  render() {
    return html`
      <header>
        <nav>
          <a href="${urlForName('home')}">Home</a>
          <a href="${urlForName('about')}">About</a>
        </nav>

        <pwa-install-button>
          <button>Install app</button>
        </pwa-install-button>

        <pwa-update-available>
          <button>Update app</button>
        </pwa-update-available>
      </header>

      <!-- The main content is added / removed dynamically by the router -->
      <main role="main"></main>

      <footer>
        <span>Copyright and stuff, I guess</span>
      </footer>
      <rl-item-describer></rl-item-describer>
    `;
  }

  firstUpdated() {
    attachRouter(this.main);
  }
}
