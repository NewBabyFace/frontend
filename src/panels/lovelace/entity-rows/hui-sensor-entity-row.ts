import type { PropertyValues } from "lit";
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { isUnavailableState } from "../../../data/entity";
import { SENSOR_DEVICE_CLASS_TIMESTAMP } from "../../../data/sensor";
import type { menuai } from "../../../types";
import type { EntitiesCardEntityConfig } from "../cards/types";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import "../components/hui-generic-entity-row";
import "../components/hui-timestamp-display";
import { createEntityNotFoundWarning } from "../components/hui-warning";
import type { TimestampRenderingFormat } from "../components/types";
import type { LovelaceRow } from "./types";

interface SensorEntityConfig extends EntitiesCardEntityConfig {
  format?: TimestampRenderingFormat;
}

@customElement("hui-sensor-entity-row")
class HuiSensorEntityRow extends LitElement implements LovelaceRow {
  @property({ attribute: false }) public menuai?: menuai;

  @state() private _config?: SensorEntityConfig;

  public setConfig(config: SensorEntityConfig): void {
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

    return html`
      <hui-generic-entity-row .menuai=${this.menuai} .config=${this._config}>
        ${stateObj.attributes.device_class === SENSOR_DEVICE_CLASS_TIMESTAMP &&
        !isUnavailableState(stateObj.state)
          ? html`
              <hui-timestamp-display
                .menuai=${this.menuai}
                .ts=${new Date(stateObj.state)}
                .format=${this._config.format}
                capitalize
              ></hui-timestamp-display>
            `
          : this.menuai.formatEntityState(stateObj)}
      </hui-generic-entity-row>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-sensor-entity-row": HuiSensorEntityRow;
  }
}
