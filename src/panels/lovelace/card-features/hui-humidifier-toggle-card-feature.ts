import { mdiPower, mdiWaterPercent } from "@mdi/js";
import type { PropertyValues, TemplateResult } from "lit";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators";
import { styleMap } from "lit/directives/style-map";
import { computeDomain } from "../../../common/entity/compute_domain";
import { stateColorCss } from "../../../common/entity/state_color";
import "../../../components/ha-control-select";
import type { ControlSelectOption } from "../../../components/ha-control-select";
import { UNAVAILABLE } from "../../../data/entity";
import type {
  HumidifierEntity,
  HumidifierState,
} from "../../../data/humidifier";
import type { menuai } from "../../../types";
import type { LovelaceCardFeature } from "../types";
import { cardFeatureStyles } from "./common/card-feature-styles";
import type {
  HumidifierToggleCardFeatureConfig,
  LovelaceCardFeatureContext,
} from "./types";

export const supportsHumidifierToggleCardFeature = (
  menuai: menuai,
  context: LovelaceCardFeatureContext
) => {
  const stateObj = context.entity_id
    ? menuai.states[context.entity_id]
    : undefined;
  if (!stateObj) return false;
  const domain = computeDomain(stateObj.entity_id);
  return domain === "humidifier";
};

@customElement("hui-humidifier-toggle-card-feature")
class HuiHumidifierToggleCardFeature
  extends LitElement
  implements LovelaceCardFeature
{
  @property({ attribute: false }) public menuai?: menuai;

  @property({ attribute: false }) public context?: LovelaceCardFeatureContext;

  @state() private _config?: HumidifierToggleCardFeatureConfig;

  @state() _currentState?: HumidifierState;

  private get _stateObj() {
    if (!this.menuai || !this.context || !this.context.entity_id) {
      return undefined;
    }
    return this.menuai.states[this.context.entity_id!] as
      | HumidifierEntity
      | undefined;
  }

  static getStubConfig(): HumidifierToggleCardFeatureConfig {
    return {
      type: "humidifier-toggle",
    };
  }

  public setConfig(config: HumidifierToggleCardFeatureConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  protected willUpdate(changedProp: PropertyValues): void {
    super.willUpdate(changedProp);
    if (
      (changedProp.has("menuai") || changedProp.has("context")) &&
      this._stateObj
    ) {
      const oldmenuai = changedProp.get("menuai") as menuai | undefined;
      const oldStateObj = oldmenuai?.states[this.context!.entity_id!];
      if (oldStateObj !== this._stateObj) {
        this._currentState = this._stateObj.state as HumidifierState;
      }
    }
  }

  private async _valueChanged(ev: CustomEvent) {
    const newState = (ev.detail as any).value as HumidifierState;

    if (newState === this._stateObj!.state) return;

    const oldState = this._stateObj!.state as HumidifierState;
    this._currentState = newState;

    try {
      await this._setState(newState);
    } catch (_err) {
      this._currentState = oldState;
    }
  }

  private async _setState(newState: HumidifierState) {
    await this.menuai!.callService(
      "humidifier",
      newState === "on" ? "turn_on" : "turn_off",
      {
        entity_id: this._stateObj!.entity_id,
      }
    );
  }

  protected render(): TemplateResult | null {
    if (
      !this._config ||
      !this.menuai ||
      !this.context ||
      !this._stateObj ||
      !supportsHumidifierToggleCardFeature(this.menuai, this.context)
    ) {
      return null;
    }

    const color = stateColorCss(this._stateObj);

    const options = ["off", "on"].map<ControlSelectOption>((entityState) => ({
      value: entityState,
      label: this.menuai!.formatEntityState(this._stateObj!, entityState),
      path: entityState === "on" ? mdiWaterPercent : mdiPower,
    }));

    return html`
      <ha-control-select
        .options=${options}
        .value=${this._currentState}
        @value-changed=${this._valueChanged}
        hide-label
        .ariaLabel=${this.menuai.localize("ui.card.humidifier.state")}
        style=${styleMap({
          "--control-select-color": color,
        })}
        .disabled=${this._stateObj!.state === UNAVAILABLE}
      >
      </ha-control-select>
    `;
  }

  static get styles() {
    return cardFeatureStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-humidifier-toggle-card-feature": HuiHumidifierToggleCardFeature;
  }
}
