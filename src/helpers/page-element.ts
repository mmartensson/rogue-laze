import type { RouterLocation } from '@vaadin/router';
import { LitElement, state } from 'lit-element';

export class PageElement extends LitElement {
  @state()
  protected location?: RouterLocation;
}
