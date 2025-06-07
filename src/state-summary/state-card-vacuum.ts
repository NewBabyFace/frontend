import type { menuaiEntity } from "home-assistant-js-websocket";
import type { CSSResultGroup, TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "../components/entity/state-info";
import "../components/ha-vacuum-state";
import type { menuai } from "../types";
import { haStyle } from "../resources/styles";

@customElement("state-card-vacuum")
class StateCardVacuum extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj!: menuaiEntity;

  @property({ attribute: "in-dialog", type: Boolean }) public inDialog = false;

  protected render(): TemplateResult {
    return html`
      <div class="horizontal justified layout">
        <state-info
          .menuai=${this.menuai}
          .stateObj=${this.stateObj}
          .inDialog=${this.inDialog}
        >
        </state-info>

        <ha-vacuum-state
          .menuai=${this.menuai}
          .stateObj=${this.stateObj}
        ></ha-vacuum-state>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return [haStyle];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-vacuum": StateCardVacuum;
  }
}
