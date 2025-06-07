import type { PropertyValues, TemplateResult } from "lit";
import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../../components/ha-date-input";
import { isUnavailableState, UNAVAILABLE } from "../../../data/entity";
import { setDateValue } from "../../../data/date";
import type { menuai } from "../../../types";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import "../components/hui-generic-entity-row";
import { createEntityNotFoundWarning } from "../components/hui-warning";
import type { EntityConfig, LovelaceRow } from "./types";

@customElement("hui-date-entity-row")
class HuiDateEntityRow extends LitElement implements LovelaceRow {
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

  protected render(): TemplateResult | typeof nothing {
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

    const unavailable = stateObj.state === UNAVAILABLE;

    return html`
      <hui-generic-entity-row .menuai=${this.menuai} .config=${this._config}>
        <ha-date-input
          .locale=${this.menuai.locale}
          .disabled=${unavailable}
          .value=${isUnavailableState(stateObj.state)
            ? undefined
            : stateObj.state}
          @value-changed=${this._dateChanged}
        >
        </ha-date-input>
      </hui-generic-entity-row>
    `;
  }

  private _dateChanged(ev: CustomEvent<{ value: string }>): void {
    if (ev.detail.value) {
      setDateValue(this.menuai!, this._config!.entity, ev.detail.value);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-date-entity-row": HuiDateEntityRow;
  }
}
