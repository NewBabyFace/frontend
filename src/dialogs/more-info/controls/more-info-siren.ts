import { mdiVolumeHigh, mdiVolumeOff } from "@mdi/js";
import type { menuaiEntity } from "home-assistant-js-websocket";
import type { CSSResultGroup } from "lit";
import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../components/ha-attributes";
import "../../../state-control/ha-state-control-toggle";
import "../../../components/ha-button";
import type { menuai } from "../../../types";
import "../components/ha-more-info-state-header";
import { moreInfoControlStyle } from "../components/more-info-control-style";
import { supportsFeature } from "../../../common/entity/supports-feature";
import { SirenEntityFeature } from "../../../data/siren";
import { showSirenAdvancedControlsView } from "../components/siren/show-dialog-siren-advanced-controls";

@customElement("more-info-siren")
class MoreInfoSiren extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj?: menuaiEntity;

  protected render() {
    if (!this.menuai || !this.stateObj) {
      return nothing;
    }

    const supportsTones =
      supportsFeature(this.stateObj, SirenEntityFeature.TONES) &&
      this.stateObj.attributes.available_tones;
    const supportsVolume = supportsFeature(
      this.stateObj,
      SirenEntityFeature.VOLUME_SET
    );
    const supportsDuration = supportsFeature(
      this.stateObj,
      SirenEntityFeature.DURATION
    );
    // show advanced controls dialog if extra features are supported
    const allowAdvanced = supportsTones || supportsVolume || supportsDuration;

    return html`
      <ha-more-info-state-header
        .menuai=${this.menuai}
        .stateObj=${this.stateObj}
      ></ha-more-info-state-header>
      <div class="controls">
        <ha-state-control-toggle
          .stateObj=${this.stateObj}
          .menuai=${this.menuai}
          .iconPathOn=${mdiVolumeHigh}
          .iconPathOff=${mdiVolumeOff}
        ></ha-state-control-toggle>
        ${allowAdvanced
          ? html`<ha-button @click=${this._showAdvancedControlsDialog}>
              ${this.menuai.localize("ui.components.siren.advanced_controls")}
            </ha-button>`
          : nothing}
      </div>
      <ha-attributes
        .menuai=${this.menuai}
        .stateObj=${this.stateObj}
      ></ha-attributes>
    `;
  }

  private _showAdvancedControlsDialog() {
    showSirenAdvancedControlsView(this, this.stateObj!);
  }

  static get styles(): CSSResultGroup {
    return moreInfoControlStyle;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-siren": MoreInfoSiren;
  }
}
