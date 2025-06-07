import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { styleMap } from "lit/directives/style-map";
import { computeCssColor } from "../../../common/color/compute-color";
import { computeAttributeNameDisplay } from "../../../common/entity/compute_attribute_display";
import { computeDomain } from "../../../common/entity/compute_domain";
import { stateActive } from "../../../common/entity/state_active";
import { stateColorCss } from "../../../common/entity/state_color";
import { supportsFeature } from "../../../common/entity/supports-feature";
import "../../../components/ha-control-slider";
import { CoverEntityFeature, type CoverEntity } from "../../../data/cover";
import { UNAVAILABLE } from "../../../data/entity";
import { DOMAIN_ATTRIBUTES_UNITS } from "../../../data/entity_attributes";
import type { menuai } from "../../../types";
import type { LovelaceCardFeature } from "../types";
import { cardFeatureStyles } from "./common/card-feature-styles";
import type {
  CoverPositionCardFeatureConfig,
  LovelaceCardFeatureContext,
} from "./types";

export const supportsCoverPositionCardFeature = (
  menuai: menuai,
  context: LovelaceCardFeatureContext
) => {
  const stateObj = context.entity_id
    ? menuai.states[context.entity_id]
    : undefined;
  if (!stateObj) return false;
  const domain = computeDomain(stateObj.entity_id);
  return (
    domain === "cover" &&
    supportsFeature(stateObj, CoverEntityFeature.SET_POSITION)
  );
};

@customElement("hui-cover-position-card-feature")
class HuiCoverPositionCardFeature
  extends LitElement
  implements LovelaceCardFeature
{
  @property({ attribute: false }) public menuai?: menuai;

  @property({ attribute: false }) public context?: LovelaceCardFeatureContext;

  @property({ attribute: false }) public color?: string;

  @state() private _config?: CoverPositionCardFeatureConfig;

  private get _stateObj() {
    if (!this.menuai || !this.context || !this.context.entity_id) {
      return undefined;
    }
    return this.menuai.states[this.context.entity_id!] as CoverEntity | undefined;
  }

  static getStubConfig(): CoverPositionCardFeatureConfig {
    return {
      type: "cover-position",
    };
  }

  public setConfig(config: CoverPositionCardFeatureConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  protected render() {
    if (
      !this._config ||
      !this.menuai ||
      !this.context ||
      !this._stateObj ||
      !supportsCoverPositionCardFeature(this.menuai, this.context)
    ) {
      return nothing;
    }

    const percentage = stateActive(this._stateObj)
      ? (this._stateObj.attributes.current_position ?? 0)
      : 0;

    const value = Math.max(Math.round(percentage), 0);

    const openColor = stateColorCss(this._stateObj, "open");

    const color = this.color
      ? computeCssColor(this.color)
      : stateColorCss(this._stateObj);

    const style = {
      "--feature-color": color,
      // Use open color for inactive state to avoid grey slider that looks disabled
      "--state-cover-inactive-color": openColor,
    };

    return html`
      <ha-control-slider
        style=${styleMap(style)}
        .value=${value}
        min="0"
        max="100"
        step="1"
        inverted
        show-handle
        @value-changed=${this._valueChanged}
        .ariaLabel=${computeAttributeNameDisplay(
          this.menuai.localize,
          this._stateObj,
          this.menuai.entities,
          "current_position"
        )}
        .disabled=${this._stateObj!.state === UNAVAILABLE}
        .unit=${DOMAIN_ATTRIBUTES_UNITS.cover.current_position}
        .locale=${this.menuai.locale}
      ></ha-control-slider>
    `;
  }

  private _valueChanged(ev: CustomEvent) {
    const value = (ev.detail as any).value;
    if (isNaN(value)) return;

    this.menuai!.callService("cover", "set_cover_position", {
      entity_id: this._stateObj!.entity_id,
      position: value,
    });
  }

  static get styles() {
    return cardFeatureStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-cover-position-card-feature": HuiCoverPositionCardFeature;
  }
}
