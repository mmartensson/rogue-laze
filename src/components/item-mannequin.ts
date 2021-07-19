/* eslint-disable import/extensions */
import { LitElement, html, css, customElement, property } from 'lit-element';

import { ItemInstance } from '../helpers/equipment';

export const SIZE = 32;

@customElement('item-mannequin')
export class ItemMannequin extends LitElement {
  // FIXME: Should probably be a Record<ItemLocation, ItemInstance>. But then we need to remove the ambigious `either` etc.
  @property({ attribute: false }) items: ItemInstance[] = [];

  static styles = css`
    :host {
      display: block;
    }
    app-sprite {
      width: 64px;
      height: 64px;
    }
    table {
      background-image: url(../images/silhouette.svg);
      background-repeat: no-repeat;
      background-position: center;
    }
  `;

  render() {
    return html`
      <table>
        <tr>
          <td><app-sprite dimmed x="2" y="49"></app-sprite></td>
          <td><app-sprite dimmed x="0" y="32"></app-sprite></td>
          <td><app-sprite dimmed x="0" y="46"></app-sprite></td>
        </tr>

        <tr>
          <td><app-sprite dimmed x="0" y="29"></app-sprite></td>
          <td><app-sprite dimmed x="0" y="37"></app-sprite></td>
          <td><app-sprite dimmed x="0" y="29"></app-sprite></td>
        </tr>

        <tr>
          <td><app-sprite dimmed x="0" y="43"></app-sprite></td>
          <td><app-sprite dimmed x="0" y="40"></app-sprite></td>
          <td><app-sprite dimmed x="0" y="45"></app-sprite></td>
        </tr>
      </table>
    `;
  }
}
