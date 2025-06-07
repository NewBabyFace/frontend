import type { menuaiEntity } from "home-assistant-js-websocket";
import type { CSSResultGroup } from "lit";
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators";
import "../components/entity/state-info";
import "../components/ha-lawn_mower-action-button";
import { haStyle } from "../resources/styles";
import type { menuai } from "../types";

@customElement("state-card-lawn_mower")
class StateCardLawnMower extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj!: menuaiEntity;

  @property({ attribute: "in-dialog", type: Boolean }) public inDialog = false;

  public render() {
    const stateObj = this.stateObj;
    return html`
      <div class="horizontal justified layout">
        <state-info
          .menuai=${this.menuai}
          .stateObj=${stateObj}
          .inDialog=${this.inDialog}
        ></state-info>
        <ha-lawn_mower-action-button
          .menuai=${this.menuai}
          .stateObj=${stateObj}
        ></ha-lawn_mower-action-button>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return haStyle;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-lawn_mower": StateCardLawnMower;
  }
}
