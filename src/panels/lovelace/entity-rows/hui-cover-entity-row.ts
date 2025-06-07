import type { PropertyValues } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../../components/ha-cover-controls";
import "../../../components/ha-cover-tilt-controls";
import type { CoverEntity } from "../../../data/cover";
import { isTiltOnly } from "../../../data/cover";
import type { menuai } from "../../../types";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import "../components/hui-generic-entity-row";
import { createEntityNotFoundWarning } from "../components/hui-warning";
import type { EntityConfig, LovelaceRow } from "./types";

@customElement("hui-cover-entity-row")
class HuiCoverEntityRow extends LitElement implements LovelaceRow {
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

    const stateObj = this.menuai.states[this._config.entity] as CoverEntity;

    if (!stateObj) {
      return html`
        <hui-warning .menuai=${this.menuai}>
          ${createEntityNotFoundWarning(this.menuai, this._config.entity)}
        </hui-warning>
      `;
    }

    return html`
      <hui-generic-entity-row .menuai=${this.menuai} .config=${this._config}>
        ${isTiltOnly(stateObj)
          ? html`
              <ha-cover-tilt-controls
                .menuai=${this.menuai}
                .stateObj=${stateObj}
              ></ha-cover-tilt-controls>
            `
          : html`
              <ha-cover-controls
                .menuai=${this.menuai}
                .stateObj=${stateObj}
              ></ha-cover-controls>
            `}
      </hui-generic-entity-row>
    `;
  }

  static styles = css`
    ha-cover-controls,
    ha-cover-tilt-controls {
      margin-right: -0.57em;
      margin-inline-end: -0.57em;
      margin-inline-start: initial;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-cover-entity-row": HuiCoverEntityRow;
  }
}
