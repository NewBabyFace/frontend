import type { menuaiEntity } from "home-assistant-js-websocket";
import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";

import "../components/entity/state-info";
import "../components/ha-humidifier-state";
import type { menuai } from "../types";
import { haStyle } from "../resources/styles";

@customElement("state-card-humidifier")
class StateCardHumidifier extends LitElement {
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
        <ha-humidifier-state
          .menuai=${this.menuai}
          .stateObj=${this.stateObj}
        ></ha-humidifier-state>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        :host {
          line-height: var(--ha-line-height-normal);
        }

        ha-humidifier-state {
          margin-left: 16px;
          margin-inline-start: 16px;
          margin-inline-end: initial;
          text-align: var(--float-end);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-humidifier": StateCardHumidifier;
  }
}
