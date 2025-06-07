import { mdiPower, mdiPowerOff } from "@mdi/js";
import type { menuaiEntity } from "home-assistant-js-websocket";
import type { CSSResultGroup } from "lit";
import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../components/ha-attributes";
import "../../../state-control/ha-state-control-toggle";
import type { menuai } from "../../../types";
import "../components/ha-more-info-state-header";
import { moreInfoControlStyle } from "../components/more-info-control-style";

@customElement("more-info-input_boolean")
class MoreInfoInputBoolean extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj?: menuaiEntity;

  protected render() {
    if (!this.menuai || !this.stateObj) {
      return nothing;
    }

    return html`
      <ha-more-info-state-header
        .menuai=${this.menuai}
        .stateObj=${this.stateObj}
      ></ha-more-info-state-header>
      <div class="controls">
        <ha-state-control-toggle
          .stateObj=${this.stateObj}
          .menuai=${this.menuai}
          .iconPathOn=${mdiPower}
          .iconPathOff=${mdiPowerOff}
        ></ha-state-control-toggle>
      </div>
      <ha-attributes
        .menuai=${this.menuai}
        .stateObj=${this.stateObj}
      ></ha-attributes>
    `;
  }

  static get styles(): CSSResultGroup {
    return moreInfoControlStyle;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-input_boolean": MoreInfoInputBoolean;
  }
}
