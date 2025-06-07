import { customElement, property } from "lit/decorators";
import type { CSSResultGroup, TemplateResult } from "lit";
import { LitElement, css, html } from "lit";
import type { menuaiEntity } from "home-assistant-js-websocket";
import { formatNumber } from "../common/number/format_number";
import { haStyle } from "../resources/styles";
import type { menuai } from "../types";

@customElement("ha-water_heater-state")
export class HaWaterHeaterState extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj!: menuaiEntity;

  protected render(): TemplateResult {
    return html`
      <div class="target">
        <span class="state-label label">
          ${this.menuai.formatEntityState(this.stateObj)}
        </span>
        <span class="label"
          >${this._computeTarget(this.menuai, this.stateObj)}</span
        >
      </div>
    `;
  }

  private _computeTarget(menuai: menuai, stateObj: menuaiEntity) {
    if (!menuai || !stateObj) return null;
    // We're using "!= null" on purpose so that we match both null and undefined.

    if (
      stateObj.attributes.target_temp_low != null &&
      stateObj.attributes.target_temp_high != null
    ) {
      return `${formatNumber(
        stateObj.attributes.target_temp_low,
        this.menuai.locale
      )} – ${formatNumber(
        stateObj.attributes.target_temp_high,
        this.menuai.locale
      )} ${menuai.config.unit_system.temperature}`;
    }
    if (stateObj.attributes.temperature != null) {
      return `${formatNumber(
        stateObj.attributes.temperature,
        this.menuai.locale
      )} ${menuai.config.unit_system.temperature}`;
    }

    return "";
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        :host {
          display: flex;
          flex-direction: column;
          justify-content: center;
          white-space: nowrap;
        }

        .target {
          color: var(--primary-text-color);
        }

        .current {
          color: var(--secondary-text-color);
        }

        .state-label {
          font-weight: var(--ha-font-weight-bold);
        }

        .label {
          direction: ltr;
          display: inline-block;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-water_heater-state": HaWaterHeaterState;
  }
}
