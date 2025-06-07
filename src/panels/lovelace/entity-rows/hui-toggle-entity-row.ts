import type { PropertyValues } from "lit";
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../../components/entity/ha-entity-toggle";
import { isUnavailableState } from "../../../data/entity";
import type { menuai } from "../../../types";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import "../components/hui-generic-entity-row";
import { createEntityNotFoundWarning } from "../components/hui-warning";
import type { EntityConfig, LovelaceRow } from "./types";

@customElement("hui-toggle-entity-row")
class HuiToggleEntityRow extends LitElement implements LovelaceRow {
  @property({ attribute: false }) public menuai?: menuai;

  @state() private _config?: EntityConfig;

  public setConfig(config: EntityConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render() {
    if (!this._config || !this.menuai) {
      return nothing;
    }

    const stateObj = this.menuai.states[this._config.entity];

    if (!stateObj) {
      return html`
        <hui-warning .menuai=${this.menuai}>
          ${createEntityNotFoundWarning(this.menuai, this._config.entity)}
        </hui-warning>
      `;
    }

    const showToggle =
      stateObj.state === "on" ||
      stateObj.state === "off" ||
      isUnavailableState(stateObj.state);

    return html`
      <hui-generic-entity-row
        .menuai=${this.menuai}
        .config=${this._config}
        .catchInteraction=${!showToggle}
      >
        ${showToggle
          ? html`
              <ha-entity-toggle
                .menuai=${this.menuai}
                .stateObj=${stateObj}
              ></ha-entity-toggle>
            `
          : html`
              <div class="text-content">
                ${this.menuai.formatEntityState(stateObj)}
              </div>
            `}
      </hui-generic-entity-row>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-toggle-entity-row": HuiToggleEntityRow;
  }
}
