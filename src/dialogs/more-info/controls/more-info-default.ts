import type { menuaiEntity } from "home-assistant-js-websocket";
import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../components/ha-attributes";
import type { menuai } from "../../../types";

@customElement("more-info-default")
class MoreInfoDefault extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj?: menuaiEntity;

  protected render() {
    if (!this.menuai || !this.stateObj) {
      return nothing;
    }

    return html`<ha-attributes
      .menuai=${this.menuai}
      .stateObj=${this.stateObj}
    ></ha-attributes>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-default": MoreInfoDefault;
  }
}
