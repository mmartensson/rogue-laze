import { html, css, customElement, state } from 'lit-element';

import config from '../config.js';
import { PageElement } from '../helpers/page-element.js';

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

    .icon {
      width: 32px;
      height: 32px;
      background-image: url(../images/sprites.png);
      transform: scale(2);
    }
  `;

  render() {
    const SIZE = 32;

    const [ix, iy] = [0, 3];

    return html`
      <section>
        <h1>Progress</h1>

        <div
          class="icon"
          style="background-position: top -${iy * SIZE}px left -${ix * SIZE}px"
        ></div>
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
