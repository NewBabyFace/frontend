import "@material/mwc-button";
import type { menuaiEntity } from "home-assistant-js-websocket";
import type { CSSResultGroup } from "lit";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "../components/entity/ha-entity-toggle";
import "../components/entity/state-info";
import { UNAVAILABLE } from "../data/entity";
import { haStyle } from "../resources/styles";
import type { menuai } from "../types";

@customElement("state-card-input_button")
class StateCardInputButton extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj!: menuaiEntity;

  @property({ attribute: "in-dialog", type: Boolean }) public inDialog = false;

  protected render() {
    const stateObj = this.stateObj;
    return html`
      <div class="horizontal justified layout">
        <state-info
          .menuai=${this.menuai}
          .stateObj=${stateObj}
          .inDialog=${this.inDialog}
        ></state-info>
        <mwc-button
          @click=${this._pressButton}
          .disabled=${stateObj.state === UNAVAILABLE}
        >
          ${this.menuai.localize("ui.card.button.press")}
        </mwc-button>
      </div>
    `;
  }

  private _pressButton(ev: Event) {
    ev.stopPropagation();
    this.menuai.callService("input_button", "press", {
      entity_id: this.stateObj.entity_id,
    });
  }

  static get styles(): CSSResultGroup {
    return haStyle;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-input_button": StateCardInputButton;
  }
}
