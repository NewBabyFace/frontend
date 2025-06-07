import type { menuaiEntity } from "home-assistant-js-websocket";
import type { CSSResultGroup } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "../components/entity/ha-entity-toggle";
import "../components/entity/state-info";
import { haStyle } from "../resources/styles";
import type { menuai } from "../types";

@customElement("state-card-event")
class StateCardEvent extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj!: menuaiEntity;

  @property({ attribute: "in-dialog", type: Boolean }) public inDialog = false;

  protected render() {
    return html`
      <div class="horizontal justified layout">
        <state-info
          .menuai=${this.menuai}
          .stateObj=${this.stateObj}
          .inDialog=${this.inDialog}
        ></state-info>
        <div class="container">
          <div class="event_type">
            ${this.menuai.formatEntityState(this.stateObj)}
          </div>
          <div class="event_data">
            ${this.menuai.formatEntityAttributeValue(this.stateObj, "event_type")}
          </div>
        </div>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        .container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .event_data {
          color: var(--secondary-text-color);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-event": StateCardEvent;
  }
}
